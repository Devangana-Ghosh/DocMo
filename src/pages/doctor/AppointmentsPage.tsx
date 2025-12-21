import React, { useState } from 'react';
import { DoctorNavigation } from '../../components/DoctorNavigation';
import { Footer } from '../../components/Footer';
import { SkipLink } from '../../components/SkipLink';
import { AppointmentCard, AppointmentRequest } from '../../components/doctor/AppointmentCard';
const MOCK_REQUESTS: AppointmentRequest[] = [{
  id: '1',
  patientName: 'Alice Cooper',
  date: 'Nov 12, 2023',
  time: '10:00 AM',
  reason: 'Persistent headache for 3 days',
  type: 'Urgent'
}, {
  id: '2',
  patientName: 'James Wilson',
  date: 'Nov 14, 2023',
  time: '02:30 PM',
  reason: 'Annual physical checkup',
  type: 'New Patient'
}, {
  id: '3',
  patientName: 'Maria Garcia',
  date: 'Nov 15, 2023',
  time: '09:15 AM',
  reason: 'Follow-up on blood pressure medication',
  type: 'Follow-up'
}];
export function AppointmentsPage() {
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const handleAccept = (id: string) => {
    setRequests(requests.filter(r => r.id !== id));
    alert('Appointment accepted!');
  };
  const handleReject = (id: string) => {
    setRequests(requests.filter(r => r.id !== id));
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
                    Today, November 10
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {[{
                  time: '09:00 AM',
                  patient: 'Sarah Johnson',
                  reason: 'Follow-up',
                  duration: '30 min'
                }, {
                  time: '10:00 AM',
                  patient: 'Michael Chen',
                  reason: 'New Patient Consultation',
                  duration: '60 min'
                }, {
                  time: '11:30 AM',
                  patient: 'Emma Davis',
                  reason: 'Vaccination',
                  duration: '15 min'
                }, {
                  time: '02:00 PM',
                  patient: 'David Miller',
                  reason: 'Lab Results Review',
                  duration: '30 min'
                }].map((slot, i) => <div key={i} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50">
                      <div className="w-32 flex-shrink-0">
                        <p className="text-xl font-bold text-teal-800">
                          {slot.time}
                        </p>
                        <p className="text-sm text-gray-500">{slot.duration}</p>
                      </div>
                      <div className="flex-grow">
                        <p className="text-lg font-bold text-gray-900">
                          {slot.patient}
                        </p>
                        <p className="text-gray-600">{slot.reason}</p>
                      </div>
                      <button className="text-teal-700 font-bold hover:underline">
                        View Details
                      </button>
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