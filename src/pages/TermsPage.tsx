import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { SkipLink } from '../components/SkipLink';
import { useTranslation } from 'react-i18next';

export function TermsPage() {
  const { t } = useTranslation();
  return <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SkipLink />
      <Navigation />

      <main id="main-content" className="outline-none py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl border-2 border-gray-200 p-8 shadow-sm">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">{t('terms.title')}</h1>
          <p className="text-lg text-gray-700 mb-4">
            {t('terms.paragraph1')}
          </p>
          <p className="text-lg text-gray-700 mb-4">
            {t('terms.paragraph2')}
          </p>
          <p className="text-lg text-gray-700">
            {t('terms.paragraph3')}
          </p>
        </div>
      </main>

      <Footer />
    </div>;
}