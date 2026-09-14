-- Panda Lingua authentication and lightweight administration migration
BEGIN;
ALTER TABLE public.profiles
 ADD COLUMN IF NOT EXISTS email TEXT,
 ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'learner',
 ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
 ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN NOT NULL DEFAULT TRUE,
 ADD COLUMN IF NOT EXISTS ban_reason TEXT,
 ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ,
 ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;
DO $$ BEGIN ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin','learner')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.profiles ADD CONSTRAINT profiles_status_check CHECK (status IN ('active','banned')); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
INSERT INTO public.profiles (id,email,display_name)
SELECT u.id,lower(u.email),COALESCE(u.raw_user_meta_data->>'name',split_part(u.email,'@',1),'Học viên Panda') FROM auth.users u
ON CONFLICT (id) DO UPDATE SET email=EXCLUDED.email;
CREATE OR REPLACE FUNCTION public.is_admin(check_uid UUID DEFAULT auth.uid()) RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id=check_uid AND role='admin' AND status='active'); $$;
REVOKE ALL ON FUNCTION public.is_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated,service_role;
DROP POLICY IF EXISTS "Users own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins read profiles" ON public.profiles;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING(auth.uid()=id);
CREATE POLICY "Admins read profiles" ON public.profiles FOR SELECT TO authenticated USING(public.is_admin(auth.uid()));
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$ BEGIN INSERT INTO public.profiles(id,email,display_name) VALUES(NEW.id,lower(NEW.email),COALESCE(NEW.raw_user_meta_data->>'name',split_part(NEW.email,'@',1))) ON CONFLICT(id) DO UPDATE SET email=EXCLUDED.email; RETURN NEW; END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path=public;
UPDATE public.profiles SET role='admin',status='active',ai_enabled=TRUE,ban_reason=NULL,banned_at=NULL WHERE email='hah4327@gmail.com';
COMMIT;
