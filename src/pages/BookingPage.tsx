import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { SkipLink } from '../components/SkipLink';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ChevronLeft, CheckCircle, Calendar, Clock } from 'lucide-react';
export function BookingPage() {
  const {
    id
  } = useParams();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  // Mock doctor data (in real app, fetch based on ID)
  const doctor = {
    name: 'Dr. Sarah Wilson',
    specialty: 'Cardiologist',
    location: 'Central Heart Institute',
    price: '$150'
  };
  const timeSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'];
  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };
  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3); // Success state
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
                  Choose Date
                </label>
                <input type="date" className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-800 focus:ring-4 focus:ring-yellow-400" onChange={handleDateSelect} min={new Date().toISOString().split('T')[0]} />
              </div>

              {selectedDate && <div className="mb-8">
                  <label className="block text-lg font-bold text-gray-900 mb-3">
                    Available Slots
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {timeSlots.map(time => <button key={time} onClick={() => handleTimeSelect(time)} className={`
                          p-3 rounded-lg text-lg font-medium border-2 transition-colors
                          focus:outline-none focus:ring-4 focus:ring-yellow-400
                          ${selectedTime === time ? 'bg-blue-800 text-white border-blue-800' : 'bg-white text-gray-900 border-gray-300 hover:border-blue-500'}
                        `} aria-pressed={selectedTime === time}>
                        {time}
                      </button>)}
                  </div>
                </div>}

              <div className="flex justify-end mt-8">
                <Button disabled={!selectedDate || !selectedTime} onClick={() => setStep(2)} rightIcon={<ChevronLeft className="w-5 h-5 rotate-180" />}>
                  Continue
                </Button>
              </div>
            </section>}

          {step === 2 && <section aria-labelledby="step2-heading" className="bg-white rounded-xl border-2 border-gray-200 p-8 shadow-sm">
              <h2 id="step2-heading" className="text-2xl font-bold text-gray-900 mb-6">
                2. Patient Details
              </h2>

              <form onSubmit={handleConfirm}>
                <Input label="Full Name" placeholder="Enter your full name" required />
                <Input label="Email Address" type="email" placeholder="name@example.com" required />
                <Input label="Phone Number" type="tel" placeholder="(555) 123-4567" required />

                <div className="mb-6">
                  <label className="block text-lg font-bold text-gray-900 mb-2">
                    Reason for Visit
                  </label>
                  <textarea className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-800 focus:ring-4 focus:ring-yellow-400 min-h-[120px]" placeholder="Briefly describe your symptoms or reason for visit..."></textarea>
                </div>

                <div className="flex justify-between items-center mt-8 pt-6 border-t-2 border-gray-100">
                  <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit">Confirm Booking</Button>
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
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/documents">
                  <Button variant="secondary">Upload Medical Records</Button>
                </Link>
                <Link to="/">
                  <Button>Return Home</Button>
                </Link>
              </div>
            </section>}
        </div>
      </main>

      <Footer />
    </div>;
}