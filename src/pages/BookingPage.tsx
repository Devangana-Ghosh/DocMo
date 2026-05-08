import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { SkipLink } from '../components/SkipLink';
import { Button } from '../components/ui/Button';
import { ChevronLeft, CheckCircle, Calendar, Clock } from 'lucide-react';
import { fetchProfilesByRole, createAppointment, fetchDoctorAvailabilityForDate } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import type { Appointment } from '../types/backend';
import { SHARED_MEET_LINK, fetchDoctorAvailability, sendConsultationAlert } from '../services/integrations';
import { useTranslation } from 'react-i18next';
export function BookingPage() {
  const { t } = useTranslation();
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
        setError(loadError instanceof Error ? loadError.message : t('booking.loadDoctorError'));
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
        const customSlots = await fetchDoctorAvailabilityForDate(doctor.id, selectedDate);
        const slots = customSlots ?? await fetchDoctorAvailability(doctor.id, selectedDate);
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
      const meetingUrl = isVideo ? SHARED_MEET_LINK : undefined;

      const created = await createAppointment({
        patient_id: profile.id,
        doctor_id: doctor.id,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        appointment_type: appointmentType,
        location: appointmentType === 'In-Person' ? doctor.location : 'Online Consultation',
        meeting_link: meetingUrl ?? undefined,
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
        meetingLink: meetingUrl ?? undefined,
      }).catch(() => undefined);

      setStep(3);
      toast.success(t('booking.bookedToastTitle'), t('booking.bookedToastMessage', { name: doctor.name, date: selectedDate, time: selectedTime, type: appointmentType }));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t('booking.bookError'));
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
            {t('booking.backToSearch')}
          </Link>

          {step < 3 && <div className="bg-white rounded-xl border-2 border-gray-200 p-8 shadow-sm mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('booking.bookAppointment')}
              </h1>
              <p className="text-xl text-gray-700 mb-6">
                {t('booking.withDoctor', { name: doctor.name, specialty: doctor.specialty })}
              </p>

              <div className="flex items-center gap-4 text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-800" />
                  <span className="font-medium">
                    {selectedDate || t('booking.selectDate')}
                  </span>
                </div>
                <div className="h-4 w-px bg-blue-200"></div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-800" />
                  <span className="font-medium">
                    {selectedTime || t('booking.selectTime')}
                  </span>
                </div>
              </div>
            </div>}

          {step === 1 && <section aria-labelledby="step1-heading" className="bg-white rounded-xl border-2 border-gray-200 p-8 shadow-sm">
              <h2 id="step1-heading" className="text-2xl font-bold text-gray-900 mb-6">
                {t('booking.step1')}
              </h2>

              <div className="mb-8">
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  {t('booking.consultationType')}
                </label>
                <select
                  className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-800 focus:ring-4 focus:ring-yellow-400"
                  value={appointmentType}
                  onChange={(event) => setAppointmentType(event.target.value as Appointment['appointment_type'])}
                >
                  <option value="In-Person">{t('booking.inPerson')}</option>
                  <option value="Video Call">{t('booking.videoCall')}</option>
                </select>
              </div>

              <div className="mb-8">
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  {t('booking.chooseDate')}
                </label>
                <input type="date" className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-800 focus:ring-4 focus:ring-yellow-400" onChange={handleDateSelect} min={new Date().toISOString().split('T')[0]} />
              </div>

              {selectedDate && <div className="mb-8">
                  <label className="block text-lg font-bold text-gray-900 mb-3">
                    {t('booking.availableSlots')}
                  </label>
                  {slotLoading && <p className="text-sm text-gray-500 mb-3">{t('booking.fetchingSlots')}</p>}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {timeSlots.map(time => <button key={time} onClick={() => handleTimeSelect(time)} className={`
                          p-3 rounded-lg text-lg font-medium border-2 transition-colors
                          focus:outline-none focus:ring-4 focus:ring-yellow-400
                          ${selectedTime === time ? 'bg-blue-800 text-white border-blue-800' : 'bg-white text-gray-900 border-gray-300 hover:border-blue-500'}
                        `} aria-pressed={selectedTime === time}>
                        {time}
                      </button>)}
                  </div>
                  {!slotLoading && timeSlots.length === 0 && <p className="text-sm text-gray-500 mt-3">{t('booking.noSlots')}</p>}
                </div>}

              <div className="flex justify-end mt-8">
                <Button disabled={!selectedDate || !selectedTime} onClick={() => setStep(2)} rightIcon={<ChevronLeft className="w-5 h-5 rotate-180" />}>
                  {t('booking.continue')}
                </Button>
              </div>
            </section>}

          {step === 2 && <section aria-labelledby="step2-heading" className="bg-white rounded-xl border-2 border-gray-200 p-8 shadow-sm">
              <h2 id="step2-heading" className="text-2xl font-bold text-gray-900 mb-6">
                {t('booking.step2')}
              </h2>

              <form onSubmit={handleConfirm}>
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
                    {error}
                  </div>
                )}

                <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="font-bold text-blue-900 mb-2">{t('booking.bookedUnderProfile')}</p>
                  <p className="text-gray-800">{t('booking.name')}: {profile?.full_name ?? t('booking.patient')}</p>
                  <p className="text-gray-800">{t('booking.email')}: {profile?.email ?? t('booking.notAvailable')}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-lg font-bold text-gray-900 mb-2">
                    {t('booking.reasonForVisit')}
                  </label>
                  <textarea className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-800 focus:ring-4 focus:ring-yellow-400 min-h-[120px]" placeholder={t('booking.reasonPlaceholder')} value={reason} onChange={(event) => setReason(event.target.value)} required></textarea>
                </div>

                <div className="flex justify-between items-center mt-8 pt-6 border-t-2 border-gray-100">
                  <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                    {t('booking.back')}
                  </Button>
                  <Button type="submit" isLoading={submitting}>{t('booking.confirmBooking')}</Button>
                </div>
              </form>
            </section>}

          {step === 3 && <section aria-labelledby="success-heading" className="bg-white rounded-xl border-2 border-green-200 p-10 shadow-sm text-center">
              <div className="flex justify-center mb-6">
                <CheckCircle className="w-20 h-20 text-green-600" aria-hidden="true" />
              </div>
              <h2 id="success-heading" className="text-3xl font-bold text-gray-900 mb-4">
                {t('booking.successTitle')}
              </h2>
              <p className="text-xl text-gray-700 mb-8">
                {t('booking.successMessage', { name: doctor.name, date: selectedDate, time: selectedTime })}
              </p>
              {confirmedAppointment && <div className="mx-auto mb-8 max-w-xl rounded-xl border border-green-200 bg-green-50 p-6 text-left">
                  <p className="font-bold text-green-900 mb-3">{t('booking.detailsTitle')}</p>
                  <div className="space-y-2 text-gray-800">
                    <p><span className="font-semibold">{t('booking.appointmentId')}:</span> {confirmedAppointment.id}</p>
                    <p><span className="font-semibold">{t('booking.doctor')}:</span> {doctor.name}</p>
                    <p><span className="font-semibold">{t('booking.date')}:</span> {confirmedAppointment.appointment_date}</p>
                    <p><span className="font-semibold">{t('booking.time')}:</span> {confirmedAppointment.appointment_time}</p>
                    <p><span className="font-semibold">{t('booking.location')}:</span> {confirmedAppointment.location}</p>
                    <p><span className="font-semibold">{t('booking.status')}:</span> {confirmedAppointment.status}</p>
                    <p><span className="font-semibold">{t('booking.type')}:</span> {confirmedAppointment.appointment_type}</p>
                    {appointmentType === 'Video Call' ? <p><span className="font-semibold">{t('booking.meetingLink')}:</span> <a href={SHARED_MEET_LINK} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">{t('booking.joinVideo')}</a></p> : null}
                  </div>
                </div>}
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/documents">
                  <Button variant="secondary">{t('booking.uploadRecords')}</Button>
                </Link>
                <Link to="/appointments">
                  <Button>{t('booking.viewAppointments')}</Button>
                </Link>
              </div>
            </section>}
        </div>
      </main>

      <Footer />
    </div>;
}