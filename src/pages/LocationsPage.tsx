import React from 'react';
import { useEffect, useState } from 'react';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { SkipLink } from '../components/SkipLink';
import { Button } from '../components/ui/Button';
import { MapPin, Clock, Phone, Mail, Navigation as NavigationIcon } from 'lucide-react';
import { searchLocationsWithNominatim } from '../services/integrations';
import { useTranslation } from 'react-i18next';
interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  services: string[];
  mapUrl: string;
}
const LOCATIONS: Location[] = [{
  id: '1',
  name: 'HealthAccess Downtown Medical Center',
  address: '123 Main Street',
  city: 'Springfield',
  state: 'IL',
  zip: '62701',
  phone: '(555) 123-4567',
  email: 'downtown@healthaccess.com',
  hours: {
    weekdays: 'Monday - Friday: 7:00 AM - 8:00 PM',
    saturday: 'Saturday: 8:00 AM - 5:00 PM',
    sunday: 'Sunday: 9:00 AM - 3:00 PM'
  },
  services: ['Emergency Care', 'General Medicine', 'Cardiology', 'Laboratory'],
  mapUrl: 'https://maps.google.com/?q=123+Main+Street+Springfield+IL'
}, {
  id: '2',
  name: 'HealthAccess Northside Clinic',
  address: '456 Oak Avenue',
  city: 'Springfield',
  state: 'IL',
  zip: '62702',
  phone: '(555) 234-5678',
  email: 'northside@healthaccess.com',
  hours: {
    weekdays: 'Monday - Friday: 8:00 AM - 6:00 PM',
    saturday: 'Saturday: 9:00 AM - 2:00 PM',
    sunday: 'Sunday: Closed'
  },
  services: ['Pediatrics', 'Dermatology', 'Orthopedics', 'Pharmacy'],
  mapUrl: 'https://maps.google.com/?q=456+Oak+Avenue+Springfield+IL'
}, {
  id: '3',
  name: 'HealthAccess Westside Family Practice',
  address: '789 Elm Boulevard',
  city: 'Springfield',
  state: 'IL',
  zip: '62703',
  phone: '(555) 345-6789',
  email: 'westside@healthaccess.com',
  hours: {
    weekdays: 'Monday - Friday: 8:00 AM - 7:00 PM',
    saturday: 'Saturday: 8:00 AM - 4:00 PM',
    sunday: 'Sunday: Closed'
  },
  services: ['Family Medicine', 'Pediatrics', 'Vaccination Center', 'Laboratory'],
  mapUrl: 'https://maps.google.com/?q=789+Elm+Boulevard+Springfield+IL'
}, {
  id: '4',
  name: 'HealthAccess Specialty Center',
  address: '321 Medical Plaza Drive',
  city: 'Springfield',
  state: 'IL',
  zip: '62704',
  phone: '(555) 456-7890',
  email: 'specialty@healthaccess.com',
  hours: {
    weekdays: 'Monday - Friday: 7:00 AM - 6:00 PM',
    saturday: 'Saturday: By Appointment Only',
    sunday: 'Sunday: Closed'
  },
  services: ['Neurology', 'Ophthalmology', 'Advanced Diagnostics', 'Surgery Center'],
  mapUrl: 'https://maps.google.com/?q=321+Medical+Plaza+Drive+Springfield+IL'
}];
export function LocationsPage() {
  const { t } = useTranslation();
  const [mapLinks, setMapLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    const hydrateMapLinks = async () => {
      const entries = await Promise.all(LOCATIONS.map(async (location) => {
        try {
          const [match] = await searchLocationsWithNominatim(`${location.address}, ${location.city}, ${location.state} ${location.zip}`, 1);
          return [location.id, match?.osmUrl ?? location.mapUrl] as const;
        } catch {
          return [location.id, location.mapUrl] as const;
        }
      }));

      setMapLinks(Object.fromEntries(entries));
    };

    void hydrateMapLinks();
  }, []);

  return <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SkipLink />
      <Navigation />

      <main id="main-content" className="outline-none py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {t('locations.title')}
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              {t('locations.subtitle')}
            </p>
          </div>

          <div className="space-y-8">
            {LOCATIONS.map(location => <article key={location.id} className="bg-white rounded-xl border-2 border-gray-200 p-8 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Location Info */}
                  <div className="lg:col-span-2">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">
                      {location.name}
                    </h2>

                    <div className="space-y-6">
                      {/* Address */}
                      <div className="flex items-start gap-4">
                        <MapPin className="w-6 h-6 text-blue-800 flex-shrink-0 mt-1" aria-hidden="true" />
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {t('locations.address')}
                          </h3>
                          <address className="text-lg text-gray-700 not-italic">
                            {location.address}
                            <br />
                            {location.city}, {location.state} {location.zip}
                          </address>
                        </div>
                      </div>

                      {/* Hours */}
                      <div className="flex items-start gap-4">
                        <Clock className="w-6 h-6 text-blue-800 flex-shrink-0 mt-1" aria-hidden="true" />
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {t('locations.hours')}
                          </h3>
                          <ul className="text-lg text-gray-700 space-y-1">
                            <li>{location.hours.weekdays}</li>
                            <li>{location.hours.saturday}</li>
                            <li>{location.hours.sunday}</li>
                          </ul>
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="flex items-start gap-4">
                        <Phone className="w-6 h-6 text-blue-800 flex-shrink-0 mt-1" aria-hidden="true" />
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {t('locations.contact')}
                          </h3>
                          <ul className="text-lg text-gray-700 space-y-1">
                            <li>
                              <a href={`tel:${location.phone.replace(/\D/g, '')}`} className="text-blue-800 hover:underline focus:outline-none focus:ring-4 focus:ring-yellow-400 rounded">
                                {location.phone}
                              </a>
                            </li>
                            <li>
                              <a href={`mailto:${location.email}`} className="text-blue-800 hover:underline focus:outline-none focus:ring-4 focus:ring-yellow-400 rounded">
                                {location.email}
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Services & Actions */}
                  <div className="lg:col-span-1">
                    <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-100 mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        {t('locations.servicesAvailable')}
                      </h3>
                      <ul className="space-y-2">
                        {location.services.map(service => <li key={service} className="flex items-center text-lg text-gray-700">
                            <span className="w-2 h-2 bg-blue-800 rounded-full mr-3" aria-hidden="true"></span>
                            {service}
                          </li>)}
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <a href={mapLinks[location.id] ?? location.mapUrl} target="_blank" rel="noopener noreferrer">
                        <Button className="w-full" leftIcon={<NavigationIcon className="w-5 h-5" />}>
                          {t('locations.openDirections')}
                        </Button>
                      </a>
                      <Button variant="secondary" className="w-full">
                        {t('locations.scheduleVisit')}
                      </Button>
                    </div>
                  </div>
                </div>
              </article>)}
          </div>

          {/* Emergency Notice */}
          <section className="mt-12 bg-red-50 border-2 border-red-200 rounded-xl p-8" role="alert" aria-labelledby="emergency-heading">
            <h2 id="emergency-heading" className="text-2xl font-bold text-red-900 mb-4">
              {t('locations.emergencyTitle')}
            </h2>
            <p className="text-lg text-red-800 mb-6">
              {t('locations.emergencyText')}
            </p>
            <a href="tel:911" className="inline-flex items-center justify-center px-8 py-4 text-xl font-bold rounded-lg text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-yellow-400 min-h-[56px] transition-transform active:scale-95">
              {t('locations.emergencyCall')}
            </a>
          </section>
        </div>
      </main>

      <Footer />
    </div>;
}