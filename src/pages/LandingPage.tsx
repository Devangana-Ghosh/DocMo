import { SkipLink } from '../components/SkipLink';
import { Navigation } from '../components/Navigation';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { Footer } from '../components/Footer';
import { useTranslation } from 'react-i18next';
export function LandingPage() {
  const { t } = useTranslation();
  return <div className="min-h-screen bg-white font-sans text-gray-900 antialiased selection:bg-blue-200 selection:text-blue-900">
      <SkipLink />
      <Navigation />

      <main id="main-content" tabIndex={-1} className="outline-none">
        <Hero />
        <Features />

        {/* Call to Action Section */}
        <section className="bg-blue-900 py-16 px-4 text-center" aria-labelledby="cta-heading">
          <div className="max-w-4xl mx-auto">
            <h2 id="cta-heading" className="text-3xl sm:text-4xl font-bold text-white mb-6">
              {t('landing.ctaTitle')}
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              {t('landing.ctaSubtitle')}
            </p>
            <a href="#" className="inline-block bg-white text-blue-900 text-xl font-bold px-10 py-5 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-yellow-400 shadow-xl transition-transform active:scale-95">
              {t('landing.ctaButton')}
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>;
}