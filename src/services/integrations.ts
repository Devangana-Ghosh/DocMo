type AvailabilityResponse = {
  slots?: string[];
};

type MeetingLinkResponse = {
  meetingLink?: string;
};

function getEdgeFunctionHeaders() {
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!anonKey) {
    return {
      'Content-Type': 'application/json',
    };
  }

  return {
    'Content-Type': 'application/json',
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
  };
}

function toErrorMessage(value: unknown, fallback: string) {
  if (value instanceof Error) return value.message;
  return fallback;
}

function defaultSlotsForDate(date: string) {
  const day = new Date(date).getDay();
  if (day === 0) return ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'];
  if (day === 6) return ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM'];
  return ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'];
}

export type NominatimLocation = {
  displayName: string;
  lat: string;
  lon: string;
  osmUrl: string;
};

export type RxNormConcept = {
  name: string;
  rxcui: string;
  tty?: string;
  synonym?: string;
};

const RXNORM_PREFERRED_TTYS = ['SCD', 'SBD', 'IN', 'MIN', 'PIN', 'BN'] as const;

function isNoisyPackConcept(name: string, tty?: string) {
  const normalized = name.toLowerCase();
  if (tty === 'GPCK' || tty === 'BPCK') return true;
  if (normalized.includes(' pack')) return true;
  if (normalized.startsWith('{') || normalized.includes('}')) return true;
  return false;
}

function rxNormScore(concept: RxNormConcept, term: string) {
  const normalizedName = concept.name.toLowerCase();
  const normalizedTerm = term.toLowerCase().trim();

  let score = 0;

  if (RXNORM_PREFERRED_TTYS.includes((concept.tty ?? '') as any)) score += 50;
  if (normalizedName === normalizedTerm) score += 40;
  if (normalizedName.startsWith(normalizedTerm)) score += 25;
  if (normalizedName.includes(normalizedTerm)) score += 10;
  if (concept.tty === 'IN') score += 10;
  if (concept.tty === 'SCD') score += 8;
  if (concept.tty === 'SBD') score += 6;
  if (isNoisyPackConcept(concept.name, concept.tty)) score -= 100;

  return score;
}

export async function searchLocationsWithNominatim(query: string, limit = 1): Promise<NominatimLocation[]> {
  if (!query.trim()) return [];

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('addressdetails', '1');

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim error: ${response.status}`);
  }

  const rows = (await response.json()) as Array<{ display_name: string; lat: string; lon: string }>;
  return rows.map((row) => ({
    displayName: row.display_name,
    lat: row.lat,
    lon: row.lon,
    osmUrl: `https://www.openstreetmap.org/?mlat=${row.lat}&mlon=${row.lon}#map=16/${row.lat}/${row.lon}`,
  }));
}

export async function fetchRxNormSuggestions(term: string): Promise<RxNormConcept[]> {
  if (term.trim().length < 2) return [];

  const url = new URL('https://rxnav.nlm.nih.gov/REST/drugs.json');
  url.searchParams.set('name', term);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`RxNorm error: ${response.status}`);
  }

  const payload = (await response.json()) as {
    drugGroup?: {
      conceptGroup?: Array<{
        conceptProperties?: Array<{ rxcui?: string; name?: string; tty?: string; synonym?: string }>;
      }>;
    };
  };

  const suggestions = new Map<string, RxNormConcept>();
  payload.drugGroup?.conceptGroup?.forEach((group) => {
    group.conceptProperties?.forEach((item) => {
      if (item.name && item.rxcui && !suggestions.has(item.rxcui)) {
        suggestions.set(item.rxcui, {
          name: item.name,
          rxcui: item.rxcui,
          tty: item.tty,
          synonym: item.synonym,
        });
      }
    });
  });

  const filtered = Array.from(suggestions.values()).filter((concept) => !isNoisyPackConcept(concept.name, concept.tty));
  const candidatePool = filtered.length > 0 ? filtered : Array.from(suggestions.values());

  return candidatePool
    .sort((a, b) => rxNormScore(b, term) - rxNormScore(a, term))
    .slice(0, 8);
}

export function buildRxNormInfoUrl(params: { rxcui?: string | null; medicationName?: string | null }) {
  if (params.rxcui) {
    return `https://mor.nlm.nih.gov/RxNav/search?searchBy=NameOrCode&searchTerm=${encodeURIComponent(params.rxcui)}`;
  }

  if (params.medicationName) {
    return `https://mor.nlm.nih.gov/RxNav/search?searchBy=NameOrCode&searchTerm=${encodeURIComponent(params.medicationName)}`;
  }

  return 'https://mor.nlm.nih.gov/RxNav/';
}

export type NpiDoctorInfo = {
  npiNumber: string;
  cityState?: string;
};

export async function lookupDoctorInNpiRegistry(fullName: string): Promise<NpiDoctorInfo | null> {
  const [firstName, ...rest] = fullName.replace(/^dr\.?\s+/i, '').split(' ');
  const lastName = rest.join(' ').trim();

  if (!firstName || !lastName) return null;

  const url = new URL('https://npiregistry.cms.hhs.gov/api/');
  url.searchParams.set('version', '2.1');
  url.searchParams.set('first_name', firstName);
  url.searchParams.set('last_name', lastName);
  url.searchParams.set('limit', '1');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`NPI Registry error: ${response.status}`);
  }

  const payload = (await response.json()) as {
    results?: Array<{
      number?: string;
      addresses?: Array<{ city?: string; state?: string; address_purpose?: string }>;
    }>;
  };

  const result = payload.results?.[0];
  if (!result?.number) return null;

  const locationAddress = result.addresses?.find((item) => item.address_purpose === 'LOCATION') ?? result.addresses?.[0];
  const cityState = locationAddress?.city && locationAddress?.state
    ? `${locationAddress.city}, ${locationAddress.state}`
    : undefined;

  return {
    npiNumber: result.number,
    cityState,
  };
}

export async function fetchDoctorAvailability(doctorId: string, date: string): Promise<string[]> {
  const endpoint = import.meta.env.VITE_AVAILABILITY_API_URL as string | undefined;
  if (!endpoint) return defaultSlotsForDate(date);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: getEdgeFunctionHeaders(),
      body: JSON.stringify({ mode: 'availability', doctorId, date }),
    });

    if (!response.ok) return defaultSlotsForDate(date);
    const payload = (await response.json()) as AvailabilityResponse;
    return payload.slots?.length ? payload.slots : defaultSlotsForDate(date);
  } catch {
    return defaultSlotsForDate(date);
  }
}

export async function createVideoConsultationLink(params: {
  doctorName: string;
  patientName: string;
  date: string;
  time: string;
  doctorEmail?: string;
  patientEmail?: string;
}) {
  const fixedMeetLink = import.meta.env.VITE_FIXED_MEET_LINK as string | undefined;
  if (fixedMeetLink) {
    return fixedMeetLink;
  }

  const endpoint = import.meta.env.VITE_VIDEO_LINKS_API_URL as string | undefined;
  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: getEdgeFunctionHeaders(),
        body: JSON.stringify({ mode: 'create-event', ...params }),
      });

      if (response.ok) {
        const payload = (await response.json()) as MeetingLinkResponse;
        if (payload.meetingLink) return payload.meetingLink;
      }
    } catch {
      // fallback below
    }
  }

  const fallbackMeetUrl = (import.meta.env.VITE_VIDEO_MEETING_BASE_URL as string | undefined) ?? 'https://meet.google.com/new';
  return fallbackMeetUrl;
}

export async function sendConsultationAlert(payload: {
  doctorName: string;
  patientName: string;
  doctorEmail?: string;
  patientEmail?: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: 'In-Person' | 'Video Call' | 'Phone Call';
  meetingLink?: string;
}) {
  const endpoint = import.meta.env.VITE_CONSULTATION_ALERTS_WEBHOOK_URL as string | undefined;
  if (!endpoint) return;

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error(toErrorMessage(error, 'Failed to send consultation alert'));
  }
}

function parseAppointmentDateTime(date: string, time: string) {
  const dateObj = new Date(`${date}T00:00:00`);
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    const fallbackStart = new Date(dateObj);
    fallbackStart.setHours(9, 0, 0, 0);
    const fallbackEnd = new Date(fallbackStart.getTime() + 30 * 60 * 1000);
    return { start: fallbackStart, end: fallbackEnd };
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && hour !== 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;

  const start = new Date(dateObj);
  start.setHours(hour, minute, 0, 0);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  return { start, end };
}

function toGoogleCalendarDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

export function buildGoogleCalendarEventUrl(params: {
  title: string;
  description?: string;
  location?: string;
  appointmentDate: string;
  appointmentTime: string;
}) {
  const { start, end } = parseAppointmentDateTime(params.appointmentDate, params.appointmentTime);
  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', params.title);
  url.searchParams.set('dates', `${toGoogleCalendarDate(start)}/${toGoogleCalendarDate(end)}`);
  if (params.description) {
    url.searchParams.set('details', params.description);
  }
  if (params.location) {
    url.searchParams.set('location', params.location);
  }

  return url.toString();
}