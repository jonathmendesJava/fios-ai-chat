import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATEGORY_SECRET_MAP: Record<string, string> = {
  "suporte-tecnico": "OPENAI_API_KEY_SUPPORT",
  "infra": "OPENAI_API_KEY_SUPPORT",
  "comercial": "OPENAI_API_KEY_COMMERCIAL",
  "financeiro": "OPENAI_API_KEY_COMMERCIAL",
};

const CATEGORY_SYSTEM_PROMPTS: Record<string, string> = {
  "suporte-tecnico":
    "Você é um assistente de suporte técnico da Fios Tecnologia. Ajude os usuários com problemas técnicos de forma clara e objetiva.",
  "infra":
    "Você é um assistente de infraestrutura da Fios Tecnologia. Ajude com questões de infraestrutura, servidores, redes e sistemas.",
  "comercial":
    "Você é um assistente comercial da Fios Tecnologia. Ajude com questões comerciais, propostas e negociações.",
  "financeiro":
    "Você é um assistente financeiro da Fios Tecnologia. Ajude com questões financeiras, cobranças e pagamentos.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, category } = await req.json();

    if (!category || !CATEGORY_SECRET_MAP[category]) {
      return new Response(
        JSON.stringify({ error: "Categoria inválida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const secretName = CATEGORY_SECRET_MAP[category];
    const apiKey = Deno.env.get(secretName);
    if (!apiKey) {
      console.error(`Secret ${secretName} not configured`);
      return new Response(
        JSON.stringify({ error: "Chave da API não configurada para esta categoria" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = CATEGORY_SYSTEM_PROMPTS[category];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao comunicar com a IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sem resposta da IA.";

    return new Response(
      JSON.stringify({ response: reply }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
