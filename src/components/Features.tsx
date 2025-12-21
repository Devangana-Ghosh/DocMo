import React from 'react';
import { ShieldCheck, Clock, UserCheck, Smartphone } from 'lucide-react';
const features = [{
  name: 'Verified Specialists',
  description: 'Every doctor on our platform is board-certified and vetted for quality care.',
  icon: ShieldCheck
}, {
  name: '24/7 Availability',
  description: 'Book appointments anytime, day or night. Our system never sleeps.',
  icon: Clock
}, {
  name: 'Patient-First Design',
  description: 'Interfaces designed for clarity. Large text, high contrast, and screen reader ready.',
  icon: UserCheck
}, {
  name: 'Mobile Optimized',
  description: 'Manage your health on the go with our fully responsive mobile experience.',
  icon: Smartphone
}];
export function Features() {
  return <section className="bg-gray-50 py-16 sm:py-24" aria-labelledby="features-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 id="features-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Choose HealthAccess?
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            We are committed to providing a healthcare experience that works for
            everyone, regardless of ability or device.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {features.map(feature => <div key={feature.name} className="flex flex-col sm:flex-row items-start bg-white p-8 rounded-xl border-2 border-gray-200 shadow-sm hover:border-blue-500 transition-colors duration-300">
              <div className="flex-shrink-0 mb-6 sm:mb-0 sm:mr-6">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-900 border-2 border-blue-200">
                  <feature.icon className="h-8 w-8" aria-hidden="true" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {feature.name}
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>)}
        </div>
      </div>
    </section>;
}