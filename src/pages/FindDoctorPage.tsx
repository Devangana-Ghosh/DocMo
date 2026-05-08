import { useState } from 'react';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { SkipLink } from '../components/SkipLink';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { DoctorCard, Doctor } from '../components/DoctorCard';
import { Search } from 'lucide-react';
import { useEffect } from 'react';
import { fetchProfilesByRole } from '../services/api';
import type { Profile } from '../types/backend';
import { useAuth } from '../contexts/AuthContext';
import { fetchDoctorAvailability, lookupDoctorInNpiRegistry } from '../services/integrations';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
export function FindDoctorPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const { profile, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [sortBy, setSortBy] = useState<'availability' | 'rating' | 'price'>('availability');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    const specialtyQuery = params.get('specialty');

    if (q !== null) {
      setSearchTerm(q);
    }

    if (specialtyQuery !== null) {
      setSpecialty(specialtyQuery);
    }
  }, [location.search]);

  useEffect(() => {
    const loadDoctors = async () => {
      if (authLoading) return;
      if (!profile) {
        setDoctors([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const profiles = await fetchProfilesByRole('doctor');
        const mapped = profiles.map((profile: Profile) => ({
          id: profile.id,
          name: profile.full_name,
          specialty: profile.specialty ?? 'General Physician',
          rating: 4.8,
          reviewCount: 120,
          location: 'DocMo Medical Center',
          nextAvailable: 'Today, 2:00 PM',
          imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300',
          price: '₹1500',
        }));

        const today = new Date().toISOString().split('T')[0];
        const enriched = await Promise.all(mapped.slice(0, 20).map(async (doctor) => {
          const [npi, slots] = await Promise.all([
            lookupDoctorInNpiRegistry(doctor.name).catch(() => null),
            fetchDoctorAvailability(doctor.id, today).catch(() => [] as string[]),
          ]);

          return {
            ...doctor,
            npiNumber: npi?.npiNumber,
            location: npi?.cityState ?? doctor.location,
            nextAvailable: slots[0] ? `Today, ${slots[0]}` : doctor.nextAvailable,
          };
        }));

        setDoctors(enriched);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : t('findDoctor.loadError'));
      } finally {
        setLoading(false);
      }
    };

    void loadDoctors();
  }, [authLoading, profile]);

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !specialty || doctor.specialty.toLowerCase().includes(specialty.toLowerCase());
    return matchesSearch && matchesSpecialty;
  }).sort((a, b) => {
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }

    if (sortBy === 'price') {
      const aPrice = Number(a.price.replace(/[^\d]/g, ''));
      const bPrice = Number(b.price.replace(/[^\d]/g, ''));
      return aPrice - bPrice;
    }

    return a.name.localeCompare(b.name);
  });
  const specialties = [{
    value: 'cardiology',
    label: t('findDoctor.specialties.cardiology')
  }, {
    value: 'dermatology',
    label: t('findDoctor.specialties.dermatology')
  }, {
    value: 'pediatrics',
    label: t('findDoctor.specialties.pediatrics')
  }, {
    value: 'orthopedics',
    label: t('findDoctor.specialties.orthopedics')
  }, {
    value: 'general',
    label: t('findDoctor.specialties.general')
  }];
  return <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SkipLink />
      <Navigation />

      <main id="main-content" className="outline-none py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {t('findDoctor.title')}
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl">
              {t('findDoctor.subtitle')}
            </p>
          </div>

          {/* Search Section */}
          <section className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm mb-12" aria-labelledby="search-heading">
            <h2 id="search-heading" className="sr-only">
              {t('findDoctor.searchFilters')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
              <div className="md:col-span-5">
                <Input label={t('findDoctor.searchBy')} placeholder={t('findDoctor.searchPlaceholder')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} leftIcon={<Search className="w-5 h-5 text-gray-500" />} />
              </div>
              <div className="md:col-span-4">
                <Select label={t('findDoctor.specialty')} options={specialties} value={specialty} onChange={e => setSpecialty(e.target.value)} />
              </div>
              <div className="md:col-span-3 mb-6">
                <Button className="w-full" size="lg" type="button">
                  {t('findDoctor.searchDoctors')}
                </Button>
              </div>
            </div>
          </section>

          {/* Results Section */}
          <section aria-label="Search Results">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {t('findDoctor.resultsCount', { count: filteredDoctors.length })}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium">{t('findDoctor.sortBy')}</span>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)} className="bg-white border-2 border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-blue-800 focus:ring-4 focus:ring-yellow-400" aria-label="Sort doctors">
                  <option value="availability">{t('findDoctor.sort.availability')}</option>
                  <option value="rating">{t('findDoctor.sort.rating')}</option>
                  <option value="price">{t('findDoctor.sort.price')}</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              {loading && <div className="text-lg text-gray-600">{t('findDoctor.loading')}</div>}
              {!loading && error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
              {!loading && !error && filteredDoctors.map(doctor => <DoctorCard key={doctor.id} doctor={doctor} />)}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>;
}