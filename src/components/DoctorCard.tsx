import React from 'react';
import { Star, MapPin, Clock, Calendar } from 'lucide-react';
import { Button } from './ui/Button';
import { Link } from 'react-router-dom';
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  location: string;
  nextAvailable: string;
  imageUrl: string;
  price: string;
}
interface DoctorCardProps {
  doctor: Doctor;
}
export function DoctorCard({
  doctor
}: DoctorCardProps) {
  return <article className="bg-white rounded-xl border-2 border-gray-200 p-6 flex flex-col md:flex-row gap-6 hover:border-blue-500 transition-colors shadow-sm">
      <div className="flex-shrink-0">
        <img src={doctor.imageUrl} alt={`Portrait of ${doctor.name}`} className="w-32 h-32 rounded-full object-cover border-4 border-blue-50" />
      </div>

      <div className="flex-grow">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {doctor.name}
            </h3>
            <p className="text-lg text-blue-800 font-medium mb-2">
              {doctor.specialty}
            </p>
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current" aria-hidden="true" />
              <span className="font-bold">{doctor.rating}</span>
              <span className="text-gray-500">
                ({doctor.reviewCount} reviews)
              </span>
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900 mt-2 md:mt-0">
            {doctor.price}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 text-gray-700">
            <MapPin className="w-6 h-6 text-gray-400" aria-hidden="true" />
            <span className="text-lg">{doctor.location}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <Clock className="w-6 h-6 text-gray-400" aria-hidden="true" />
            <span className="text-lg">Next: {doctor.nextAvailable}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link to={`/book/${doctor.id}`} className="flex-1">
            <Button className="w-full" leftIcon={<Calendar className="w-5 h-5" />}>
              Book Appointment
            </Button>
          </Link>
          <Button variant="secondary" className="flex-1">
            View Profile
          </Button>
        </div>
      </div>
    </article>;
}