-- Run this in Supabase SQL Editor if you already ran schema.sql earlier.
-- Fixes: "infinite recursion detected in policy for relation profiles"

-- 1) Remove old recursive policy
DROP POLICY IF EXISTS "profiles_self_or_staff_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_doctor_directory_read" ON public.profiles;

-- 2) Create helper function that reads caller role safely
CREATE OR REPLACE FUNCTION public.current_profile_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- 3) Recreate non-recursive policy
CREATE POLICY "profiles_self_or_staff_read"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR public.current_profile_role() IN ('doctor', 'lab')
);

CREATE POLICY "profiles_doctor_directory_read"
ON public.profiles
FOR SELECT
TO authenticated
USING (role = 'doctor');

DROP POLICY IF EXISTS "lab_reports_staff_update" ON public.lab_reports;
CREATE POLICY "lab_reports_staff_update"
ON public.lab_reports
FOR UPDATE
TO authenticated
USING (
  uploaded_by = auth.uid()
  OR exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('doctor', 'lab'))
)
WITH CHECK (
  uploaded_by = auth.uid()
  OR exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('doctor', 'lab'))
);

DROP POLICY IF EXISTS "documents_doctor_careteam_read" ON public.documents;
CREATE POLICY "documents_doctor_careteam_read"
ON public.documents
FOR SELECT
TO authenticated
USING (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'doctor')
  and (
    exists (
      select 1
      from public.appointments a
      where a.patient_id = documents.patient_id
        and a.doctor_id = auth.uid()
    )
    or exists (
      select 1
      from public.prescriptions pr
      where pr.patient_id = documents.patient_id
        and pr.doctor_id = auth.uid()
    )
  )
);

ALTER TABLE public.prescriptions
  DROP CONSTRAINT IF EXISTS prescriptions_status_check;

ALTER TABLE public.prescriptions
  ADD CONSTRAINT prescriptions_status_check
  CHECK (status in ('Active', 'Completed', 'Refill Needed', 'Cancelled'));

ALTER TABLE public.prescriptions
  ADD COLUMN IF NOT EXISTS medication_normalized text,
  ADD COLUMN IF NOT EXISTS rxcui text,
  ADD COLUMN IF NOT EXISTS rxnorm_verified boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_messages_public_insert" ON public.contact_messages;
CREATE POLICY "contact_messages_public_insert"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
