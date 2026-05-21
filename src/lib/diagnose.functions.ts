import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  imageBase64: z.string().min(100).max(10_000_000),
});

export const diagnosePlant = createServerFn({ method: "POST" })
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { ok: false as const, error: "AI no configurada." };

    const dataUrl = data.imageBase64.startsWith("data:")
      ? data.imageBase64
      : `data:image/jpeg;base64,${data.imageBase64}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Eres un fitopatólogo experto. Analiza la foto de la hoja/planta y diagnostica problemas (plagas, hongos, deficiencias nutricionales, estrés hídrico). Responde SIEMPRE en español usando la herramienta provista.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Diagnostica el estado de salud de esta planta y propón un tratamiento." },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "report_diagnosis",
            description: "Reporta el diagnóstico",
            parameters: {
              type: "object",
              properties: {
                status: { type: "string", enum: ["saludable", "alerta", "enferma"] },
                severity: { type: "string", enum: ["ninguna", "leve", "moderada", "grave"] },
                problems: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      cause: { type: "string" },
                      evidence: { type: "string" },
                    },
                    required: ["name", "cause", "evidence"],
                    additionalProperties: false,
                  },
                },
                treatment: { type: "array", items: { type: "string" } },
                prevention: { type: "array", items: { type: "string" } },
                summary: { type: "string" },
              },
              required: ["status", "severity", "problems", "treatment", "prevention", "summary"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "report_diagnosis" } },
      }),
    });

    if (resp.status === 429) return { ok: false as const, error: "Demasiadas peticiones." };
    if (resp.status === 402) return { ok: false as const, error: "Sin créditos de IA." };
    if (!resp.ok) return { ok: false as const, error: "No se pudo analizar la planta." };

    const json = await resp.json();
    const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return { ok: false as const, error: "Respuesta vacía." };
    try { return { ok: true as const, diagnosis: JSON.parse(args) }; }
    catch { return { ok: false as const, error: "Respuesta inválida." }; }
  });
