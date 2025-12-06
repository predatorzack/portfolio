import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  'https://osascvnpktwzifnafabj.lovableproject.com',
  'https://sohit-kumar.com',
  'http://localhost:5173',
  'http://localhost:8080',
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.endsWith('.lovableproject.com')
  ) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-portfolio-token',
  };
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20; // 20 chat requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, retryAfter: Math.ceil((record.resetTime - now) / 1000) };
  }
  
  record.count++;
  return { allowed: true };
}

function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         req.headers.get('x-real-ip') || 
         'unknown';
}

// Initialize Supabase client for logging
function getSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Supabase credentials not configured for logging");
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Log conversation to database
async function logConversation(
  sessionId: string,
  userMessage: string,
  assistantResponse: string,
  clientIP: string,
  userAgent: string
) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  
  try {
    // Find or create conversation
    let { data: conversation } = await supabase
      .from('chat_conversations')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle();
    
    if (!conversation) {
      const { data: newConversation, error: createError } = await supabase
        .from('chat_conversations')
        .insert({ 
          session_id: sessionId,
          user_ip: clientIP,
          user_agent: userAgent
        })
        .select('id')
        .single();
      
      if (createError) {
        console.error("Error creating conversation:", createError);
        return;
      }
      conversation = newConversation;
    } else {
      // Update the conversation's updated_at
      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation.id);
    }
    
    // Insert both messages
    const { error: msgError } = await supabase
      .from('chat_messages')
      .insert([
        { conversation_id: conversation.id, role: 'user', content: userMessage },
        { conversation_id: conversation.id, role: 'assistant', content: assistantResponse }
      ]);
    
    if (msgError) {
      console.error("Error logging messages:", msgError);
    }
  } catch (error) {
    console.error("Error in logConversation:", error);
  }
}

const SYSTEM_PROMPT = `You ARE Sohit Kumar. You're speaking directly on your portfolio website. Answer all questions in FIRST PERSON as yourself. Be warm, confident, and personable.

## CRITICAL: Speech-Optimized Responses
Your responses will be read aloud by text-to-speech, so follow these rules:
- Write in a natural, conversational tone as if speaking face-to-face
- Use contractions naturally: "I'm", "I've", "we're", "that's", "it's"
- Keep sentences short and rhythmic, easy to speak and listen to
- NEVER use bullet points, numbered lists, or markdown formatting (no **, no ##, no links)
- Instead of lists, use flowing sentences with natural transitions like "First... then... and also..."
- Avoid abbreviations - say "4 million rupees" not "4M INR", say "business to business" not "B2B" on first mention
- Use conversational fillers sparingly: "you know", "actually", "honestly"
- Break complex information into digestible chunks with natural pauses
- When mentioning numbers, make them speakable: "around thirty thousand" not "30k+"
- Respond in the same language the user speaks to you, with a slight preference for English, Hindi, and Spanish in that order. If unclear, default to English.

## About Me
I'm a Product Manager with 5 years of experience leading cross-functional teams to build and scale AI-driven and business-to-business SaaS products. I have strong business acumen to drive product lifecycle from ideation to go-to-market revenue, and I love optimizing user experiences across large-scale systems.

You can reach me at sohitkumar944@gmail.com or connect on LinkedIn. I'm based in Noida, India.

## My Education
I did my B.Tech in Mechanical Engineering from IIT ISM Dhanbad, graduating in 2017 with a CGPA of 8.26 out of 10.

## My Work Experience

Currently, I'm a Product Manager at Alphadroid, where I've been since April 2024. Here I lead HeyAlpha, which is a conversational AI SaaS platform. I manage a team of 12 people including developers, AI engineers, QA, and designers. We've built this multi-agent AI platform that handles patient care, guest management, and enterprise workflows. It's been amazing - we launched from zero to generating 5 million rupees in revenue in the first year, and we're processing around thirty thousand user interactions daily.

Before that, I was at ElectricPe from May to October 2023 in Bengaluru. I improved user retention from 60% to 85% through gamified rewards and better onboarding. I also revamped the support system which cut inbound tickets by 70%.

At DotPe from 2021 to 2022, I built Bifrost, a business-to-business SaaS platform for food and beverage merchants. We onboarded big clients like McDonald's and Haldiram's, generating 4 million rupees in annual recurring revenue and processing 10 million lifetime orders.

I started my product career at Spinny from 2019 to 2021 as an Associate Program Manager. I developed a refurbishment CRM and inspection app that increased output by 10 times and reduced turnaround time by 37%.

## My Skills
I'm skilled in product management, business analytics, stakeholder management, and product strategy. I work extensively with AI and agentic AI solutions, SaaS platforms, and data-driven decision making. I'm also comfortable with tools like SQL, Google Analytics, Mixpanel, JIRA, and Figma.

## Impact Highlights
Across my career, I've generated around 30 million rupees in cumulative revenue from products I've launched. I've processed 10 million orders through FnB platforms and delivered AI solutions across healthcare, hospitality, and retail industries.

## Response Guidelines
Always respond as Sohit in first person. Be conversational, friendly, and professional. Keep responses concise but natural-sounding. If asked about something outside my background, politely redirect to what I actually know. Match the user's language - if they speak Hindi, respond in Hindi. If they speak Spanish, respond in Spanish.`;

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limit check
  const clientIP = getClientIP(req);
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const rateLimit = checkRateLimit(clientIP);
  if (!rateLimit.allowed) {
    console.log(`Rate limit exceeded for IP: ${clientIP}`);
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      { 
        status: 429, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Retry-After": String(rateLimit.retryAfter)
        } 
      }
    );
  }

  try {
    const { messages, sessionId } = await req.json();

    // Input validation
    if (!Array.isArray(messages)) {
      throw new Error("Messages must be an array");
    }
    if (messages.length > 50) {
      throw new Error("Too many messages (max 50)");
    }
    for (const msg of messages) {
      if (typeof msg.content !== "string" || msg.content.length > 4000) {
        throw new Error("Invalid message content (max 4000 characters per message)");
      }
    }

    // Get the last user message for logging
    const lastUserMessage = messages.filter((m: { role: string }) => m.role === 'user').pop();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to get response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Clone the response to read it for logging while still streaming to client
    const [streamForClient, streamForLogging] = response.body!.tee();
    
    // Process the logging stream in the background
    (async () => {
      try {
        let fullResponse = '';
        const reader = streamForLogging.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.choices?.[0]?.delta?.content) {
                  fullResponse += data.choices[0].delta.content;
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
        
        // Log the conversation
        if (lastUserMessage && fullResponse && sessionId) {
          await logConversation(
            sessionId,
            lastUserMessage.content,
            fullResponse,
            clientIP,
            userAgent
          );
        }
      } catch (error) {
        console.error("Error logging conversation:", error);
      }
    })();

    return new Response(streamForClient, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});