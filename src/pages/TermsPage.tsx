import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { SkipLink } from '../components/SkipLink';

export function TermsPage() {
  return <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SkipLink />
      <Navigation />

      <main id="main-content" className="outline-none py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl border-2 border-gray-200 p-8 shadow-sm">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-lg text-gray-700 mb-4">
            DocMo is a healthcare workflow demo platform. Appointments, medical
            documents, and lab reports are managed for authenticated users only.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            Users must provide accurate information and use the service only for
            lawful healthcare-related activities.
          </p>
          <p className="text-lg text-gray-700">
            For assistance, contact support through the Contact page.
          </p>
        </div>
      </main>

      <Footer />
    </div>;
}