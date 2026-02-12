import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { timingSafeEqual } from "https://deno.land/std@0.168.0/crypto/timing_safe_equal.ts";

// Constant-time password comparison to prevent timing attacks
function secureCompare(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const maxLength = Math.max(a.length, b.length);
  const aBytes = encoder.encode(a.padEnd(maxLength, '\0'));
  const bBytes = encoder.encode(b.padEnd(maxLength, '\0'));
  return timingSafeEqual(aBytes, bBytes);
}

const ALLOWED_ORIGINS = [
  'https://osascvnpktwzifnafabj.lovableproject.com',
  'https://sohit-kumar.com',
  'https://sohit.me',
  'http://localhost:5173',
  'http://localhost:8080',
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.endsWith('.lovableproject.com')
  ) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
};

// Parse cookies from request
function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [key, ...v] = c.trim().split('=');
      return [key, v.join('=')];
    })
  );
}

// Rate limiting configuration for brute-force protection
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 5; // Max failed attempts before lockout
const rateLimitMap = new Map<string, { count: number; resetTime: number; lockedUntil?: number }>();

function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         req.headers.get('x-real-ip') || 
         'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    return { allowed: true };
  }

  // Check if IP is locked out
  if (record.lockedUntil && now < record.lockedUntil) {
    const retryAfter = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Reset if window has passed
  if (now > record.resetTime) {
    rateLimitMap.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
  } else {
    record.count++;
    if (record.count >= MAX_FAILED_ATTEMPTS) {
      // Lock out for increasing duration based on attempts (exponential backoff)
      const lockoutMinutes = Math.min(60, Math.pow(2, record.count - MAX_FAILED_ATTEMPTS + 1));
      record.lockedUntil = now + (lockoutMinutes * 60 * 1000);
      console.log(`IP ${ip} locked out for ${lockoutMinutes} minutes after ${record.count} failed attempts`);
    }
  }
}

function clearFailedAttempts(ip: string): void {
  rateLimitMap.delete(ip);
}

// Generate a cryptographically secure random token
function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { password, action } = await req.json();
    
    // Read token from HttpOnly cookie for validate/logout actions
    const cookies = parseCookies(req.headers.get('cookie'));
    const cookieToken = cookies['admin_token'];
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle token validation for existing sessions
    if (action === 'validate') {
      if (!cookieToken) {
        return new Response(
          JSON.stringify({ valid: false }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const { data: session, error } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('token', cookieToken)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !session) {
        return new Response(
          JSON.stringify({ valid: false }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ valid: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle logout
    if (action === 'logout') {
      if (cookieToken) {
        await supabase
          .from('admin_sessions')
          .delete()
          .eq('token', cookieToken);
      }

      // Clear the cookie
      const clearCookie = 'admin_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/';
      
      return new Response(
        JSON.stringify({ success: true }),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Set-Cookie': clearCookie
          } 
        }
      );
    }

    // Handle password verification and login
    if (!password || typeof password !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Password required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limit before password verification
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(clientIP);
    
    if (!rateLimit.allowed) {
      console.log(`Rate limited IP ${clientIP} attempting admin login`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Too many failed attempts. Please try again later.',
          retryAfter: rateLimit.retryAfter 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminPassword = Deno.env.get('ADMIN_PASSWORD');
    
    if (!adminPassword) {
      console.error('Required configuration missing');
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isValid = secureCompare(password, adminPassword);
    
    if (!isValid) {
      // Record failed attempt for rate limiting
      recordFailedAttempt(clientIP);
      console.log(`Failed admin login attempt from IP ${clientIP}`);
      return new Response(
        JSON.stringify({ success: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clear failed attempts on successful login
    clearFailedAttempts(clientIP);

    // Generate secure session token
    const sessionToken = generateSecureToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Clean up old expired sessions
    await supabase
      .from('admin_sessions')
      .delete()
      .lt('expires_at', new Date().toISOString());

    // Store session in database
    const { error: insertError } = await supabase
      .from('admin_sessions')
      .insert({
        token: sessionToken,
        expires_at: expiresAt.toISOString()
      });

    if (insertError) {
      console.error('Session creation failed');
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Set HttpOnly cookie for the session token
    const cookieOptions = [
      `admin_token=${sessionToken}`,
      'HttpOnly',
      'Secure',
      'SameSite=Strict',
      `Max-Age=${24 * 60 * 60}`, // 24 hours
      'Path=/'
    ].join('; ');

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Set-Cookie': cookieOptions
        } 
      }
    );
  } catch (error) {
    console.error('Admin verification failed');
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid request' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
