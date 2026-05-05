import { useEffect, useMemo, useState } from 'react';
import { DoctorNavigation } from '../../components/DoctorNavigation';
import { Footer } from '../../components/Footer';
import { SkipLink } from '../../components/SkipLink';
import { Users, Calendar, Clock, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchAppointmentsByDoctor, fetchDoctorPatients, fetchPrescriptionsByDoctor } from '../../services/api';
import type { Appointment } from '../../types/backend';
import { useTranslation } from 'react-i18next';

export function DoctorDashboard() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientCount, setPatientCount] = useState(0);
  const [prescriptionCount, setPrescriptionCount] = useState(0);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!profile) return;

      const [appointmentsData, patientsData, prescriptionsData] = await Promise.all([
        fetchAppointmentsByDoctor(profile.id),
        fetchDoctorPatients(profile.id),
        fetchPrescriptionsByDoctor(profile.id),
      ]);

      setAppointments(appointmentsData);
      setPatientCount(patientsData.length);
      setPrescriptionCount(prescriptionsData.filter((item) => item.status === 'Active').length);
    };

    void loadDashboard();
  }, [profile]);

  const stats = [
    {
      label: t('doctorDashboard.totalPatients'),
      value: String(patientCount),
      icon: Users,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      label: t('doctorDashboard.todayAppointments'),
      value: String(appointments.filter((item) => item.status === 'Confirmed' || item.status === 'Pending').length),
      icon: Calendar,
      color: 'bg-green-100 text-green-800',
    },
    {
      label: t('doctorDashboard.pendingRequests'),
      value: String(appointments.filter((item) => item.status === 'Pending').length),
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      label: t('doctorDashboard.activePrescriptions'),
      value: String(prescriptionCount),
      icon: FileText,
      color: 'bg-purple-100 text-purple-800',
    },
  ];

  const upcoming = useMemo(
    () => appointments.filter((item) => item.status === 'Confirmed' || item.status === 'Pending').slice(0, 3),
    [appointments],
  );

  return <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SkipLink />
      <DoctorNavigation />

      <main id="main-content" className="outline-none py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('doctorDashboard.welcome', { name: profile?.full_name ?? t('doctorDashboard.doctorFallback') })}
            </h1>
            <p className="text-xl text-gray-600">
              {t('doctorDashboard.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map(stat => <div key={stat.label} className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm flex items-center gap-4">
                <div className={`p-4 rounded-full ${stat.color}`}>
                  <stat.icon className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </div>
              </div>)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b-2 border-gray-100 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {t('doctorDashboard.upcoming')}
                  </h2>
                  <Link to="/doctor/appointments" className="text-teal-700 font-bold hover:underline flex items-center">
                    {t('doctorDashboard.viewAll')} <ArrowRight className="ml-1 h-5 w-5" />
                  </Link>
                </div>
                <div className="divide-y divide-gray-100">
                  {upcoming.map((appointment) => <div key={appointment.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-6">
                        <span className="text-lg font-bold text-gray-900 w-24">
                          {appointment.appointment_time}
                        </span>
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {appointment.patient?.full_name ?? t('doctorDashboard.patientFallback')}
                          </p>
                          <p className="text-gray-600">{appointment.reason}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {appointment.status}
                      </span>
                    </div>)}
                  {upcoming.length === 0 && <div className="p-6 text-gray-600">{t('doctorDashboard.noUpcoming')}</div>}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="bg-teal-800 text-white rounded-xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold mb-6">{t('doctorDashboard.quickActions')}</h2>
                <div className="space-y-4">
                  <Link to="/doctor/prescriptions" className="block w-full bg-white/10 hover:bg-white/20 border-2 border-white/20 rounded-lg p-4 text-left transition-colors">
                    <span className="font-bold block text-lg">
                      {t('doctorDashboard.newPrescription')}
                    </span>
                    <span className="text-teal-100 text-sm">
                      {t('doctorDashboard.newPrescriptionHelp')}
                    </span>
                  </Link>
                  <Link to="/doctor/patients" className="block w-full bg-white/10 hover:bg-white/20 border-2 border-white/20 rounded-lg p-4 text-left transition-colors">
                    <span className="font-bold block text-lg">
                      {t('doctorDashboard.findPatient')}
                    </span>
                    <span className="text-teal-100 text-sm">
                      {t('doctorDashboard.findPatientHelp')}
                    </span>
                  </Link>
                  <Link to="/doctor/availability" className="block w-full bg-white/10 hover:bg-white/20 border-2 border-white/20 rounded-lg p-4 text-left transition-colors">
                    <span className="font-bold block text-lg">
                      {t('doctorDashboard.updateSchedule')}
                    </span>
                    <span className="text-teal-100 text-sm">
                      {t('doctorDashboard.updateScheduleHelp')}
                    </span>
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>;
}
