import { useEffect, useState } from 'react';
import { DoctorNavigation } from '../../components/DoctorNavigation';
import { Footer } from '../../components/Footer';
import { SkipLink } from '../../components/SkipLink';
import { AppointmentCard, AppointmentRequest } from '../../components/doctor/AppointmentCard';
import { fetchAppointmentsByDoctor, updateAppointmentStatus } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Appointment } from '../../types/backend';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';
import { buildGoogleCalendarEventUrl, sendConsultationAlert } from '../../services/integrations';

export function AppointmentsPage() {
  const { profile } = useAuth();
  const toast = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAppointments = async () => {
      if (!profile) return;

      try {
        const data = await fetchAppointmentsByDoctor(profile.id);
        setAppointments(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load appointments.');
      }
    };

    void loadAppointments();
  }, [profile]);

  const requests: AppointmentRequest[] = appointments
    .filter((item) => item.status === 'Pending')
    .map((item) => ({
      id: item.id,
      patientName: item.patient?.full_name ?? 'Patient',
      date: item.appointment_date,
      time: item.appointment_time,
      reason: item.reason,
      type: item.reason.toLowerCase().includes('follow') ? 'Follow-up' : 'New Patient',
    }));

  const schedule = appointments.filter((item) => item.status === 'Confirmed' || item.status === 'Completed');

  const handleAccept = async (id: string) => {
    try {
      const updated = await updateAppointmentStatus(id, 'Confirmed');
      setAppointments((current) => current.map((item) => (item.id === id ? updated : item)));

      const original = appointments.find((item) => item.id === id);
      await sendConsultationAlert({
        doctorName: profile?.full_name ?? 'Doctor',
        patientName: original?.patient?.full_name ?? 'Patient',
        doctorEmail: profile?.email,
        patientEmail: original?.patient?.email,
        appointmentDate: updated.appointment_date,
        appointmentTime: updated.appointment_time,
        appointmentType: updated.appointment_type,
        meetingLink: updated.meeting_link ?? undefined,
      }).catch(() => undefined);

      toast.success('Appointment accepted', 'The patient booking has been confirmed.');
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to accept appointment.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const updated = await updateAppointmentStatus(id, 'Rejected');
      setAppointments((current) => current.map((item) => (item.id === id ? { ...item, status: 'Rejected' } : item)));

      const original = appointments.find((item) => item.id === id);
      await sendConsultationAlert({
        doctorName: profile?.full_name ?? 'Doctor',
        patientName: original?.patient?.full_name ?? 'Patient',
        doctorEmail: profile?.email,
        patientEmail: original?.patient?.email,
        appointmentDate: updated.appointment_date,
        appointmentTime: updated.appointment_time,
        appointmentType: updated.appointment_type,
        meetingLink: updated.meeting_link ?? undefined,
      }).catch(() => undefined);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to reject appointment.');
    }
  };
  return <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SkipLink />
      <DoctorNavigation />

      <main id="main-content" className="outline-none py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Appointments
            </h1>
            <p className="text-xl text-gray-600">
              Manage incoming requests and your schedule.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pending Requests */}
            <div className="lg:col-span-1 space-y-6">
              {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Pending Requests
                <span className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full">
                  {requests.length}
                </span>
              </h2>

              {requests.length > 0 ? requests.map(req => <AppointmentCard key={req.id} appointment={req} onAccept={handleAccept} onReject={handleReject} />) : <div className="bg-white p-8 rounded-xl border-2 border-gray-200 text-center text-gray-500">
                  No pending requests
                </div>}
            </div>

            {/* Calendar/Schedule View */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Upcoming Schedule
              </h2>
              <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b-2 border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">
                    Upcoming Confirmed Appointments
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {schedule.map((slot) => <div key={slot.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50">
                      <div className="w-32 flex-shrink-0">
                        <p className="text-xl font-bold text-teal-800">
                          {slot.appointment_time}
                        </p>
                        <p className="text-sm text-gray-500">30 min</p>
                      </div>
                      <div className="flex-grow">
                        <p className="text-lg font-bold text-gray-900">
                          {slot.patient?.full_name ?? 'Patient'}
                        </p>
                        <p className="text-gray-600">{slot.reason}</p>
                      </div>
                      <div className="flex flex-col sm:items-end gap-2">
                        <a
                          href={buildGoogleCalendarEventUrl({
                            title: `Consultation with ${slot.patient?.full_name ?? 'Patient'}`,
                            description: `${slot.appointment_type} consultation${slot.reason ? `\n\nReason: ${slot.reason}` : ''}${slot.meeting_link ? `\n\nMeeting: ${slot.meeting_link}` : ''}`,
                            location: slot.location,
                            appointmentDate: slot.appointment_date,
                            appointmentTime: slot.appointment_time,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 font-semibold hover:underline"
                        >
                          Add to Google Calendar
                        </a>
                        <Link to="/doctor/patients" className="text-teal-700 font-bold hover:underline">
                          View Details
                        </Link>
                      </div>
                    </div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>;
}