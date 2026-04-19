import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { SkipLink } from '../components/SkipLink';
import { Button } from '../components/ui/Button';
import { ChevronLeft, CheckCircle, Calendar, Clock } from 'lucide-react';
import { fetchProfilesByRole, createAppointment } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import type { Appointment } from '../types/backend';
import { createVideoConsultationLink, fetchDoctorAvailability, sendConsultationAlert } from '../services/integrations';
export function BookingPage() {
  const {
    id
  } = useParams();
  const { profile } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState<Appointment['appointment_type']>('In-Person');
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [doctor, setDoctor] = useState({
    id: '',
    name: 'Doctor',
    specialty: 'Specialist',
    email: '',
    location: 'DocMo Medical Center',
    price: '$150'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDoctor = async () => {
      try {
        const doctors = await fetchProfilesByRole('doctor');
        const matched = doctors.find((d) => d.id === id) ?? doctors[0];
        if (!matched) return;
        setDoctor({
          id: matched.id,
          name: matched.full_name,
          specialty: matched.specialty ?? 'General Physician',
          email: matched.email ?? '',
          location: 'DocMo Medical Center',
          price: '$150',
        });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load doctor details.');
      }
    };

    void loadDoctor();
  }, [id]);

  useEffect(() => {
    const loadSlots = async () => {
      if (!doctor.id || !selectedDate) {
        setTimeSlots([]);
        return;
      }

      setSlotLoading(true);
      try {
        const slots = await fetchDoctorAvailability(doctor.id, selectedDate);
        setTimeSlots(slots);
      } catch {
        setTimeSlots([]);
      } finally {
        setSlotLoading(false);
      }
    };

    void loadSlots();
  }, [doctor.id, selectedDate]);

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setSelectedTime('');
  };
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };
  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !doctor.id) return;

    setSubmitting(true);
    setError('');

    try {
      const isVideo = appointmentType === 'Video Call';
      const meetingLink = isVideo
        ? await createVideoConsultationLink({
            doctorName: doctor.name,
            patientName: profile.full_name,
            date: selectedDate,
            time: selectedTime,
            doctorEmail: doctor.email || undefined,
            patientEmail: profile.email || undefined,
          })
        : undefined;

      const created = await createAppointment({
        patient_id: profile.id,
        doctor_id: doctor.id,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        appointment_type: appointmentType,
        location: appointmentType === 'In-Person' ? doctor.location : 'Online Consultation',
        meeting_link: meetingLink,
        reason,
      });

      setConfirmedAppointment(created);

      await sendConsultationAlert({
        doctorName: doctor.name,
        patientName: profile.full_name,
        doctorEmail: doctor.email,
        patientEmail: profile.email,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        appointmentType,
        meetingLink: meetingLink,
      }).catch(() => undefined);

      setStep(3);
      toast.success('Appointment booked', `${doctor.name} on ${selectedDate} at ${selectedTime} (${appointmentType}).`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to book appointment.');
    } finally {
      setSubmitting(false);
    }
  };
  return <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SkipLink />
      <Navigation />

      <main id="main-content" className="outline-none py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Link to="/find-doctor" className="inline-flex items-center text-blue-800 font-bold hover:underline mb-8 focus:outline-none focus:ring-4 focus:ring-yellow-400 rounded-lg px-2 py-1">
            <ChevronLeft className="w-5 h-5 mr-1" aria-hidden="true" />
            Back to Search
          </Link>

          {step < 3 && <div className="bg-white rounded-xl border-2 border-gray-200 p-8 shadow-sm mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Book Appointment
              </h1>
              <p className="text-xl text-gray-700 mb-6">
                with <span className="font-bold">{doctor.name}</span> (
                {doctor.specialty})
              </p>

              <div className="flex items-center gap-4 text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-800" />
                  <span className="font-medium">
                    {selectedDate || 'Select Date'}
                  </span>
                </div>
                <div className="h-4 w-px bg-blue-200"></div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-800" />
                  <span className="font-medium">
                    {selectedTime || 'Select Time'}
                  </span>
                </div>
              </div>
            </div>}

          {step === 1 && <section aria-labelledby="step1-heading" className="bg-white rounded-xl border-2 border-gray-200 p-8 shadow-sm">
              <h2 id="step1-heading" className="text-2xl font-bold text-gray-900 mb-6">
                1. Select Date & Time
              </h2>

              <div className="mb-8">
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  Consultation Type
                </label>
                <select
                  className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-800 focus:ring-4 focus:ring-yellow-400"
                  value={appointmentType}
                  onChange={(event) => setAppointmentType(event.target.value as Appointment['appointment_type'])}
                >
                  <option value="In-Person">In-Person</option>
                  <option value="Video Call">Video Call</option>
                </select>
              </div>

              <div className="mb-8">
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  Choose Date
                </label>
                <input type="date" className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-800 focus:ring-4 focus:ring-yellow-400" onChange={handleDateSelect} min={new Date().toISOString().split('T')[0]} />
              </div>

              {selectedDate && <div className="mb-8">
                  <label className="block text-lg font-bold text-gray-900 mb-3">
                    Available Slots
                  </label>
                  {slotLoading && <p className="text-sm text-gray-500 mb-3">Fetching latest availability...</p>}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {timeSlots.map(time => <button key={time} onClick={() => handleTimeSelect(time)} className={`
                          p-3 rounded-lg text-lg font-medium border-2 transition-colors
                          focus:outline-none focus:ring-4 focus:ring-yellow-400
                          ${selectedTime === time ? 'bg-blue-800 text-white border-blue-800' : 'bg-white text-gray-900 border-gray-300 hover:border-blue-500'}
                        `} aria-pressed={selectedTime === time}>
                        {time}
                      </button>)}
                  </div>
                  {!slotLoading && timeSlots.length === 0 && <p className="text-sm text-gray-500 mt-3">No slots available for this date.</p>}
                </div>}

              <div className="flex justify-end mt-8">
                <Button disabled={!selectedDate || !selectedTime} onClick={() => setStep(2)} rightIcon={<ChevronLeft className="w-5 h-5 rotate-180" />}>
                  Continue
                </Button>
              </div>
            </section>}

          {step === 2 && <section aria-labelledby="step2-heading" className="bg-white rounded-xl border-2 border-gray-200 p-8 shadow-sm">
              <h2 id="step2-heading" className="text-2xl font-bold text-gray-900 mb-6">
                2. Confirm Details
              </h2>

              <form onSubmit={handleConfirm}>
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
                    {error}
                  </div>
                )}

                <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="font-bold text-blue-900 mb-2">Booked under your profile</p>
                  <p className="text-gray-800">Name: {profile?.full_name ?? 'Patient'}</p>
                  <p className="text-gray-800">Email: {profile?.email ?? 'Not available'}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-lg font-bold text-gray-900 mb-2">
                    Reason for Visit
                  </label>
                  <textarea className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-800 focus:ring-4 focus:ring-yellow-400 min-h-[120px]" placeholder="Briefly describe your symptoms or reason for visit..." value={reason} onChange={(event) => setReason(event.target.value)} required></textarea>
                </div>

                <div className="flex justify-between items-center mt-8 pt-6 border-t-2 border-gray-100">
                  <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit" isLoading={submitting}>Confirm Booking</Button>
                </div>
              </form>
            </section>}

          {step === 3 && <section aria-labelledby="success-heading" className="bg-white rounded-xl border-2 border-green-200 p-10 shadow-sm text-center">
              <div className="flex justify-center mb-6">
                <CheckCircle className="w-20 h-20 text-green-600" aria-hidden="true" />
              </div>
              <h2 id="success-heading" className="text-3xl font-bold text-gray-900 mb-4">
                Appointment Confirmed!
              </h2>
              <p className="text-xl text-gray-700 mb-8">
                Your appointment with{' '}
                <span className="font-bold">{doctor.name}</span> has been booked
                for{' '}
                <span className="font-bold">
                  {selectedDate} at {selectedTime}
                </span>
                .
              </p>
              {confirmedAppointment && <div className="mx-auto mb-8 max-w-xl rounded-xl border border-green-200 bg-green-50 p-6 text-left">
                  <p className="font-bold text-green-900 mb-3">Appointment Details</p>
                  <div className="space-y-2 text-gray-800">
                    <p><span className="font-semibold">Appointment ID:</span> {confirmedAppointment.id}</p>
                    <p><span className="font-semibold">Doctor:</span> {doctor.name}</p>
                    <p><span className="font-semibold">Date:</span> {confirmedAppointment.appointment_date}</p>
                    <p><span className="font-semibold">Time:</span> {confirmedAppointment.appointment_time}</p>
                    <p><span className="font-semibold">Location:</span> {confirmedAppointment.location}</p>
                    <p><span className="font-semibold">Status:</span> {confirmedAppointment.status}</p>
                    <p><span className="font-semibold">Type:</span> {confirmedAppointment.appointment_type}</p>
                    {confirmedAppointment.meeting_link && <p><span className="font-semibold">Meeting Link:</span> <a href={confirmedAppointment.meeting_link} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">Join Video Consultation</a></p>}
                  </div>
                </div>}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/documents">
                  <Button variant="secondary">Upload Medical Records</Button>
                </Link>
                <Link to="/appointments">
                  <Button>View Appointments</Button>
                </Link>
              </div>
            </section>}
        </div>
      </main>

      <Footer />
    </div>;
}