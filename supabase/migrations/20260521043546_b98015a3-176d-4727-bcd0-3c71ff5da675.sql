-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Plants (Mi jardín)
CREATE TABLE public.plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  common_name TEXT NOT NULL,
  scientific_name TEXT,
  family TEXT,
  description TEXT,
  image_url TEXT,
  care JSONB,
  notes TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location_label TEXT,
  water_every_days INTEGER DEFAULT 7,
  last_watered_at TIMESTAMPTZ,
  next_water_at TIMESTAMPTZ,
  health_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plants_select_own" ON public.plants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "plants_insert_own" ON public.plants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "plants_update_own" ON public.plants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "plants_delete_own" ON public.plants FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX plants_user_idx ON public.plants(user_id, created_at DESC);
CREATE TRIGGER plants_updated_at BEFORE UPDATE ON public.plants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for plant photos
INSERT INTO storage.buckets (id, name, public) VALUES ('plants', 'plants', true);
CREATE POLICY "plants_bucket_read" ON storage.objects FOR SELECT USING (bucket_id = 'plants');
CREATE POLICY "plants_bucket_insert" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'plants' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "plants_bucket_update" ON storage.objects FOR UPDATE USING (
  bucket_id = 'plants' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "plants_bucket_delete" ON storage.objects FOR DELETE USING (
  bucket_id = 'plants' AND auth.uid()::text = (storage.foldername(name))[1]
);