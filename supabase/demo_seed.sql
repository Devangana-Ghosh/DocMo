-- Run AFTER creating 3 Auth users in Supabase Authentication > Users.
-- Recommended demo users to create (Email/Password auth):
-- 1) patient.demo@docmo.app / Demo@12345
-- 2) doctor.demo@docmo.app  / Demo@12345
-- 3) lab.demo@docmo.app     / Demo@12345

do $$
declare
  existing_users_count int;
begin
  select count(*)
  into existing_users_count
  from auth.users
  where email in ('patient.demo@docmo.app', 'doctor.demo@docmo.app', 'lab.demo@docmo.app');

  if existing_users_count <> 3 then
    raise exception 'Missing demo auth users. Create these users first: patient.demo@docmo.app, doctor.demo@docmo.app, lab.demo@docmo.app';
  end if;
end $$;

-- Fetch user ids from auth.users by email
with users_map as (
  select id, email
  from auth.users
  where email in ('patient.demo@docmo.app', 'doctor.demo@docmo.app', 'lab.demo@docmo.app')
)
insert into public.profiles (id, role, full_name, specialty, mrn, gender, dob)
select
  um.id,
  case
    when um.email = 'patient.demo@docmo.app' then 'patient'
    when um.email = 'doctor.demo@docmo.app' then 'doctor'
    when um.email = 'lab.demo@docmo.app' then 'lab'
  end as role,
  case
    when um.email = 'patient.demo@docmo.app' then 'John Demo'
    when um.email = 'doctor.demo@docmo.app' then 'Dr. Sarah Jenkins'
    when um.email = 'lab.demo@docmo.app' then 'Alex LabTech'
  end as full_name,
  case when um.email = 'doctor.demo@docmo.app' then 'General Practitioner' else null end as specialty,
  case when um.email = 'patient.demo@docmo.app' then 'MRN-9001' else null end as mrn,
  case when um.email = 'patient.demo@docmo.app' then 'Male' else null end as gender,
  case when um.email = 'patient.demo@docmo.app' then date '1992-04-15' else null end as dob
from users_map um
on conflict (id)
do update set
  role = excluded.role,
  full_name = excluded.full_name,
  specialty = excluded.specialty,
  mrn = excluded.mrn,
  gender = excluded.gender,
  dob = excluded.dob;

-- Seed appointment so doctor can accept and patient can see it immediately
insert into public.appointments (
  patient_id,
  doctor_id,
  appointment_date,
  appointment_time,
  appointment_type,
  location,
  reason,
  status,
  meeting_link
)
select
  p.id,
  d.id,
  current_date + 1,
  '10:00 AM',
  'In-Person',
  'DocMo Medical Center',
  'Follow-up consultation for mild fever',
  'Pending',
  null
from public.profiles p
cross join public.profiles d
where p.role = 'patient' and d.role = 'doctor'
  and not exists (
    select 1
    from public.appointments a
    where a.patient_id = p.id
      and a.doctor_id = d.id
      and a.reason = 'Follow-up consultation for mild fever'
  );

-- Seed active prescription so patient has data before doctor issues new one
insert into public.prescriptions (
  patient_id,
  doctor_id,
  medication_name,
  dosage,
  frequency,
  duration,
  instructions,
  status,
  refills_remaining
)
select
  p.id,
  d.id,
  'Paracetamol',
  '500mg',
  'tid',
  '5 days',
  'Take after meals and drink plenty of fluids',
  'Active',
  2
from public.profiles p
cross join public.profiles d
where p.role = 'patient' and d.role = 'doctor'
  and not exists (
    select 1
    from public.prescriptions rx
    where rx.patient_id = p.id
      and rx.doctor_id = d.id
      and rx.medication_name = 'Paracetamol'
      and rx.instructions = 'Take after meals and drink plenty of fluids'
  );

-- Seed one lab report row (metadata). File upload is done from app demo flow.
insert into public.lab_reports (
  patient_id,
  uploaded_by,
  test_type,
  file_name,
  file_path,
  status,
  notes,
  test_date
)
select
  p.id,
  l.id,
  'Complete Blood Count (CBC)',
  'seed-cbc-report.pdf',
  l.id::text || '/seed-cbc-report.pdf',
  'Reviewed',
  'Seeded sample report metadata for demo.',
  current_date - 2
from public.profiles p
cross join public.profiles l
where p.role = 'patient' and l.role = 'lab'
  and not exists (
    select 1
    from public.lab_reports lr
    where lr.patient_id = p.id
      and lr.uploaded_by = l.id
      and lr.file_name = 'seed-cbc-report.pdf'
  );
