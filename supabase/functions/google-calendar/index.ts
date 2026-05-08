import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const SHARED_MEET_LINK = 'https://meet.google.com/yun-buuh-hfr';

type Mode = 'availability' | 'create-event';

type RequestBody = {
  mode: Mode;
  doctorId?: string;
  doctorName?: string;
  patientName?: string;
  date: string;
  time?: string;
  patientEmail?: string;
  doctorEmail?: string;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getAccessToken() {
  const staticAccessToken = Deno.env.get('GOOGLE_ACCESS_TOKEN');
  if (staticAccessToken) {
    return staticAccessToken;
  }

  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  const refreshToken = Deno.env.get('GOOGLE_REFRESH_TOKEN');

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Google auth configuration. Set GOOGLE_ACCESS_TOKEN (no-refresh mode) or GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET + GOOGLE_REFRESH_TOKEN');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh Google token: ${response.status}`);
  }

  const payload = await response.json() as { access_token?: string };
  if (!payload.access_token) throw new Error('No access_token returned by Google');
  return payload.access_token;
}

function toIsoDateTime(date: string, time: string) {
  const parsedDate = new Date(`${date}T00:00:00`);
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) throw new Error(`Invalid time format: ${time}`);

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && hour !== 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;

  const start = new Date(parsedDate);
  start.setHours(hour, minute, 0, 0);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

async function createMeetEvent(body: RequestBody) {
  const accessToken = await getAccessToken();
  const calendarId = Deno.env.get('GOOGLE_CALENDAR_ID') ?? 'primary';

  if (!body.doctorName || !body.patientName || !body.time) {
    throw new Error('doctorName, patientName, date, and time are required');
  }

  const { start, end } = toIsoDateTime(body.date, body.time);

  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendUpdates=all`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: `DocMo consultation: ${body.patientName} with ${body.doctorName}`,
      description: `Consultation scheduled through DocMo\nJoin meeting: ${SHARED_MEET_LINK}`,
      location: SHARED_MEET_LINK,
      start: { dateTime: start },
      end: { dateTime: end },
      attendees: [
        ...(body.doctorEmail ? [{ email: body.doctorEmail }] : []),
        ...(body.patientEmail ? [{ email: body.patientEmail }] : []),
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Calendar event creation failed: ${response.status} ${text}`);
  }

  await response.json();
  return { meetingLink: SHARED_MEET_LINK };
}

async function fetchAvailability(body: RequestBody) {
  const accessToken = await getAccessToken();
  const calendarId = Deno.env.get('GOOGLE_CALENDAR_ID') ?? 'primary';

  const date = new Date(body.date);
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const response = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      items: [{ id: calendarId }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Calendar freeBusy failed: ${response.status} ${text}`);
  }

  const payload = await response.json() as { calendars?: Record<string, { busy?: Array<{ start: string; end: string }> }> };
  const busy = payload.calendars?.[calendarId]?.busy ?? [];
  const slots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'];

  const available = slots.filter((slot) => {
    const { start: slotStart, end: slotEnd } = toIsoDateTime(body.date, slot);
    return !busy.some((block) => new Date(slotStart) < new Date(block.end) && new Date(slotEnd) > new Date(block.start));
  });

  return { slots: available };
}

serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const body = (await req.json()) as RequestBody;

    if (body.mode === 'availability') {
      return json(await fetchAvailability(body));
    }

    if (body.mode === 'create-event') {
      return json(await createMeetEvent(body));
    }

    return json({ error: 'Invalid mode' }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return json({ error: message }, 400);
  }
});