import React from 'react';
import { DoctorNavigation } from '../../components/DoctorNavigation';
import { Footer } from '../../components/Footer';
import { SkipLink } from '../../components/SkipLink';
import { Users, Calendar, Clock, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
export function DoctorDashboard() {
  const stats = [{
    label: 'Total Patients',
    value: '1,248',
    icon: Users,
    color: 'bg-blue-100 text-blue-800'
  }, {
    label: "Today's Appointments",
    value: '8',
    icon: Calendar,
    color: 'bg-green-100 text-green-800'
  }, {
    label: 'Pending Requests',
    value: '3',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800'
  }, {
    label: 'Active Prescriptions',
    value: '142',
    icon: FileText,
    color: 'bg-purple-100 text-purple-800'
  }];
  return <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SkipLink />
      <DoctorNavigation />

      <main id="main-content" className="outline-none py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, Dr. Wilson
            </h1>
            <p className="text-xl text-gray-600">
              Here's what's happening in your practice today.
            </p>
          </div>

          {/* Stats Grid */}
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
            {/* Recent Activity */}
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b-2 border-gray-100 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Upcoming Appointments
                  </h2>
                  <Link to="/doctor/appointments" className="text-teal-700 font-bold hover:underline flex items-center">
                    View All <ArrowRight className="ml-1 h-5 w-5" />
                  </Link>
                </div>
                <div className="divide-y divide-gray-100">
                  {[{
                  time: '09:00 AM',
                  patient: 'Sarah Johnson',
                  type: 'Follow-up',
                  status: 'Confirmed'
                }, {
                  time: '10:30 AM',
                  patient: 'Michael Chen',
                  type: 'New Patient',
                  status: 'Confirmed'
                }, {
                  time: '02:00 PM',
                  patient: 'Emma Davis',
                  type: 'Check-up',
                  status: 'Pending'
                }].map((apt, i) => <div key={i} className="p-6 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-6">
                        <span className="text-lg font-bold text-gray-900 w-24">
                          {apt.time}
                        </span>
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {apt.patient}
                          </p>
                          <p className="text-gray-600">{apt.type}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${apt.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {apt.status}
                      </span>
                    </div>)}
                </div>
              </section>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <section className="bg-teal-800 text-white rounded-xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
                <div className="space-y-4">
                  <Link to="/doctor/prescriptions" className="block w-full bg-white/10 hover:bg-white/20 border-2 border-white/20 rounded-lg p-4 text-left transition-colors">
                    <span className="font-bold block text-lg">
                      New Prescription
                    </span>
                    <span className="text-teal-100 text-sm">
                      Issue digital RX instantly
                    </span>
                  </Link>
                  <Link to="/doctor/patients" className="block w-full bg-white/10 hover:bg-white/20 border-2 border-white/20 rounded-lg p-4 text-left transition-colors">
                    <span className="font-bold block text-lg">
                      Find Patient
                    </span>
                    <span className="text-teal-100 text-sm">
                      Search medical records
                    </span>
                  </Link>
                  <Link to="/doctor/availability" className="block w-full bg-white/10 hover:bg-white/20 border-2 border-white/20 rounded-lg p-4 text-left transition-colors">
                    <span className="font-bold block text-lg">
                      Update Schedule
                    </span>
                    <span className="text-teal-100 text-sm">
                      Manage availability
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