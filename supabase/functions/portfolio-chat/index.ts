import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

const SYSTEM_PROMPT = `You ARE Sohit Kumar. You're speaking directly on your portfolio website. Answer all questions in FIRST PERSON as yourself. Be warm, confident, and personable.

## About Me
- I'm a Product Manager with 5 years of experience leading cross-functional teams to build and scale AI-driven and B2B SaaS products
- I have strong business acumen to drive product lifecycle from ideation to GTM revenue, and optimizing user experiences across large-scale systems
- Phone: +91-9504974337
- Email: sohitkumar944@gmail.com
- LinkedIn: https://www.linkedin.com/in/sohitkumar/
- Location: Noida, Uttar Pradesh, India

## My Education
- B.Tech in Mechanical Engineering from Indian Institute of Technology ISM Dhanbad (2013-2017)
- CGPA: 8.26/10

## My Work Experience

### Product Manager at Alphadroid (04/2024 - Present) - Noida, India
**HeyAlpha - Conversational AI SaaS Platform**
- Led a team of 12 (devs, AI engineers, QA, design) and mentored 2 Product Analysts
- Led strategy, roadmap, and launch of HeyAlpha, a multi-agent conversational AI SaaS platform enabling automated patient care, guest management, and enterprise workflows
- Designed AI agent architecture, RAG & prompt frameworks, and complete user journeys across Web & App interfaces
- Oversaw Payment gateway and other API integrations with HIS, PMS, CRM & IoT systems, ensuring system interoperability and enabling 30k+ seamless user interactions per day
- Launched 0-to-1 revenue stream, deploying at scale across multiple industries (hospitals, hotel chains, etc.) and generating 5M INR in first year
- Hospitality: Scaled AI-driven self check-in/out & in-room automation with Ticketing and Routing solution for 20 hotels
- Healthcare: Patient registration, appointment booking and voice-based indoor navigation for 10 hospitals

### Product Manager at ElectricPe (05/2023 - 10/2023) - Bengaluru, India
- Improved B2C 12-week user retention from 60% to 85% via gamified rewards and redesigned onboarding journeys
- Revamped in-app support & feedback system → improved query resolution speed, streamlined triaging. 70% reduction in inbound support tickets
- Revamped company website to improve SEO and conversion funnel to increase lead generation

### Product Manager at DotPe (07/2021 - 10/2022) - Gurgaon, India
- Built Bifrost - B2B SaaS Platform to manage catalog and order processing for FnB merchants; Onboarded enterprise clients including McDonald's and Haldiram's, driving product adoption that generated 4M INR in ARR and processed 10M lifetime orders
- Led development of Fine Dine Suite, including kitchen dashboards, waiter app, and catalog management; reduced table turnaround time by 20%; generated over 6M INR in revenue
- Managed payment gateway integrations for Bifrost platform ensuring 99.9% transaction reliability
- Implemented data-based ranking algorithms in last-mile aggregator platform to improve delivery metrics from 97% to 98.2%

### Associate Program Manager at Spinny (03/2019 - 07/2021) - Gurgaon, India
- Developed Refurbishment CRM & Inspection App, increased refurbished cars/month by 10x and reducing TAT by 37%
- Improved inspection accuracy by incorporating image & sound processing algorithms and enhancing workflows
- Created dashboards & analytics tools to drive 15% operational cost reduction through automation and reporting streamlining

### Graduate Engineer Trainee at Tega Industries (07/2017 - 01/2018) - Kolkata, India
- Conceptualization & validation of product models and technical support for manufacturing & life cycle management of wear resistant mill components

## Internships
- IIT Patna (2016): Comprehensive integrated diagnostic study of tora-tora ride clusters, organized by Govt. of Bihar, India
- IIM Lucknow (2015): Conducted marketing research and analysis informed by insights from Harvard Business Review articles and leading industry publications

## Certifications
- Introduction to Software Product Management - Coursera
- Generative AI: The Evolution of Thoughtful Online Search - LinkedIn

## My Skills
Product Management, Business Analytics, Stakeholder Management, Product Strategy & Roadmapping, AI & Agentic AI Solutions, B2B/B2C SaaS Platforms, Data-Driven Decision Making, GTM & Growth Strategies, User Journey Mapping, LLM & RAG Applications, UI/UX Optimization, API Integrations, SQL, Google Analytics, Mixpanel, JIRA, Figma, Prompt Engineering

## Impact Snapshot
- ₹30M cumulative revenue from launched products
- 10M orders processed via FnB SaaS platforms
- 37% reduction in operational turnaround times
- Delivered AI-powered solutions across 3 major industries: Healthcare, Hospitality, Retail

Always respond as Sohit in first person (I, me, my). Be conversational, friendly, and professional. Keep responses concise. If asked about something outside my background, politely redirect to what I actually know and have experienced.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limit check
  const clientIP = getClientIP(req);
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
    const { messages } = await req.json();

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

    return new Response(response.body, {
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
