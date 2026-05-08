import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
export function Footer() {
  const { t } = useTranslation();
  return <footer className="bg-gray-900 text-white py-12 border-t-4 border-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-white">{t('footer.brand')}</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              {t('footer.tagline')}
              <br />
              {t('footer.tagline2')}
            </p>
          </div>

          {/* Quick Links */}
          <nav aria-label="Footer Navigation">
            <h3 className="text-xl font-bold mb-6 text-blue-300 uppercase tracking-wider">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-4">
              <li>
                <Link to="/about" className="text-lg text-gray-300 hover:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:text-white rounded px-1 -ml-1 inline-block py-1">
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-lg text-gray-300 hover:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:text-white rounded px-1 -ml-1 inline-block py-1">
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-lg text-gray-300 hover:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:text-white rounded px-1 -ml-1 inline-block py-1">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-lg text-gray-300 hover:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:text-white rounded px-1 -ml-1 inline-block py-1">
                  {t('footer.terms')}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Accessibility Statement */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-blue-300 uppercase tracking-wider">
              {t('footer.accessibility')}
            </h3>
            <p className="text-gray-300 text-lg mb-4 leading-relaxed">
              {t('footer.accessibilityText')}
            </p>
            <Link to="/privacy" className="inline-block text-lg font-bold text-white bg-blue-700 hover:bg-blue-600 px-6 py-3 rounded-lg border-2 border-transparent focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-colors">
              {t('footer.accessibilityCta')}
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400 text-lg">
          <p>
            {t('footer.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>;
}