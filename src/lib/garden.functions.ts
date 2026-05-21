import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CareSchema = z.object({
  light: z.string(),
  water: z.string(),
  soil: z.string(),
  temperature: z.string(),
}).partial();

const SavePlantSchema = z.object({
  common_name: z.string().min(1).max(120),
  scientific_name: z.string().max(160).optional().nullable(),
  family: z.string().max(120).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  care: CareSchema.optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  location_label: z.string().max(200).optional().nullable(),
  water_every_days: z.number().int().min(1).max(120).default(7),
});

export const listPlants = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("plants")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getPlant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: plant, error } = await context.supabase
      .from("plants").select("*").eq("id", data.id).single();
    if (error) throw new Error(error.message);
    return plant;
  });

export const savePlant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => SavePlantSchema.parse(i))
  .handler(async ({ data, context }) => {
    const next = new Date(Date.now() + data.water_every_days * 86400000).toISOString();
    const { data: row, error } = await context.supabase
      .from("plants")
      .insert({
        ...data,
        user_id: context.userId,
        next_water_at: next,
        last_watered_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const waterPlant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: cur } = await context.supabase
      .from("plants").select("water_every_days").eq("id", data.id).single();
    const days = cur?.water_every_days ?? 7;
    const now = new Date();
    const next = new Date(now.getTime() + days * 86400000);
    const { error } = await context.supabase
      .from("plants")
      .update({ last_watered_at: now.toISOString(), next_water_at: next.toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePlant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("plants").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
