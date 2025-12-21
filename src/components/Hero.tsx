import React from 'react';
import { CalendarCheck, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
export function Hero() {
  return <section className="bg-white py-16 sm:py-24 lg:py-32" aria-labelledby="hero-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight">
          Book Doctor Appointments <br className="hidden sm:block" />
          <span className="text-blue-800 underline decoration-4 decoration-blue-300 underline-offset-4">
            Online & Accessible
          </span>
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-xl sm:text-2xl text-gray-700 leading-relaxed">
          Connect with top healthcare professionals easily. Our platform is
          designed for everyone, prioritizing clarity, speed, and ease of use.
        </p>

        <div className="mt-10 flex justify-center gap-6 flex-col sm:flex-row items-center">
          <Link to="/find-doctor" className="inline-flex items-center justify-center px-8 py-4 border-2 border-transparent text-xl font-bold rounded-lg text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-4 focus:ring-yellow-400 min-h-[56px] min-w-[200px] shadow-lg transition-transform active:scale-95">
            <CalendarCheck className="mr-3 h-6 w-6" aria-hidden="true" />
            Book Appointment
          </Link>

          <Link to="/find-doctor" className="inline-flex items-center justify-center px-8 py-4 border-2 border-blue-800 text-xl font-bold rounded-lg text-blue-900 bg-white hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-500 min-h-[56px] min-w-[200px] transition-colors">
            <Search className="mr-3 h-6 w-6" aria-hidden="true" />
            Find Specialist
          </Link>
        </div>
      </div>
    </section>;
}