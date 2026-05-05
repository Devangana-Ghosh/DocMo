import { useEffect, useState } from 'react';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { SkipLink } from '../components/SkipLink';
import { Calendar, Clock, MapPin, Video, Phone } from 'lucide-react';
import { fetchAppointmentsByPatient, updateAppointmentStatus } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Appointment } from '../types/backend';
import { useToast } from '../components/ui/Toast';
import { SHARED_MEET_LINK, buildGoogleCalendarEventUrl } from '../services/integrations';
import i18n from '../i18n';

export function AppointmentsPage() {
  const { profile } = useAuth();
  const toast = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);

  useEffect(() => {
    const loadAppointments = async () => {
      if (!profile) return;

      try {
        setLoading(true);
        const data = await fetchAppointmentsByPatient(profile.id);
        setAppointments(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load appointments.');
      } finally {
        setLoading(false);
      }
    };

    void loadAppointments();
  }, [profile]);

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') {
      return apt.status === 'Pending' || apt.status === 'Confirmed';
    }
    if (filter === 'completed') {
      return apt.status === 'Completed';
    }
    return apt.status === 'Cancelled' || apt.status === 'Rejected';
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Video Call':
        return <Video className="h-5 w-5" />;
      case 'Phone Call':
        return <Phone className="h-5 w-5" />;
      default:
        return <MapPin className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: Appointment['status']) => {
    const styles = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Confirmed': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Rejected': 'bg-red-100 text-red-800'
    };
    return styles[status as keyof typeof styles] || styles.Pending;
  };

  const handleCancel = async (id: string) => {
    try {
      const updated = await updateAppointmentStatus(id, 'Cancelled');
      setAppointments((current) => current.map((appointment) => (appointment.id === id ? updated : appointment)));
      toast.warning('Appointment cancelled', 'Your appointment has been cancelled.');
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : 'Failed to cancel appointment.');
    }
  };

  const handleJoinView = (apt: Appointment) => {
    if (apt.appointment_type === 'Video Call') {
      const meetingUrl = SHARED_MEET_LINK;
      // Open the meeting link - try multiple methods to avoid popup blockers
      const newWindow = window.open(meetingUrl, '_blank', 'noopener,noreferrer');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        toast.info('Video call link', `Open this link: ${meetingUrl}`);
      }
    } else if (apt.appointment_type === 'Phone Call') {
      toast.info('Phone appointment', `You will receive a call from ${apt.doctor?.full_name ?? 'Doctor'} at the scheduled time.`);
    } else {
      toast.info('In-person appointment', `${apt.appointment_date} at ${apt.appointment_time} • ${apt.location}`);
    }
  };

  const handleViewSummary = (apt: Appointment) => {
    toast.success('Appointment summary', `${apt.doctor?.full_name ?? 'Doctor'} on ${apt.appointment_date} at ${apt.appointment_time}.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SkipLink />
      <Navigation />

      <main id="main-content" className="outline-none py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {i18n.t('appointments.title', { defaultValue: 'My Appointments' })}
            </h1>
            <p className="text-xl text-gray-700">
              {i18n.t('appointments.subtitle', { defaultValue: 'View and manage your scheduled appointments.' })}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="mb-8 border-b border-gray-200">
            <nav className="flex space-x-8" aria-label="Appointment filters">
              {(['all', 'upcoming', 'completed', 'cancelled'] as const).map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-lg capitalize transition-colors
                    focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-t
                    ${filter === filterOption
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                  aria-current={filter === filterOption ? 'page' : undefined}
                >
                  {i18n.t(`appointments.filters.${filterOption}`, { defaultValue: filterOption })}
                </button>
              ))}
            </nav>
          </div>

          {/* Appointments List */}
          <div className="space-y-6">
            {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
                {loading ? (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
                <p className="text-xl text-gray-500">{i18n.t('appointments.loading', { defaultValue: 'Loading appointments...' })}</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-500">{i18n.t('appointments.noAppointments', { filter: filter !== 'all' ? i18n.t(`appointments.filters.${filter}`) : '' })}</p>
              </div>
            ) : (
              filteredAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left Section - Doctor Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">
                              {apt.doctor?.full_name ?? 'Doctor'}
                            </h3>
                            <p className="text-lg text-gray-600">{apt.doctor?.specialty ?? 'General'}</p>
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getStatusBadge(apt.status)}`}>
                            {apt.status}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center text-gray-700">
                            <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                            <span className="text-lg">{apt.appointment_date}</span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <Clock className="h-5 w-5 mr-3 text-blue-600" />
                            <span className="text-lg">{apt.appointment_time}</span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <span className="mr-3 text-blue-600">{getTypeIcon(apt.appointment_type)}</span>
                            <span className="text-lg">{apt.appointment_type} - {apt.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex lg:flex-col gap-3">
                        {(apt.status === 'Pending' || apt.status === 'Confirmed') && (
                          <>
                            <a
                              href={buildGoogleCalendarEventUrl({
                                title: `Appointment with ${apt.doctor?.full_name ?? 'Doctor'}`,
                                description: `${apt.appointment_type} consultation${apt.reason ? `\n\nReason: ${apt.reason}` : ''}${apt.appointment_type === 'Video Call' ? `\n\nMeeting: ${SHARED_MEET_LINK}` : ''}`,
                                location: apt.location,
                                appointmentDate: apt.appointment_date,
                                appointmentTime: apt.appointment_time,
                              })}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 lg:flex-none px-6 py-3 bg-white text-blue-700 border-2 border-blue-500 rounded-lg font-medium hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors text-center"
                            >
                              {i18n.t('booking.addCalendar', { defaultValue: 'Add to Google Calendar' })}
                            </a>
                            <button 
                              onClick={() => handleJoinView(apt)}
                              className="flex-1 lg:flex-none px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors"
                            >
                              {i18n.t('appointments.joinView', { defaultValue: 'Join / View' })}
                            </button>
                            <button 
                              onClick={() => setPendingCancelId(apt.id)}
                              className="flex-1 lg:flex-none px-6 py-3 bg-white text-red-600 border-2 border-red-600 rounded-lg font-medium hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-300 transition-colors"
                            >
                              {i18n.t('appointments.cancel', { defaultValue: 'Cancel' })}
                            </button>
                          </>
                        )}
                        {apt.status === 'Completed' && (
                          <>
                            <a
                              href={buildGoogleCalendarEventUrl({
                                title: `Appointment with ${apt.doctor?.full_name ?? 'Doctor'}`,
                                description: `${apt.appointment_type} consultation${apt.reason ? `\n\nReason: ${apt.reason}` : ''}${apt.appointment_type === 'Video Call' ? `\n\nMeeting: ${SHARED_MEET_LINK}` : ''}`,
                                location: apt.location,
                                appointmentDate: apt.appointment_date,
                                appointmentTime: apt.appointment_time,
                              })}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-6 py-3 bg-white text-blue-700 border-2 border-blue-500 rounded-lg font-medium hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors text-center"
                            >
                              {i18n.t('booking.addCalendar', { defaultValue: 'Add to Google Calendar' })}
                            </a>
                            <button 
                              onClick={() => handleViewSummary(apt)}
                              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-colors"
                            >
                              {i18n.t('appointments.viewSummary', { defaultValue: 'View Summary' })}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {pendingCancelId && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Cancel appointment?</h2>
            <p className="text-gray-700 mb-6">This will mark the appointment as cancelled.</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50"
                onClick={() => setPendingCancelId(null)}
              >
                Keep Appointment
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700"
                onClick={async () => {
                  const id = pendingCancelId;
                  setPendingCancelId(null);
                  if (id) await handleCancel(id);
                }}
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
