import React, { useEffect, useMemo, useState } from 'react';
import { DoctorNavigation } from '../../components/DoctorNavigation';
import { Footer } from '../../components/Footer';
import { SkipLink } from '../../components/SkipLink';
import { Button } from '../../components/ui/Button';
import { Check, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchDoctorAvailabilitySchedule, saveDoctorAvailabilitySchedule } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import i18n from '../../i18n';

export function AvailabilityPage() {
  const { profile } = useAuth();
  const toast = useToast();
  const days = useMemo(
    () => [
      { label: 'Mon', value: 1 },
      { label: 'Tue', value: 2 },
      { label: 'Wed', value: 3 },
      { label: 'Thu', value: 4 },
      { label: 'Fri', value: 5 },
    ],
    [],
  );
  const times = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSchedule = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const slots = await fetchDoctorAvailabilitySchedule(profile.id);
        const next: Record<string, boolean> = {};

        slots.forEach((slot) => {
          const day = days.find((item) => item.value === slot.day_of_week);
          if (!day) return;
          next[`${day.label}-${slot.slot_time}`] = true;
        });

        setAvailability(next);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load availability schedule.');
      } finally {
        setLoading(false);
      }
    };

    void loadSchedule();
  }, [days, profile?.id]);

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
        if (time !== '01:00 PM') {
          // Lunch break
          newAvail[`${day.label}-${time}`] = true;
        }
      });
    });
    setAvailability(newAvail);
  };

  const handleSave = async () => {
    if (!profile?.id || saving) return;

    try {
      setSaving(true);
      setError('');

      const slots = Object.entries(availability)
        .filter(([, enabled]) => Boolean(enabled))
        .map(([key]) => {
          const [dayLabel, slotTime] = key.split('-');
          const day = days.find((item) => item.label === dayLabel);
          return day ? { dayOfWeek: day.value, slotTime } : null;
        })
        .filter((item): item is { dayOfWeek: number; slotTime: string } => Boolean(item));

      await saveDoctorAvailabilitySchedule(profile.id, slots);
      toast.success('Availability saved', 'Your booking schedule has been updated.');
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Unable to save schedule.';
      setError(message);
      toast.error('Save failed', message);
    } finally {
      setSaving(false);
    }
  };

  return <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SkipLink />
      <DoctorNavigation />

      <main id="main-content" className="outline-none py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
            <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {i18n.t('nav.availability', { defaultValue: 'Availability' })}
                </h1>
                <p className="text-xl text-gray-600">
                  {i18n.t('availabilityPage.subtitle', { defaultValue: 'Set your weekly schedule for patient bookings.' })}
                </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={setStandardHours}>
                Set Standard (9-5)
              </Button>
              <Button className="bg-teal-700 hover:bg-teal-800 border-teal-700" onClick={() => void handleSave()} isLoading={saving}>
                Save Schedule
              </Button>
            </div>
          </div>

          {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-x-auto">
            <div className="min-w-[800px] p-8">
              <div className="grid grid-cols-6 gap-4 mb-4">
                <div className="font-bold text-gray-500 text-lg">Time</div>
                {days.map(day => <div key={day.label} className="font-bold text-gray-900 text-lg text-center">
                    {day.label}
                  </div>)}
              </div>

              {loading && <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">Loading saved schedule...</div>}

              {times.map(time => <div key={time} className="grid grid-cols-6 gap-4 mb-4">
                  <div className="font-medium text-gray-500 flex items-center">
                    {time}
                  </div>
                  {days.map(day => {
                const isAvailable = availability[`${day.label}-${time}`];
                return <button key={`${day.label}-${time}`} onClick={() => toggleSlot(day.label, time)} className={`
                          h-14 rounded-lg border-2 transition-all flex items-center justify-center
                          focus:outline-none focus:ring-4 focus:ring-teal-500
                          ${isAvailable ? 'bg-teal-100 border-teal-300 text-teal-800' : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300'}
                        `} aria-label={`${isAvailable ? 'Available' : 'Unavailable'} on ${day.label} at ${time}`} aria-pressed={isAvailable}>
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