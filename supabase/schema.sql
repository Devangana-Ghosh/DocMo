-- Run this in Supabase SQL Editor
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('patient', 'doctor', 'lab')),
  full_name text not null,
  specialty text,
  mrn text,
  gender text,
  dob date,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  doctor_id uuid not null references public.profiles(id) on delete cascade,
  appointment_date date not null,
  appointment_time text not null,
  appointment_type text not null check (appointment_type in ('In-Person', 'Video Call', 'Phone Call')),
  location text not null,
  reason text not null,
  status text not null default 'Pending' check (status in ('Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected')),
  meeting_link text,
  created_at timestamptz not null default now()
);

create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  doctor_id uuid not null references public.profiles(id) on delete cascade,
  medication_name text not null,
  medication_normalized text,
  rxcui text,
  rxnorm_verified boolean not null default false,
  dosage text not null,
  frequency text not null,
  duration text not null,
  instructions text not null,
  status text not null default 'Active' check (status in ('Active', 'Completed', 'Refill Needed', 'Cancelled')),
  refills_remaining int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  type text not null check (type in ('Report', 'Prescription', 'Lab Result')),
  file_path text not null,
  file_size bigint not null,
  created_at timestamptz not null default now()
);

create table if not exists public.lab_reports (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  test_type text not null,
  file_name text not null,
  file_path text not null,
  status text not null default 'Pending' check (status in ('Pending', 'Completed', 'Reviewed')),
  notes text,
  test_date date not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.appointments enable row level security;
alter table public.prescriptions enable row level security;
alter table public.documents enable row level security;
alter table public.lab_reports enable row level security;
alter table public.contact_messages enable row level security;

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
  limit 1;
$$;

drop policy if exists "profiles_self_or_staff_read" on public.profiles;
create policy "profiles_self_or_staff_read" on public.profiles
for select to authenticated
using (
  auth.uid() = id
  or public.current_profile_role() in ('doctor', 'lab')
);

drop policy if exists "profiles_doctor_directory_read" on public.profiles;
create policy "profiles_doctor_directory_read" on public.profiles
for select to authenticated
using (role = 'doctor');

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "appointments_patient_read" on public.appointments;
create policy "appointments_patient_read" on public.appointments
for select to authenticated
using (patient_id = auth.uid() or doctor_id = auth.uid());

drop policy if exists "appointments_patient_insert" on public.appointments;
create policy "appointments_patient_insert" on public.appointments
for insert to authenticated
with check (patient_id = auth.uid());

drop policy if exists "appointments_patient_cancel" on public.appointments;
create policy "appointments_patient_cancel" on public.appointments
for update to authenticated
using (patient_id = auth.uid() or doctor_id = auth.uid())
with check (patient_id = auth.uid() or doctor_id = auth.uid());

drop policy if exists "prescriptions_read_by_owner" on public.prescriptions;
create policy "prescriptions_read_by_owner" on public.prescriptions
for select to authenticated
using (patient_id = auth.uid() or doctor_id = auth.uid());

drop policy if exists "prescriptions_doctor_update" on public.prescriptions;
create policy "prescriptions_doctor_update" on public.prescriptions
for update to authenticated
using (doctor_id = auth.uid())
with check (doctor_id = auth.uid());

drop policy if exists "prescriptions_doctor_delete" on public.prescriptions;
create policy "prescriptions_doctor_delete" on public.prescriptions
for delete to authenticated
using (doctor_id = auth.uid());

drop policy if exists "prescriptions_doctor_insert" on public.prescriptions;
create policy "prescriptions_doctor_insert" on public.prescriptions
for insert to authenticated
with check (
  doctor_id = auth.uid()
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'doctor')
);

drop policy if exists "prescriptions_patient_update_refill" on public.prescriptions;
create policy "prescriptions_patient_update_refill" on public.prescriptions
for update to authenticated
using (patient_id = auth.uid())
with check (patient_id = auth.uid());

drop policy if exists "documents_patient_read" on public.documents;
create policy "documents_patient_read" on public.documents
for select to authenticated
using (patient_id = auth.uid());

drop policy if exists "documents_doctor_careteam_read" on public.documents;
create policy "documents_doctor_careteam_read" on public.documents
for select to authenticated
using (
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

drop policy if exists "documents_patient_insert" on public.documents;
create policy "documents_patient_insert" on public.documents
for insert to authenticated
with check (patient_id = auth.uid());

drop policy if exists "documents_patient_delete" on public.documents;
create policy "documents_patient_delete" on public.documents
for delete to authenticated
using (patient_id = auth.uid());

drop policy if exists "lab_reports_staff_read" on public.lab_reports;
create policy "lab_reports_staff_read" on public.lab_reports
for select to authenticated
using (
  uploaded_by = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('doctor', 'lab'))
  or patient_id = auth.uid()
);

drop policy if exists "lab_reports_staff_update" on public.lab_reports;
create policy "lab_reports_staff_update" on public.lab_reports
for update to authenticated
using (
  uploaded_by = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('doctor', 'lab'))
)
with check (
  uploaded_by = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('doctor', 'lab'))
);

create policy "contact_messages_public_insert" on public.contact_messages
for insert to anon, authenticated
with check (true);

drop policy if exists "lab_reports_lab_insert" on public.lab_reports;
create policy "lab_reports_lab_insert" on public.lab_reports
for insert to authenticated
with check (
  uploaded_by = auth.uid()
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'lab')
);

insert into storage.buckets (id, name, public)
values ('patient-documents', 'patient-documents', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('lab-reports', 'lab-reports', true)
on conflict (id) do nothing;

drop policy if exists "patient_documents_owner_rw" on storage.objects;
create policy "patient_documents_owner_rw" on storage.objects
for all to authenticated
using (bucket_id = 'patient-documents' and (auth.uid())::text = (storage.foldername(name))[1])
with check (bucket_id = 'patient-documents' and (auth.uid())::text = (storage.foldername(name))[1]);

drop policy if exists "lab_reports_lab_rw" on storage.objects;
create policy "lab_reports_lab_rw" on storage.objects
for all to authenticated
using (bucket_id = 'lab-reports' and (auth.uid())::text = (storage.foldername(name))[1])
with check (bucket_id = 'lab-reports' and (auth.uid())::text = (storage.foldername(name))[1]);
