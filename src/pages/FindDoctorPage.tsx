import React, { useState } from 'react';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { SkipLink } from '../components/SkipLink';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { DoctorCard, Doctor } from '../components/DoctorCard';
import { Search, Filter } from 'lucide-react';
// Mock data
const MOCK_DOCTORS: Doctor[] = [{
  id: '1',
  name: 'Dr. Sarah Wilson',
  specialty: 'Cardiologist',
  rating: 4.9,
  reviewCount: 124,
  location: 'Central Heart Institute',
  nextAvailable: 'Today, 2:00 PM',
  imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300',
  price: '$150'
}, {
  id: '2',
  name: 'Dr. Michael Chen',
  specialty: 'Dermatologist',
  rating: 4.8,
  reviewCount: 89,
  location: 'Skin Care Center',
  nextAvailable: 'Tomorrow, 10:00 AM',
  imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300',
  price: '$120'
}, {
  id: '3',
  name: 'Dr. Emily Rodriguez',
  specialty: 'Pediatrician',
  rating: 5.0,
  reviewCount: 215,
  location: 'Family Health Clinic',
  nextAvailable: 'Today, 4:30 PM',
  imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300',
  price: '$100'
}];
export function FindDoctorPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialty, setSpecialty] = useState('');
  const specialties = [{
    value: 'cardiology',
    label: 'Cardiology'
  }, {
    value: 'dermatology',
    label: 'Dermatology'
  }, {
    value: 'pediatrics',
    label: 'Pediatrics'
  }, {
    value: 'orthopedics',
    label: 'Orthopedics'
  }, {
    value: 'general',
    label: 'General Practice'
  }];
  return <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SkipLink />
      <Navigation />

      <main id="main-content" className="outline-none py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Find a Doctor
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl">
              Search through our network of verified specialists. Filter by
              specialty, location, or availability to find the right care for
              you.
            </p>
          </div>

          {/* Search Section */}
          <section className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm mb-12" aria-labelledby="search-heading">
            <h2 id="search-heading" className="sr-only">
              Search Filters
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              <div className="md:col-span-5">
                <Input label="Search by name or condition" placeholder="e.g. Dr. Smith or Back pain" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} leftIcon={<Search className="w-5 h-5 text-gray-500" />} />
              </div>
              <div className="md:col-span-4">
                <Select label="Specialty" options={specialties} value={specialty} onChange={e => setSpecialty(e.target.value)} />
              </div>
              <div className="md:col-span-3 mb-6">
                <Button className="w-full" size="lg">
                  Search Doctors
                </Button>
              </div>
            </div>
          </section>

          {/* Results Section */}
          <section aria-label="Search Results">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {MOCK_DOCTORS.length} Doctors Available
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium">Sort by:</span>
                <select className="bg-white border-2 border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-800 focus:ring-4 focus:ring-yellow-400" aria-label="Sort doctors">
                  <option>Availability</option>
                  <option>Rating</option>
                  <option>Price: Low to High</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              {MOCK_DOCTORS.map(doctor => <DoctorCard key={doctor.id} doctor={doctor} />)}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>;
}