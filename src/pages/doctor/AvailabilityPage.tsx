import React, { useState } from 'react';
import { DoctorNavigation } from '../../components/DoctorNavigation';
import { Footer } from '../../components/Footer';
import { SkipLink } from '../../components/SkipLink';
import { Button } from '../../components/ui/Button';
import { Check, Clock } from 'lucide-react';
export function AvailabilityPage() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  // Mock state for availability grid (true = available)
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const toggleSlot = (day: string, time: string) => {
    const key = `${day}-${time}`;
    setAvailability(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  const setStandardHours = () => {
    const newAvail: Record<string, boolean> = {};
    days.forEach(day => {
      times.forEach(time => {
        if (time !== '13:00') {
          // Lunch break
          newAvail[`${day}-${time}`] = true;
        }
      });
    });
    setAvailability(newAvail);
  };
  return <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SkipLink />
      <DoctorNavigation />

      <main id="main-content" className="outline-none py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Availability
              </h1>
              <p className="text-xl text-gray-600">
                Set your weekly schedule for patient bookings.
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={setStandardHours}>
                Set Standard (9-5)
              </Button>
              <Button className="bg-teal-700 hover:bg-teal-800 border-teal-700">
                Save Schedule
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-x-auto">
            <div className="min-w-[800px] p-8">
              <div className="grid grid-cols-6 gap-4 mb-4">
                <div className="font-bold text-gray-500 text-lg">Time</div>
                {days.map(day => <div key={day} className="font-bold text-gray-900 text-lg text-center">
                    {day}
                  </div>)}
              </div>

              {times.map(time => <div key={time} className="grid grid-cols-6 gap-4 mb-4">
                  <div className="font-medium text-gray-500 flex items-center">
                    {time}
                  </div>
                  {days.map(day => {
                const isAvailable = availability[`${day}-${time}`];
                return <button key={`${day}-${time}`} onClick={() => toggleSlot(day, time)} className={`
                          h-14 rounded-lg border-2 transition-all flex items-center justify-center
                          focus:outline-none focus:ring-4 focus:ring-teal-500
                          ${isAvailable ? 'bg-teal-100 border-teal-300 text-teal-800' : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300'}
                        `} aria-label={`${isAvailable ? 'Available' : 'Unavailable'} on ${day} at ${time}`} aria-pressed={isAvailable}>
                        {isAvailable ? <Check className="h-6 w-6" /> : <Clock className="h-5 w-5 opacity-20" />}
                      </button>;
              })}
                </div>)}
            </div>
          </div>

          <div className="mt-8 bg-blue-50 p-6 rounded-xl border-2 border-blue-100">
            <h3 className="text-lg font-bold text-blue-900 mb-2">
              Note on Scheduling
            </h3>
            <p className="text-blue-800">
              Changes to your availability will not affect existing
              appointments. To cancel or reschedule existing bookings, please
              visit the Appointments page.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>;
}