import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { SkipLink } from '../components/SkipLink';
import { Heart, Users, Award, Shield, Clock, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function AboutPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SkipLink />
      <Navigation />

      <main id="main-content" className="outline-none">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">{t('about.title')}</h1>
            <p className="text-2xl text-blue-100 max-w-3xl mx-auto">
              {t('about.subtitle')}
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
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('about.missionTitle')}</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {t('about.missionText')}
                </p>
              </div>

              <div className="bg-white rounded-xl border-2 border-gray-200 p-8 shadow-sm">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mb-6 flex items-center justify-center">
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('about.visionTitle')}</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {t('about.visionText')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('about.coreValuesTitle')}</h2>
              <p className="text-xl text-gray-600">
                {t('about.coreValuesSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Users className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('about.values.patientFirstTitle')}</h3>
                <p className="text-gray-600">
                  {t('about.values.patientFirstText')}
                </p>
              </div>

              <div className="text-center p-6">
                <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Shield className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('about.values.trustTitle')}</h3>
                <p className="text-gray-600">
                  {t('about.values.trustText')}
                </p>
              </div>

              <div className="text-center p-6">
                <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Award className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('about.values.excellenceTitle')}</h3>
                <p className="text-gray-600">
                  {t('about.values.excellenceText')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('about.numbersTitle')}</h2>
              <p className="text-xl text-gray-600">
                {t('about.numbersSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="bg-white rounded-xl border-2 border-blue-200 p-8 text-center shadow-sm">
                <div className="text-5xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-lg font-medium text-gray-700">{t('about.metrics.expertDoctors')}</div>
              </div>

              <div className="bg-white rounded-xl border-2 border-blue-200 p-8 text-center shadow-sm">
                <div className="text-5xl font-bold text-blue-600 mb-2">50K+</div>
                <div className="text-lg font-medium text-gray-700">{t('about.metrics.happyPatients')}</div>
              </div>

              <div className="bg-white rounded-xl border-2 border-blue-200 p-8 text-center shadow-sm">
                <div className="text-5xl font-bold text-blue-600 mb-2">100K+</div>
                <div className="text-lg font-medium text-gray-700">{t('about.metrics.appointments')}</div>
              </div>

              <div className="bg-white rounded-xl border-2 border-blue-200 p-8 text-center shadow-sm">
                <div className="text-5xl font-bold text-blue-600 mb-2">25+</div>
                <div className="text-lg font-medium text-gray-700">{t('about.metrics.specialties')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('about.whyTitle')}</h2>
              <p className="text-xl text-gray-600">
                {t('about.whySubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('about.whyCards.availabilityTitle')}</h3>
                    <p className="text-gray-600">
                      {t('about.whyCards.availabilityText')}
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
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('about.whyCards.certifiedTitle')}</h3>
                    <p className="text-gray-600">
                      {t('about.whyCards.certifiedText')}
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
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('about.whyCards.secureTitle')}</h3>
                    <p className="text-gray-600">
                      {t('about.whyCards.secureText')}
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
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('about.whyCards.locationsTitle')}</h3>
                    <p className="text-gray-600">
                      {t('about.whyCards.locationsText')}
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
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('about.whyCards.comprehensiveTitle')}</h3>
                    <p className="text-gray-600">
                      {t('about.whyCards.comprehensiveText')}
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
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('about.whyCards.patientCenteredTitle')}</h3>
                    <p className="text-gray-600">
                      {t('about.whyCards.patientCenteredText')}
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
