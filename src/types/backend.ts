export type UserRole = 'patient' | 'doctor' | 'lab';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email?: string;
  specialty?: string | null;
  mrn?: string | null;
  gender?: string | null;
  dob?: string | null;
  created_at?: string;
}

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rejected';

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: 'In-Person' | 'Video Call' | 'Phone Call';
  location: string;
  reason: string;
  status: AppointmentStatus;
  meeting_link?: string | null;
  created_at?: string;
  patient?: Pick<Profile, 'id' | 'full_name' | 'mrn' | 'gender' | 'dob' | 'email'>;
  doctor?: Pick<Profile, 'id' | 'full_name' | 'specialty' | 'email'>;
}

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  medication_name: string;
  medication_normalized?: string | null;
  rxcui?: string | null;
  rxnorm_verified?: boolean;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  status: 'Active' | 'Completed' | 'Refill Needed' | 'Cancelled';
  refills_remaining: number;
  created_at?: string;
  patient?: Pick<Profile, 'id' | 'full_name' | 'mrn'>;
  doctor?: Pick<Profile, 'id' | 'full_name' | 'specialty'>;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  created_at?: string;
}

export interface MedicalDocument {
  id: string;
  patient_id: string;
  name: string;
  type: 'Report' | 'Prescription' | 'Lab Result';
  file_path: string;
  file_size: number;
  created_at: string;
}

export interface LabReport {
  id: string;
  patient_id: string;
  uploaded_by: string;
  test_type: string;
  file_name: string;
  file_path: string;
  status: 'Pending' | 'Completed' | 'Reviewed';
  notes?: string | null;
  test_date: string;
  created_at: string;
  patient?: Pick<Profile, 'id' | 'full_name' | 'mrn' | 'dob' | 'gender'>;
  uploaded_by_profile?: Pick<Profile, 'id' | 'full_name' | 'role'>;
}
