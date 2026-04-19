import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { SkipLink } from '../components/SkipLink';

export function PrivacyPage() {
  return <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SkipLink />
      <Navigation />

      <main id="main-content" className="outline-none py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl border-2 border-gray-200 p-8 shadow-sm">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-lg text-gray-700 mb-4">
            DocMo stores only the information required to provide healthcare
            booking, records, prescriptions, and lab workflows.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            Patient, doctor, and lab data is protected by Supabase row-level
            security policies and only accessible according to role.
          </p>
          <p className="text-lg text-gray-700">
            For support with data handling or access requests, use the Contact
            page.
          </p>
        </div>
      </main>

      <Footer />
    </div>;
}