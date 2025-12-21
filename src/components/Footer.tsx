import React from 'react';
export function Footer() {
  return <footer className="bg-gray-900 text-white py-12 border-t-4 border-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-white">HealthAccess</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              Making healthcare accessible for everyone.
              <br />
              Simple, clear, and inclusive.
            </p>
          </div>

          {/* Quick Links */}
          <nav aria-label="Footer Navigation">
            <h3 className="text-xl font-bold mb-6 text-blue-300 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-4">
              {['About Us', 'Contact Support', 'Privacy Policy', 'Terms of Service'].map(item => <li key={item}>
                  <a href="#" className="text-lg text-gray-300 hover:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:text-white rounded px-1 -ml-1 inline-block py-1">
                    {item}
                  </a>
                </li>)}
            </ul>
          </nav>

          {/* Accessibility Statement */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-blue-300 uppercase tracking-wider">
              Accessibility
            </h3>
            <p className="text-gray-300 text-lg mb-4 leading-relaxed">
              We are committed to digital accessibility for people with
              disabilities. We are continually improving the user experience for
              everyone and applying the relevant accessibility standards.
            </p>
            <a href="#" className="inline-block text-lg font-bold text-white bg-blue-700 hover:bg-blue-600 px-6 py-3 rounded-lg border-2 border-transparent focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-colors">
              Read Accessibility Statement
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400 text-lg">
          <p>
            &copy; {new Date().getFullYear()} HealthAccess Inc. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>;
}