import React from 'react';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { SkipLink } from '../components/SkipLink';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Heart, Stethoscope, Baby, Bone, Brain, Eye, Pill, Activity, Microscope, Syringe } from 'lucide-react';
interface Service {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  specialists: number;
}
const SERVICES: Service[] = [{
  id: 'cardiology',
  name: 'Cardiology',
  description: 'Comprehensive heart care including diagnostics, treatment, and preventive cardiology services.',
  icon: Heart,
  specialists: 12
}, {
  id: 'general',
  name: 'General Medicine',
  description: 'Primary care for adults covering routine checkups, chronic disease management, and preventive care.',
  icon: Stethoscope,
  specialists: 24
}, {
  id: 'pediatrics',
  name: 'Pediatrics',
  description: 'Specialized care for infants, children, and adolescents including vaccinations and developmental monitoring.',
  icon: Baby,
  specialists: 15
}, {
  id: 'orthopedics',
  name: 'Orthopedics',
  description: 'Treatment of bone, joint, and muscle conditions including sports injuries and joint replacement.',
  icon: Bone,
  specialists: 10
}, {
  id: 'neurology',
  name: 'Neurology',
  description: 'Diagnosis and treatment of nervous system disorders including headaches, epilepsy, and stroke.',
  icon: Brain,
  specialists: 8
}, {
  id: 'ophthalmology',
  name: 'Ophthalmology',
  description: 'Complete eye care services including vision testing, cataract surgery, and glaucoma treatment.',
  icon: Eye,
  specialists: 9
}, {
  id: 'dermatology',
  name: 'Dermatology',
  description: 'Skin, hair, and nail care including acne treatment, skin cancer screening, and cosmetic procedures.',
  icon: Activity,
  specialists: 11
}, {
  id: 'pharmacy',
  name: 'Pharmacy Services',
  description: 'On-site pharmacy with prescription fulfillment, medication counseling, and home delivery options.',
  icon: Pill,
  specialists: 6
}, {
  id: 'laboratory',
  name: 'Laboratory',
  description: 'Full-service diagnostic lab offering blood tests, imaging, and rapid result reporting.',
  icon: Microscope,
  specialists: 18
}, {
  id: 'vaccination',
  name: 'Vaccination Center',
  description: 'Comprehensive immunization services for all ages including flu shots, travel vaccines, and boosters.',
  icon: Syringe,
  specialists: 7
}];
export function ServicesPage() {
  return <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SkipLink />
      <Navigation />

      <main id="main-content" className="outline-none py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Our Medical Services
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              HealthAccess offers a comprehensive range of medical services
              delivered by board-certified specialists. From routine checkups to
              specialized care, we're here for your health journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map(service => <article key={service.id} className="bg-white rounded-xl border-2 border-gray-200 p-8 shadow-sm hover:border-blue-500 transition-colors">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-200 mb-6">
                  <service.icon className="w-8 h-8 text-blue-800" aria-hidden="true" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {service.name}
                </h2>

                <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                  {service.description}
                </p>

                <p className="text-base text-gray-600 mb-6">
                  <span className="font-bold text-blue-800">
                    {service.specialists}
                  </span>{' '}
                  specialists available
                </p>

                <Link to="/find-doctor" className="block">
                  <Button className="w-full">Find a Specialist</Button>
                </Link>
              </article>)}
          </div>

          {/* Call to Action */}
          <section className="mt-16 bg-blue-900 rounded-xl p-10 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Need Help Choosing a Service?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Our patient care coordinators are available to help you find the
              right specialist and service for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:1-800-HEALTH" className="inline-flex items-center justify-center px-8 py-4 text-xl font-bold rounded-lg text-blue-900 bg-white hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-yellow-400 min-h-[56px] transition-transform active:scale-95">
                Call 1-800-HEALTH
              </a>
              <Link to="/find-doctor">
                <Button variant="secondary" className="bg-transparent text-white border-white hover:bg-blue-800">
                  Browse All Doctors
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>;
}