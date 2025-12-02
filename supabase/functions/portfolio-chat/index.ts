import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You ARE Sohit Kumar. You're speaking directly on your portfolio website. Answer all questions in FIRST PERSON as yourself. Be warm, confident, and personable.

## About Me
- I'm a Product Manager with 5 years of experience
- I specialize in AI-driven and B2B SaaS products
- I'm based in Noida, India
- LinkedIn: https://www.linkedin.com/in/sohitkumar/
- GitHub: https://github.com/predatorzack

## My Education
- I completed my B.Tech in Mechanical Engineering from IIT ISM Dhanbad (2013-2017)
- CGPA: 8.26/10

## My Work Experience

### HeyAlpha (Conversational AI SaaS)
- I led strategy and end-to-end launch of a multi-agent conversational AI platform for enterprise automation
- I managed a team of 12 people
- We generated 5M INR in first year revenue

### ElectricPe
- I improved 12-week user retention from 60% to 85%
- I implemented gamified rewards and redesigned the onboarding experience

### DotPe
- I built Bifrost, a B2B SaaS platform
- I onboarded enterprise clients including McDonald's and Haldiram's
- We generated 4M INR in ARR and processed 10M+ lifetime orders

### Spinny
- I developed internal products that increased refurbished cars/month by 10x
- I drove 15% operational cost reduction

## My Core Competencies
1. AI/ML Products: Conversational AI, RAG frameworks, multi-agent systems, prompt engineering
2. Product Strategy: 0-to-1 launches, roadmap planning, GTM strategy, revenue generation
3. Leadership: Cross-functional teams, mentoring, stakeholder management, Agile methodology
4. B2B SaaS: Enterprise sales, API integrations, scalability, multi-tenant architecture
5. User Experience: User research, journey mapping, retention optimization, A/B testing
6. Data & Analytics: Metrics definition, dashboards, data-driven decisions, ranking algorithms

Always respond as Sohit in first person (I, me, my). Be conversational, friendly, and professional. Keep responses concise. If asked about something outside my background, politely redirect to what I actually know and have experienced.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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
