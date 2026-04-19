import { useEffect, useMemo, useState } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { askRoleAssistant } from '../../services/integrations';
import { useNavigate } from 'react-router-dom';
import { fetchAppointmentsByDoctor, fetchAppointmentsByPatient, fetchLabReports, fetchPrescriptionsByDoctor, fetchPrescriptionsByPatient, fetchProfilesByRole } from '../../services/api';
import type { Appointment, LabReport, Prescription } from '../../types/backend';

type ChatRole = 'user' | 'assistant';

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  sources?: string[];
  action?: {
    label: string;
    to: string;
  };
};

type AppRole = 'patient' | 'doctor' | 'lab' | 'guest';

const SPECIALTY_TERMS: Array<{ terms: string[]; value: string; label: string }> = [
  { terms: ['cardiologist', 'cardiology', 'heart doctor'], value: 'cardiology', label: 'cardiology' },
  { terms: ['dermatologist', 'dermatology', 'skin doctor'], value: 'dermatology', label: 'dermatology' },
  { terms: ['pediatrician', 'pediatrics', 'child doctor'], value: 'pediatrics', label: 'pediatrics' },
  { terms: ['orthopedist', 'orthopedic', 'orthopedics', 'bone doctor'], value: 'orthopedics', label: 'orthopedics' },
  { terms: ['general practitioner', 'gp', 'family doctor', 'primary care'], value: 'general', label: 'general practitioner' },
];

function isPuterEnabled() {
  return String(import.meta.env.VITE_USE_PUTER_LLM ?? 'false').toLowerCase() === 'true';
}

function shouldUseMedicalAssistant(message: string) {
  const text = message.toLowerCase();
  const medicalKeywords = [
    'side effect',
    'interaction',
    'recall',
    'risk',
    'dose',
    'dosage',
    'rxcui',
    'rxnorm',
    'medicine',
    'medication',
    'drug',
    'contraindication',
    'adverse',
  ];

  return medicalKeywords.some((keyword) => text.includes(keyword));
}

function roleRewriteInstruction(role: AppRole) {
  if (role === 'doctor') {
    return 'Rewrite for a doctor in concise clinical language. Keep safety-critical warnings explicit.';
  }

  if (role === 'lab') {
    return 'Rewrite for a lab assistant in practical workflow language, avoiding diagnosis claims.';
  }

  return 'Rewrite for a patient in clear, friendly language with simple steps and brief safety notes.';
}

function normalizeAssistantText(value: string) {
  return value
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function toPlainText(value: string | { text?: string }) {
  if (typeof value === 'string') return normalizeAssistantText(value);
  return normalizeAssistantText(value.text ?? String(value));
}

function buildConversationContext(conversation: Array<{ role: 'user' | 'assistant'; content: string }>) {
  if (!conversation.length) return '';

  return conversation
    .slice(-6)
    .map((item) => `${item.role === 'user' ? 'User' : 'Assistant'}: ${item.content}`)
    .join('\n');
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function containsAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function containsAll(text: string, terms: string[]) {
  return terms.every((term) => text.includes(term));
}

function extractNameAfterMarkers(message: string, markers: string[], stopWords: string[]) {
  const markerPattern = markers.join('|');
  const match = message.match(new RegExp(`(?:${markerPattern})\\s+([a-zA-Z\\s]{2,60})`, 'i'));
  if (!match?.[1]) return '';

  const cleaned = normalizeText(match[1])
    .split(' ')
    .filter((part) => part && !stopWords.includes(part))
    .join(' ')
    .trim();

  return cleaned;
}

function parseAppointmentDateTime(appointmentDate: string, appointmentTime: string) {
  const date = new Date(`${appointmentDate}T00:00:00`);
  const match = appointmentTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return date;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && hour !== 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;

  const result = new Date(date);
  result.setHours(hour, minute, 0, 0);
  return result;
}

function extractDoctorNameFromScheduleQuery(message: string) {
  const fromDoctorPrefix = extractNameAfterMarkers(
    message,
    ['dr\\.?'],
    ['appointment', 'consultation', 'meet', 'meeting', 'call', 'next', 'my'],
  );
  if (fromDoctorPrefix) return fromDoctorPrefix;

  return extractNameAfterMarkers(
    message,
    ['with'],
    ['appointment', 'appointments', 'consultation', 'consultations', 'meet', 'meeting', 'call', 'next', 'my', 'is', 'the', 'a', 'an'],
  );
}

function isScheduleLookupIntent(message: string) {
  const text = normalizeText(message);
  const appointmentWords = ['appointment', 'appointments', 'consultation', 'consultations', 'meeting', 'meet', 'call'];
  const timingWords = ['when', 'time', 'next', 'upcoming', 'schedule'];
  return containsAny(text, appointmentWords) && containsAny(text, timingWords) && containsAny(text, ['my', 'i']);
}

function extractPatientNameFromDoctorScheduleQuery(message: string) {
  return extractNameAfterMarkers(
    message,
    ['with', 'for patient', 'for'],
    ['patient', 'appointment', 'appointments', 'consultation', 'consultations', 'meet', 'meeting', 'call', 'next', 'my', 'is', 'the', 'a', 'an', 'do', 'i', 'have', 'when', 'time'],
  );
}

function isDoctorPatientScheduleIntent(message: string) {
  const text = normalizeText(message);
  const appointmentWords = ['appointment', 'appointments', 'consultation', 'consultations', 'meeting', 'meet', 'call'];
  const timingWords = ['when', 'time', 'next', 'upcoming', 'schedule'];
  return containsAny(text, appointmentWords) && containsAny(text, timingWords) && containsAny(text, ['with', 'for patient']);
}

async function resolvePatientScheduleAnswer(patientId: string, message: string) {
  const appointments = await fetchAppointmentsByPatient(patientId).catch(() => [] as Appointment[]);
  if (!appointments.length) {
    return 'I could not find any appointments for your account right now.';
  }

  const now = new Date();
  const requestedDoctor = extractDoctorNameFromScheduleQuery(message);

  const upcoming = appointments
    .filter((item) => item.status === 'Pending' || item.status === 'Confirmed')
    .map((item) => ({
      item,
      at: parseAppointmentDateTime(item.appointment_date, item.appointment_time),
    }))
    .filter((entry) => entry.at.getTime() >= now.getTime())
    .sort((a, b) => a.at.getTime() - b.at.getTime());

  const matched = requestedDoctor
    ? upcoming.find((entry) => normalizeText(entry.item.doctor?.full_name ?? '').includes(requestedDoctor))
    : upcoming[0];

  if (!matched) {
    if (requestedDoctor) {
      return 'I could not find an upcoming appointment with that doctor. Please check the Appointments page for full history.';
    }
    return 'I could not find an upcoming appointment right now.';
  }

  const appointment = matched.item;
  const doctorName = appointment.doctor?.full_name ?? 'your doctor';
  const mode = appointment.appointment_type;
  return `Your next appointment with ${doctorName} is on ${appointment.appointment_date} at ${appointment.appointment_time} (${mode}).`;
}

async function resolveDoctorPatientScheduleAnswer(doctorId: string, message: string) {
  const appointments = await fetchAppointmentsByDoctor(doctorId).catch(() => [] as Appointment[]);
  if (!appointments.length) {
    return 'I could not find any appointments for your schedule right now.';
  }

  const requestedPatient = extractPatientNameFromDoctorScheduleQuery(message);
  if (!requestedPatient) {
    return 'Please include the patient name, for example: when do I have an appointment with John Demo?';
  }

  const now = new Date();
  const upcoming = appointments
    .filter((item) => item.status === 'Pending' || item.status === 'Confirmed')
    .map((item) => ({ item, at: parseAppointmentDateTime(item.appointment_date, item.appointment_time) }))
    .filter((entry) => entry.at.getTime() >= now.getTime())
    .sort((a, b) => a.at.getTime() - b.at.getTime());

  const match = upcoming.find((entry) => normalizeText(entry.item.patient?.full_name ?? '').includes(requestedPatient));
  if (!match) {
    return 'I could not find an upcoming appointment with that patient.';
  }

  const appointment = match.item;
  const patientName = appointment.patient?.full_name ?? 'that patient';
  return `Your next appointment with ${patientName} is on ${appointment.appointment_date} at ${appointment.appointment_time} (${appointment.appointment_type}).`;
}

async function resolveDoctorBookingAction(message: string) {
  const normalized = normalizeText(message);
  const match = normalized.match(/(?:book|schedule)\s+(?:appointment\s+)?(?:with\s+)?(?:dr\s+)?([a-z\s]+)/i);
  if (!match?.[1]) return null;

  const requestedName = match[1].trim();
  if (!requestedName || requestedName.length < 3) return null;

  const doctors = await fetchProfilesByRole('doctor').catch(() => []);
  if (!doctors.length) return null;

  const exact = doctors.find((doctor) => normalizeText(doctor.full_name) === requestedName);
  const partial = doctors.find((doctor) => normalizeText(doctor.full_name).includes(requestedName));
  const bestMatch = exact ?? partial;

  if (!bestMatch) return null;

  return {
    label: `Book with ${bestMatch.full_name}`,
    to: `/book/${bestMatch.id}`,
  };
}

function detectSpecialtyTerm(text: string) {
  const hit = SPECIALTY_TERMS.find((item) => item.terms.some((term) => text.includes(term)));
  return hit ?? null;
}

function buildIntentAction(message: string, role: AppRole) {
  const text = message.toLowerCase();
  const params = new URLSearchParams();
  const specialty = detectSpecialtyTerm(text);

  if (specialty && (text.includes('find') || text.includes('search') || text.includes('doctor') || text.includes('specialist'))) {
    params.set('specialty', specialty.value);
    params.set('q', specialty.label);
    return { label: `Open ${specialty.label} search`, to: `/find-doctor?${params.toString()}` };
  }

  if (text.includes('search doctor') || text.includes('find doctor') || text.includes('find specialist')) {
    const match = message.match(/for\s+([a-zA-Z\s]+)/i);
    if (match?.[1]) params.set('q', match[1].trim());
    return { label: 'Open doctor search', to: `/find-doctor${params.toString() ? `?${params.toString()}` : ''}` };
  }

  if (text.includes('book appointment') || text.includes('book a consultation')) {
    const specialtyMap: Array<{ key: string; value: string }> = [
      { key: 'cardio', value: 'cardiology' },
      { key: 'derma', value: 'dermatology' },
      { key: 'pedia', value: 'pediatrics' },
      { key: 'ortho', value: 'orthopedics' },
      { key: 'general', value: 'general' },
    ];

    const specialtyHit = specialtyMap.find((item) => text.includes(item.key));
    if (specialtyHit) params.set('specialty', specialtyHit.value);

    return { label: 'Start booking flow', to: `/find-doctor${params.toString() ? `?${params.toString()}` : ''}` };
  }

  if (text.includes('my appointments') || text.includes('open appointments')) {
    if (role === 'doctor') return { label: 'Go to doctor appointments', to: '/doctor/appointments' };
    if (role === 'lab') return { label: 'Go to lab dashboard', to: '/lab/dashboard' };
    return { label: 'Go to my appointments', to: '/appointments' };
  }

  if (text.includes('prescription')) {
    if (role === 'doctor') return { label: 'Go to doctor prescriptions', to: '/doctor/prescriptions' };
    return { label: 'Go to my prescriptions', to: '/prescriptions' };
  }

  if (text.includes('document') || text.includes('report')) {
    if (role === 'lab') return { label: 'Go to lab reports', to: '/lab/reports' };
    return { label: 'Go to my documents', to: '/documents' };
  }

  if (text.includes('doctor patients') || text.includes('patient list')) {
    return role === 'doctor' ? { label: 'Go to patient list', to: '/doctor/patients' } : null;
  }

  if (text.includes('availability') && role === 'doctor') {
    return { label: 'Go to availability', to: '/doctor/availability' };
  }

  return null;
}

async function resolveIntentAction(message: string, role: AppRole) {
  const text = message.toLowerCase();
  if (role === 'patient' && (text.includes('book dr') || text.includes('book doctor') || text.includes('book appointment with') || text.includes('schedule with dr'))) {
    const directDoctorAction = await resolveDoctorBookingAction(message);
    if (directDoctorAction) return directDoctorAction;
  }

  return buildIntentAction(message, role);
}

function isPatientOverviewIntent(message: string) {
  const text = normalizeText(message);
  return (
    (containsAny(text, ['my', 'i have', 'do i have']) && containsAny(text, ['prescription', 'prescriptions'])) ||
    (containsAny(text, ['my', 'i have', 'next', 'upcoming']) && containsAny(text, ['appointment', 'appointments']))
  );
}

function isDoctorOverviewIntent(message: string) {
  const text = normalizeText(message);
  return (
    (containsAny(text, ['pending', 'requests']) && containsAny(text, ['appointment', 'appointments'])) ||
    (containsAny(text, ['today', 'schedule']) && containsAny(text, ['appointment', 'appointments'])) ||
    containsAll(text, ['refill', 'request']) ||
    containsAny(text, ['workload', 'my workload'])
  );
}

function isLabOverviewIntent(message: string) {
  const text = normalizeText(message);
  return (
    containsAny(text, ['lab workload', 'my lab reports', 'reports today']) ||
    (containsAny(text, ['how many', 'count', 'number']) && containsAny(text, ['report', 'reports'])) ||
    (containsAny(text, ['pending', 'completed', 'reviewed']) && containsAny(text, ['report', 'reports']))
  );
}

function isLabPatientLookupIntent(message: string) {
  const text = normalizeText(message);
  return containsAny(text, ['report', 'reports']) && containsAny(text, ['for', 'patient']) && containsAny(text, ['latest', 'status', 'reviewed', 'show', 'find']);
}

function extractPatientNameFromLabQuery(message: string) {
  const value = extractNameAfterMarkers(
    message,
    ['for patient', 'for', 'patient'],
    ['report', 'reports', 'status', 'reviewed', 'latest', 'lab', 'test', 'result', 'results', 'is', 'the', 'a', 'an', 'please', 'show', 'find'],
  );

  return value.length < 2 ? '' : value;
}

function looksLikeReviewedStatusQuery(message: string) {
  const text = message.toLowerCase();
  return text.includes('reviewed') || text.includes('status');
}

async function resolvePatientOverviewAnswer(patientId: string) {
  const [appointments, prescriptions] = await Promise.all([
    fetchAppointmentsByPatient(patientId).catch(() => [] as Appointment[]),
    fetchPrescriptionsByPatient(patientId).catch(() => [] as Prescription[]),
  ]);

  const now = new Date();
  const upcoming = appointments
    .filter((item) => item.status === 'Pending' || item.status === 'Confirmed')
    .map((item) => ({ item, at: parseAppointmentDateTime(item.appointment_date, item.appointment_time) }))
    .filter((entry) => entry.at.getTime() >= now.getTime())
    .sort((a, b) => a.at.getTime() - b.at.getTime());

  const activePrescriptions = prescriptions.filter((item) => item.status === 'Active' || item.status === 'Refill Needed');
  const next = upcoming[0]?.item;

  const lines = [
    `You have ${upcoming.length} upcoming appointment${upcoming.length === 1 ? '' : 's'}.`,
    `You have ${activePrescriptions.length} active prescription${activePrescriptions.length === 1 ? '' : 's'}.`,
  ];

  if (next) {
    lines.push(`Next appointment: ${next.appointment_date} at ${next.appointment_time} with ${next.doctor?.full_name ?? 'your doctor'}.`);
  }

  return lines.join(' ');
}

async function resolveDoctorOverviewAnswer(doctorId: string) {
  const [appointments, prescriptions] = await Promise.all([
    fetchAppointmentsByDoctor(doctorId).catch(() => [] as Appointment[]),
    fetchPrescriptionsByDoctor(doctorId).catch(() => [] as Prescription[]),
  ]);

  const today = new Date().toISOString().split('T')[0];
  const pending = appointments.filter((item) => item.status === 'Pending').length;
  const todaySchedule = appointments.filter(
    (item) => item.appointment_date === today && (item.status === 'Pending' || item.status === 'Confirmed'),
  ).length;
  const refillRequests = prescriptions.filter((item) => item.status === 'Refill Needed' && item.refills_remaining > 0).length;

  return `You currently have ${pending} pending appointment requests, ${todaySchedule} appointments scheduled for today, and ${refillRequests} refill request${refillRequests === 1 ? '' : 's'} awaiting action.`;
}

async function resolveLabOverviewAnswer(labUserId: string) {
  const reports = await fetchLabReports().catch(() => [] as LabReport[]);
  const mine = reports.filter((item) => item.uploaded_by === labUserId || item.uploaded_by_profile?.id === labUserId);
  const scope = mine.length > 0 ? mine : reports;

  const today = new Date().toISOString().split('T')[0];
  const pending = scope.filter((item) => item.status === 'Pending').length;
  const completed = scope.filter((item) => item.status === 'Completed').length;
  const reviewed = scope.filter((item) => item.status === 'Reviewed').length;
  const createdToday = scope.filter((item) => (item.created_at ?? '').startsWith(today)).length;

  const base = mine.length > 0 ? 'your lab queue' : 'the lab queue';
  return `In ${base}, there are ${pending} pending reports, ${completed} completed reports, ${reviewed} reviewed reports, and ${createdToday} report${createdToday === 1 ? '' : 's'} created today.`;
}

async function resolveLabPatientLookupAnswer(labUserId: string, message: string) {
  const reports = await fetchLabReports().catch(() => [] as LabReport[]);
  if (!reports.length) {
    return 'I could not find any lab reports right now.';
  }

  const mine = reports.filter((item) => item.uploaded_by === labUserId || item.uploaded_by_profile?.id === labUserId);
  const scope = mine.length > 0 ? mine : reports;

  const requestedName = extractPatientNameFromLabQuery(message);
  if (!requestedName) {
    return 'Please include the patient name, for example: latest report for John Doe.';
  }

  const matched = scope.filter((item) => normalizeText(item.patient?.full_name ?? '').includes(requestedName));
  if (!matched.length) {
    return 'I could not find reports for that patient in your lab queue.';
  }

  const latest = matched
    .slice()
    .sort((a, b) => {
      const aTime = new Date(a.created_at || a.test_date).getTime();
      const bTime = new Date(b.created_at || b.test_date).getTime();
      return bTime - aTime;
    })[0];

  const patientName = latest.patient?.full_name ?? 'that patient';
  const reviewedQuery = looksLikeReviewedStatusQuery(message);

  if (reviewedQuery) {
    if (latest.status === 'Reviewed') {
      return `Yes, the latest report for ${patientName} is reviewed. Test: ${latest.test_type}. Date: ${latest.test_date}.`;
    }

    return `No, the latest report for ${patientName} is currently ${latest.status.toLowerCase()}. Test: ${latest.test_type}. Date: ${latest.test_date}.`;
  }

  return `Latest report for ${patientName}: ${latest.test_type}, status ${latest.status}, dated ${latest.test_date}.`;
}

function getRolePrompt(role: 'patient' | 'doctor' | 'lab' | 'guest') {
  if (role === 'doctor') {
    return 'Doctor Copilot is ready. Ask about medication risk checks, recall signals, and RxNorm normalization.';
  }

  if (role === 'lab') {
    return 'Lab Copilot is ready. Ask about medication safety context, interpretation cautions, and workflow help.';
  }

  if (role === 'patient') {
    return 'Patient Assistant is ready. Ask about your prescription details and how to use DocMo features.';
  }

  return 'Welcome to DocMo Assistant. Ask about app features, appointments, and prescriptions.';
}

function roleLabel(role: 'patient' | 'doctor' | 'lab' | 'guest') {
  if (role === 'doctor') return 'Doctor Copilot';
  if (role === 'lab') return 'Lab Copilot';
  if (role === 'patient') return 'Patient Assistant';
  return 'DocMo Assistant';
}

function getSuggestedQuestions(role: 'patient' | 'doctor' | 'lab' | 'guest') {
  if (role === 'doctor') {
    return [
      'Open doctor appointments',
      'Open patient list',
      'When do I have an appointment with John Demo?',
      'What are risks of amoxicillin?',
      'Show recall signals for ibuprofen',
    ];
  }

  if (role === 'lab') {
    return [
      'Open lab reports',
      'Open lab dashboard',
      'How many pending reports do I have?',
      'Latest report for John Doe',
      'Is the report reviewed for John Doe?',
    ];
  }

  if (role === 'patient') {
    return [
      'Show my prescriptions',
      'Open my appointments',
      'Find doctor for cardiology',
      'Book appointment with Dr Sarah Jenkins',
    ];
  }

  return [
    'Find doctor for dermatology',
    'Open login page',
    'How do I book an appointment?',
    'What is amoxicillin used for?',
  ];
}

function buildNavigationConfirmation(actionLabel: string) {
  if (actionLabel.toLowerCase().includes('book')) {
    return 'Opening booking now. Pick date/time and confirm your appointment.';
  }

  return `Opening now: ${actionLabel}`;
}

export function AssistantChatbot() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const role = (profile?.role ?? 'guest') as 'patient' | 'doctor' | 'lab' | 'guest';

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [puterReady, setPuterReady] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: getRolePrompt(role),
    },
  ]);

  const title = useMemo(() => roleLabel(role), [role]);
  const suggestedQuestions = useMemo(() => getSuggestedQuestions(role), [role]);

  useEffect(() => {
    if (!isPuterEnabled()) {
      setPuterReady(false);
      return;
    }

    if (window.puter?.ai?.chat) {
      setPuterReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.async = true;
    script.onload = () => setPuterReady(Boolean(window.puter?.ai?.chat));
    script.onerror = () => setPuterReady(false);
    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  async function sendMessage(rawText: string) {
    const text = rawText.trim();
    if (!text || isLoading) return;
    const action = await resolveIntentAction(text, role);

    const nextUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
    };

    const conversationForApi = [...messages, nextUserMessage]
      .slice(-8)
      .map((item) => ({ role: item.role, content: item.content }));
    const conversationContext = buildConversationContext(conversationForApi);

    setMessages((prev) => [...prev, nextUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (role === 'patient' && profile?.id && isScheduleLookupIntent(text)) {
        const scheduleReply = await resolvePatientScheduleAnswer(profile.id, text);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: scheduleReply,
            sources: ['App Data'],
          },
        ]);
        return;
      }

      if (role === 'patient' && profile?.id && isPatientOverviewIntent(text)) {
        const overviewReply = await resolvePatientOverviewAnswer(profile.id);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: overviewReply,
            sources: ['App Data'],
          },
        ]);
        return;
      }

      if (role === 'doctor' && profile?.id && isDoctorOverviewIntent(text)) {
        const overviewReply = await resolveDoctorOverviewAnswer(profile.id);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: overviewReply,
            sources: ['App Data'],
          },
        ]);
        return;
      }

      if (role === 'doctor' && profile?.id && isDoctorPatientScheduleIntent(text)) {
        const scheduleReply = await resolveDoctorPatientScheduleAnswer(profile.id, text);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: scheduleReply,
            sources: ['App Data'],
          },
        ]);
        return;
      }

      if (role === 'lab' && profile?.id && isLabOverviewIntent(text)) {
        const overviewReply = await resolveLabOverviewAnswer(profile.id);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: overviewReply,
            sources: ['App Data'],
          },
        ]);
        return;
      }

      if (role === 'lab' && profile?.id && isLabPatientLookupIntent(text)) {
        const patientLookupReply = await resolveLabPatientLookupAnswer(profile.id, text);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: patientLookupReply,
            sources: ['App Data'],
          },
        ]);
        return;
      }

      if (action) {
        navigate(action.to);

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: buildNavigationConfirmation(action.label),
            sources: ['App'],
          },
        ]);

        return;
      }

      const shouldUsePuter = isPuterEnabled() && puterReady;
      let result: { reply: string; sources?: string[] };

      if (shouldUsePuter) {
        if (shouldUseMedicalAssistant(text)) {
          const backendResult = await askRoleAssistant({
            role,
            message: text,
            conversation: conversationForApi,
          });

          const rewritePrompt = [
            roleRewriteInstruction(role),
            'Use the clinical facts below, but rewrite naturally and helpfully. Do not invent facts beyond the provided context.',
            'If there is uncertainty, say so briefly.',
            'Output constraints: plain text only, no markdown, no headings, no bold markers, max 5 short bullet points.',
            `User question: ${text}`,
            `Recent conversation:\n${conversationContext || 'None'}`,
            `Context answer: ${backendResult.reply}`,
            `Sources: ${(backendResult.sources ?? []).join(', ') || 'None'}`,
          ].join('\n\n');

          const puterResponse = await window.puter!.ai.chat(rewritePrompt, {
            model: import.meta.env.VITE_PUTER_MODEL || 'gpt-5.4',
            temperature: 0.2,
            max_tokens: 500,
          });

          result = {
            reply: toPlainText(puterResponse),
            sources: [...new Set([...(backendResult.sources ?? []), 'Puter LLM'])],
          };
        } else {
          const generalPrompt = [
            roleRewriteInstruction(role),
            'Answer naturally and clearly. If user asks for navigation, suggest exact next action in app terms.',
            'Output constraints: plain text only, no markdown, no headings, no bold markers, max 4 short bullets/lines.',
            `Recent conversation:\n${conversationContext || 'None'}`,
            `User question: ${text}`,
          ].join('\n\n');

          const puterResponse = await window.puter!.ai.chat(generalPrompt, {
            model: import.meta.env.VITE_PUTER_MODEL || 'gpt-5.4',
            temperature: 0.3,
            max_tokens: 400,
          });

          result = {
            reply: toPlainText(puterResponse),
            sources: ['Puter LLM'],
          };
        }
      } else {
        result = await askRoleAssistant({
          role,
          message: text,
          conversation: conversationForApi,
        });
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: result.reply,
          sources: result.sources,
          action,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: error instanceof Error ? error.message : 'Unable to reach assistant right now.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSend() {
    await sendMessage(input);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500"
        aria-label="Toggle assistant chat"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-5 z-50 w-[92vw] max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2 text-gray-900">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h2 className="text-sm font-semibold">{title}</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[420px] space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <div key={message.id} className={message.role === 'user' ? 'text-right' : 'text-left'}>
                <div
                  className={`inline-block max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1 text-xs text-gray-500">
                    {message.sources.map((source) => (
                      <span key={source} className="rounded bg-gray-100 px-2 py-0.5">
                        {source}
                      </span>
                    ))}
                  </div>
                )}
                {message.action && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => navigate(message.action!.to)}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      {message.action.label}
                    </button>
                  </div>
                )}
              </div>
            ))}

            {messages.length === 1 && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Most asked</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => void sendMessage(question)}
                      className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-3">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder="Ask about medicines, risks, or app help..."
                className="h-11 flex-1 rounded-xl border border-gray-300 px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={isLoading || !input.trim()}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
