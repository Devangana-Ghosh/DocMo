import { supabase } from '../lib/supabase';
import type { Appointment, ContactMessage, LabReport, MedicalDocument, Prescription, Profile, UserRole } from '../types/backend';

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function requireSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new ApiError(error.message);
  }

  if (!data.session) {
    throw new ApiError('You are not signed in. Please sign in and try again.');
  }
}

function ensure<T>(value: T | null, message: string): T {
  if (!value) {
    throw new ApiError(message);
  }
  return value;
}

function buildFallbackProfile(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }, role: UserRole): Profile {
  const email = user.email ?? undefined;
  const fromMetadata = typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : undefined;
  const fromEmail = email ? email.split('@')[0].replace(/[._-]+/g, ' ') : undefined;
  const full_name = fromMetadata ?? fromEmail ?? 'Signed-in user';

  return {
    id: user.id,
    role,
    full_name,
    email,
  };
}

export async function getCurrentProfile() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) {
    throw new ApiError(authError.message);
  }

  const user = authData.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    throw new ApiError(error.message);
  }

  return (data as Profile | null) ?? null;
}

export async function signIn(email: string, password: string, expectedRole?: UserRole) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new ApiError(error.message);
  }

  const user = ensure(data.user, 'User not found after sign-in');
  return buildFallbackProfile(user, expectedRole ?? 'patient');
}

export async function signUp(email: string, password: string, role: UserRole, fullName: string, phone?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
        phone: phone?.trim() || '',
      },
    },
  });

  if (error) {
    throw new ApiError(error.message);
  }

  const user = ensure(data.user, 'User not found after sign-up');
  const needsEmailConfirmation = !data.session;

  return {
    profile: needsEmailConfirmation ? null : buildFallbackProfile(user, role),
    needsEmailConfirmation,
  };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new ApiError(error.message);
  }
}

export async function fetchAppointmentsByPatient(patientId: string) {
  await requireSession();
  const { data, error } = await supabase
    .from('appointments')
    .select('*, doctor:profiles!appointments_doctor_id_fkey(id, full_name, specialty)')
    .eq('patient_id', patientId)
    .order('appointment_date', { ascending: false });

  if (error) throw new ApiError(error.message);
  return (data ?? []) as Appointment[];
}

export async function fetchAppointmentsByDoctor(doctorId: string) {
  await requireSession();
  const { data, error } = await supabase
    .from('appointments')
    .select('*, patient:profiles!appointments_patient_id_fkey(id, full_name, mrn, gender, dob)')
    .eq('doctor_id', doctorId)
    .order('appointment_date', { ascending: true });

  if (error) throw new ApiError(error.message);
  return (data ?? []) as Appointment[];
}

export async function createAppointment(payload: Omit<Appointment, 'id' | 'created_at' | 'status'> & { status?: Appointment['status'] }) {
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      ...payload,
      status: payload.status ?? 'Pending',
    })
    .select('*')
    .single();

  if (error) throw new ApiError(error.message);
  return data as Appointment;
}

export async function updateAppointmentStatus(id: string, status: Appointment['status']) {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new ApiError(error.message);
  return data as Appointment;
}

export async function fetchPrescriptionsByPatient(patientId: string) {
  await requireSession();
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*, doctor:profiles!prescriptions_doctor_id_fkey(id, full_name, specialty)')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) throw new ApiError(error.message);
  return (data ?? []) as Prescription[];
}

export async function fetchPrescriptionsByDoctor(doctorId: string) {
  await requireSession();
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*, patient:profiles!prescriptions_patient_id_fkey(id, full_name, mrn)')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });

  if (error) throw new ApiError(error.message);
  return (data ?? []) as Prescription[];
}

export async function createPrescription(payload: Omit<Prescription, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('prescriptions')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw new ApiError(error.message);
  return data as Prescription;
}

export async function updatePrescription(id: string, payload: Partial<Omit<Prescription, 'id' | 'created_at' | 'patient' | 'doctor'>>) {
  const { data, error } = await supabase
    .from('prescriptions')
    .update(payload)
    .eq('id', id)
    .select('*, patient:profiles!prescriptions_patient_id_fkey(id, full_name, mrn), doctor:profiles!prescriptions_doctor_id_fkey(id, full_name, specialty)')
    .single();

  if (error) throw new ApiError(error.message);
  return data as Prescription;
}

export async function cancelPrescription(id: string) {
  return updatePrescription(id, { status: 'Cancelled' });
}

export async function decrementRefill(prescriptionId: string, currentRefills: number) {
  const next = Math.max(currentRefills - 1, 0);
  const status = next === 0 ? 'Refill Needed' : 'Active';

  const { data, error } = await supabase
    .from('prescriptions')
    .update({ refills_remaining: next, status })
    .eq('id', prescriptionId)
    .select('*')
    .single();

  if (error) throw new ApiError(error.message);
  return data as Prescription;
}

export async function requestPrescriptionRefill(prescriptionId: string) {
  const { data, error } = await supabase
    .from('prescriptions')
    .update({ status: 'Refill Needed' })
    .eq('id', prescriptionId)
    .select('*')
    .single();

  if (error) throw new ApiError(error.message);
  return data as Prescription;
}

export async function approvePrescriptionRefill(prescriptionId: string, currentRefills: number) {
  const next = Math.max(currentRefills - 1, 0);
  const status = next === 0 ? 'Completed' : 'Active';

  const { data, error } = await supabase
    .from('prescriptions')
    .update({ refills_remaining: next, status })
    .eq('id', prescriptionId)
    .select('*, patient:profiles!prescriptions_patient_id_fkey(id, full_name, mrn), doctor:profiles!prescriptions_doctor_id_fkey(id, full_name, specialty)')
    .single();

  if (error) throw new ApiError(error.message);
  return data as Prescription;
}

export async function fetchProfilesByRole(role: UserRole) {
  await requireSession();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', role)
    .order('full_name', { ascending: true });

  if (error) throw new ApiError(error.message);
  return (data ?? []) as Profile[];
}

export async function fetchDoctorPatients(doctorId: string) {
  await requireSession();
  const { data, error } = await supabase
    .from('appointments')
    .select('patient:profiles!appointments_patient_id_fkey(id, full_name, mrn, gender, dob)')
    .eq('doctor_id', doctorId);

  if (error) throw new ApiError(error.message);

  const deduped = new Map<string, Profile>();
  (data ?? []).forEach((row: any) => {
    const patient = row.patient as Profile | null;
    if (patient) deduped.set(patient.id, patient);
  });

  return Array.from(deduped.values());
}

export async function fetchDoctorPatientRecord(doctorId: string, patientId: string) {
  await requireSession();

  const [appointmentsResult, prescriptionsResult, documentsResult, labReportsResult] = await Promise.all([
    supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('patient_id', patientId)
      .order('appointment_date', { ascending: false }),
    supabase
      .from('prescriptions')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false }),
    supabase
      .from('documents')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false }),
    supabase
      .from('lab_reports')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false }),
  ]);

  if (appointmentsResult.error) throw new ApiError(appointmentsResult.error.message);
  if (prescriptionsResult.error) throw new ApiError(prescriptionsResult.error.message);
  if (documentsResult.error) throw new ApiError(documentsResult.error.message);
  if (labReportsResult.error) throw new ApiError(labReportsResult.error.message);

  return {
    appointments: (appointmentsResult.data ?? []) as Appointment[],
    prescriptions: (prescriptionsResult.data ?? []) as Prescription[],
    documents: (documentsResult.data ?? []) as MedicalDocument[],
    labReports: (labReportsResult.data ?? []) as LabReport[],
  };
}

export async function uploadPatientDocument(patientId: string, file: File, type: MedicalDocument['type']) {
  const filePath = `${patientId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('patient-documents')
    .upload(filePath, file, { upsert: false });

  if (uploadError) throw new ApiError(uploadError.message);

  const { data, error } = await supabase
    .from('documents')
    .insert({
      patient_id: patientId,
      name: file.name,
      type,
      file_path: filePath,
      file_size: file.size,
    })
    .select('*')
    .single();

  if (error) throw new ApiError(error.message);
  return data as MedicalDocument;
}

export async function fetchDocuments(patientId: string) {
  await requireSession();
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) throw new ApiError(error.message);
  return (data ?? []) as MedicalDocument[];
}

export async function deleteDocument(document: MedicalDocument) {
  const { error: storageError } = await supabase.storage.from('patient-documents').remove([document.file_path]);
  if (storageError) throw new ApiError(storageError.message);

  const { error } = await supabase.from('documents').delete().eq('id', document.id);
  if (error) throw new ApiError(error.message);
}

export async function getDocumentPublicUrl(filePath: string) {
  const { data } = supabase.storage.from('patient-documents').getPublicUrl(filePath);
  return data.publicUrl;
}

export async function uploadLabReport(params: {
  patientId: string;
  uploadedBy: string;
  file: File;
  testType: string;
  notes?: string;
  testDate: string;
}) {
  const filePath = `${params.uploadedBy}/${Date.now()}-${params.file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('lab-reports')
    .upload(filePath, params.file, { upsert: false });

  if (uploadError) throw new ApiError(uploadError.message);

  const { data, error } = await supabase
    .from('lab_reports')
    .insert({
      patient_id: params.patientId,
      uploaded_by: params.uploadedBy,
      test_type: params.testType,
      file_name: params.file.name,
      file_path: filePath,
      notes: params.notes ?? null,
      test_date: params.testDate,
      status: 'Pending',
    })
    .select('*')
    .single();

  if (error) throw new ApiError(error.message);
  return data as LabReport;
}

export async function updateLabReportStatus(reportId: string, status: LabReport['status'], reviewNote?: string) {
  await requireSession();

  const { data: existing, error: existingError } = await supabase
    .from('lab_reports')
    .select('notes')
    .eq('id', reportId)
    .single();

  if (existingError) throw new ApiError(existingError.message);

  const notes = reviewNote
    ? [existing?.notes, `Reviewed note: ${reviewNote}`].filter(Boolean).join('\n\n')
    : existing?.notes ?? null;

  const { data, error } = await supabase
    .from('lab_reports')
    .update({ status, notes })
    .eq('id', reportId)
    .select('*, patient:profiles!lab_reports_patient_id_fkey(id, full_name, mrn, dob, gender), uploaded_by_profile:profiles!lab_reports_uploaded_by_fkey(id, full_name, role)')
    .single();

  if (error) throw new ApiError(error.message);
  return data as LabReport;
}

export async function fetchLabReports() {
  await requireSession();
  const { data, error } = await supabase
    .from('lab_reports')
    .select('*, patient:profiles!lab_reports_patient_id_fkey(id, full_name, mrn, dob, gender), uploaded_by_profile:profiles!lab_reports_uploaded_by_fkey(id, full_name, role)')
    .order('created_at', { ascending: false });

  if (error) throw new ApiError(error.message);
  return (data ?? []) as LabReport[];
}

export async function submitContactMessage(message: Omit<ContactMessage, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('contact_messages')
    .insert(message)
    .select('*')
    .single();

  if (error) throw new ApiError(error.message);
  return data as ContactMessage;
}

export async function getLabReportPublicUrl(filePath: string) {
  const { data } = supabase.storage.from('lab-reports').getPublicUrl(filePath);
  return data.publicUrl;
}
