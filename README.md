# DocMo (Supabase Integrated)

## Local setup

1. Install dependencies:
	- `npm install`
2. Create env file:
	- Copy `.env.example` to `.env`
	- Set:
	  - `VITE_SUPABASE_URL`
	  - `VITE_SUPABASE_ANON_KEY`
	  - Optional integrations:
	    - `VITE_AVAILABILITY_API_URL`
	    - `VITE_VIDEO_LINKS_API_URL`
	    - `VITE_VIDEO_MEETING_BASE_URL`
	    - `VITE_CONSULTATION_ALERTS_WEBHOOK_URL`
3. In Supabase SQL Editor, run:
	- `supabase/schema.sql`
4. In Supabase Authentication > Users, create 3 users (Email/Password):
	- `patient.demo@docmo.app` / `Demo@12345`
	- `doctor.demo@docmo.app` / `Demo@12345`
	- `lab.demo@docmo.app` / `Demo@12345`
5. In Supabase SQL Editor, run:
	- `supabase/demo_seed.sql`
6. Start app:
	- `npm run dev`

## External integrations (implemented)

- OpenStreetMap/Nominatim:
	- Used for geocoding location cards and opening OSM direction links.
	- No API key required.
- RxNorm:
	- Used for medication name suggestions in doctor prescription form.
	- No API key required.
- NPI Registry:
	- Used to enrich doctor cards with NPI and city/state when available.
	- No API key required.
- Google Calendar / Microsoft Graph availability:
	- App calls `VITE_AVAILABILITY_API_URL` (your backend/proxy) for real slots.
	- If unset/unavailable, app uses fallback local slots.
- Online consultation links:
	- App calls `VITE_VIDEO_LINKS_API_URL` (your backend/proxy) for provider links (Google Meet preferred).
	- If you want the simplest setup, set `VITE_FIXED_MEET_LINK` to one reusable Google Meet URL.
	- Otherwise, if unset/unavailable, app falls back to generated `VITE_VIDEO_MEETING_BASE_URL` room links.
- Consultation email alerts:
	- Google Calendar invites are sent automatically when `sendUpdates=all` is used.
	- If you still want external reminders, app can post to `VITE_CONSULTATION_ALERTS_WEBHOOK_URL`.

## What you need to provide

For full production setup (Google Meet + real calendar + email reminders), provide one of these backend integrations:

1. Google stack (recommended)
	- Google Cloud OAuth client/service account
	- Calendar API enabled
	- If using automatic calendar + Meet creation: refresh token and calendar ID (or `primary`)
	- If using simple/manual Meet: no Google auth is required; just set `VITE_FIXED_MEET_LINK`
	- Backend endpoints wired to the Supabase Edge Function:
	  - `VITE_AVAILABILITY_API_URL` → `.../functions/v1/google-calendar`
	  - `VITE_VIDEO_LINKS_API_URL` → `.../functions/v1/google-calendar`
	- Google env vars in Supabase secrets:
	  - `GOOGLE_CLIENT_ID`
	  - `GOOGLE_CLIENT_SECRET`
	  - `GOOGLE_REFRESH_TOKEN`
	  - `GOOGLE_CALENDAR_ID`

### Google without refresh token (supported)

If you do not want to store a refresh token, you can run Google Calendar integration with a short-lived access token:

- Set function secrets:
	- `GOOGLE_ACCESS_TOKEN` (temporary, expires ~1 hour)
	- `GOOGLE_CALENDAR_ID`
- Do not set `GOOGLE_REFRESH_TOKEN`.

This mode works, but you must update `GOOGLE_ACCESS_TOKEN` whenever it expires.
2. Microsoft stack
	- Azure app registration + Graph Calendar permissions
	- Backend free/busy endpoint (`VITE_AVAILABILITY_API_URL`)
	- Optional Teams/meeting endpoint (`VITE_VIDEO_LINKS_API_URL`)
3. Email provider for reminders
	- Resend/SendGrid/SES (or equivalent)
	- Webhook endpoint URL for `VITE_CONSULTATION_ALERTS_WEBHOOK_URL`

## If you see RLS recursion error

If Supabase shows: `infinite recursion detected in policy for relation "profiles"`, run:

- `supabase/fix_profiles_policy.sql`

## Required Supabase data

Create users in Supabase Auth (Email/Password) and then insert matching rows in `profiles` with same `id` and role.
The provided `supabase/demo_seed.sql` does this automatically for the 3 demo accounts above.

- one `patient`
- one `doctor`
- one `lab`

Minimum profile fields used by app:

- `id` (must match `auth.users.id`)
- `role`
- `full_name`
- optional: `specialty`, `mrn`, `gender`, `dob`

## Demo flow

1. Login as patient (`patient.demo@docmo.app`) and book appointment.
2. Login as doctor (`doctor.demo@docmo.app`) and accept appointment.
3. Doctor issues prescription.
4. Login as lab (`lab.demo@docmo.app`) and upload report.
5. Login back as patient and view appointments/prescriptions/documents.
