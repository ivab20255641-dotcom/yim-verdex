import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  imageBase64: z.string().min(100).max(10_000_000),
});

export const identifyPlant = createServerFn({ method: "POST" })
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "AI no configurada." };
    }

    const dataUrl = data.imageBase64.startsWith("data:")
      ? data.imageBase64
      : `data:image/jpeg;base64,${data.imageBase64}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Eres un botánico experto. Identifica la planta en la foto y responde SIEMPRE en español usando la herramienta provista.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Identifica esta planta. Si no es una planta, indícalo en notes." },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_plant",
              description: "Reporta la identificación de la planta",
              parameters: {
                type: "object",
                properties: {
                  commonName: { type: "string", description: "Nombre común" },
                  scientificName: { type: "string", description: "Nombre científico" },
                  family: { type: "string" },
                  confidence: { type: "string", enum: ["alta", "media", "baja"] },
                  description: { type: "string", description: "Descripción breve, 2-3 frases" },
                  care: {
                    type: "object",
                    properties: {
                      light: { type: "string" },
                      water: { type: "string" },
                      soil: { type: "string" },
                      temperature: { type: "string" },
                    },
                    required: ["light", "water", "soil", "temperature"],
                    additionalProperties: false,
                  },
                  funFact: { type: "string" },
                  notes: { type: "string" },
                },
                required: ["commonName", "scientificName", "family", "confidence", "description", "care", "funFact", "notes"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_plant" } },
      }),
    });

    if (resp.status === 429) return { ok: false as const, error: "Demasiadas peticiones, intenta en un momento." };
    if (resp.status === 402) return { ok: false as const, error: "Sin créditos de IA. Recarga tu workspace." };
    if (!resp.ok) {
      const text = await resp.text();
      console.error("AI error", resp.status, text);
      return { ok: false as const, error: "No se pudo identificar la planta." };
    }

    const json = await resp.json();
    const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return { ok: false as const, error: "Respuesta vacía de la IA." };
    try {
      return { ok: true as const, plant: JSON.parse(args) };
    } catch {
      return { ok: false as const, error: "Respuesta inválida de la IA." };
    }
  });
