import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { SkipLink } from '../components/SkipLink';
import { Heart, Users, Award, Shield, Clock, MapPin } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SkipLink />
      <Navigation />

      <main id="main-content" className="outline-none">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">About DocMo</h1>
            <p className="text-2xl text-blue-100 max-w-3xl mx-auto">
              Revolutionizing healthcare through technology, compassion, and excellence in patient care.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-white rounded-xl border-2 border-gray-200 p-8 shadow-sm">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mb-6 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  To provide accessible, high-quality healthcare services through innovative technology solutions 
                  that connect patients with the best medical professionals and facilities, ensuring everyone 
                  receives the care they deserve.
                </p>
              </div>

              <div className="bg-white rounded-xl border-2 border-gray-200 p-8 shadow-sm">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mb-6 flex items-center justify-center">
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  To become the most trusted healthcare platform, setting new standards in medical excellence, 
                  patient satisfaction, and technological innovation while making quality healthcare accessible 
                  to communities worldwide.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
              <p className="text-xl text-gray-600">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Users className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Patient First</h3>
                <p className="text-gray-600">
                  Every decision we make prioritizes the health, safety, and comfort of our patients.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Shield className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Trust & Integrity</h3>
                <p className="text-gray-600">
                  We maintain the highest ethical standards and protect patient privacy and data security.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Award className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Excellence</h3>
                <p className="text-gray-600">
                  We strive for excellence in medical care, technology, and customer service.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">DocMo in Numbers</h2>
              <p className="text-xl text-gray-600">
                Our impact on healthcare delivery
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="bg-white rounded-xl border-2 border-blue-200 p-8 text-center shadow-sm">
                <div className="text-5xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-lg font-medium text-gray-700">Expert Doctors</div>
              </div>

              <div className="bg-white rounded-xl border-2 border-blue-200 p-8 text-center shadow-sm">
                <div className="text-5xl font-bold text-blue-600 mb-2">50K+</div>
                <div className="text-lg font-medium text-gray-700">Happy Patients</div>
              </div>

              <div className="bg-white rounded-xl border-2 border-blue-200 p-8 text-center shadow-sm">
                <div className="text-5xl font-bold text-blue-600 mb-2">100K+</div>
                <div className="text-lg font-medium text-gray-700">Appointments</div>
              </div>

              <div className="bg-white rounded-xl border-2 border-blue-200 p-8 text-center shadow-sm">
                <div className="text-5xl font-bold text-blue-600 mb-2">25+</div>
                <div className="text-lg font-medium text-gray-700">Specialties</div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose DocMo?</h2>
              <p className="text-xl text-gray-600">
                Experience healthcare the way it should be
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">24/7 Availability</h3>
                    <p className="text-gray-600">
                      Access healthcare services anytime, anywhere with our round-the-clock support.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Certified Professionals</h3>
                    <p className="text-gray-600">
                      All our doctors are board-certified with years of experience in their specialties.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Secure & Private</h3>
                    <p className="text-gray-600">
                      Your medical information is protected with state-of-the-art security measures.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Multiple Locations</h3>
                    <p className="text-gray-600">
                      Find quality healthcare close to you with our network of medical facilities.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <Heart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Comprehensive Care</h3>
                    <p className="text-gray-600">
                      From diagnosis to treatment and follow-up, we provide complete healthcare solutions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Patient-Centered</h3>
                    <p className="text-gray-600">
                      Your comfort, satisfaction, and wellbeing are at the heart of everything we do.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
