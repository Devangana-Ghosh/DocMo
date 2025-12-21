import React from 'react';
import { LabNavigation } from '../../components/LabNavigation';
import { Footer } from '../../components/Footer';
import { SkipLink } from '../../components/SkipLink';
import { FileText, Upload, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
export function LabDashboard() {
  const stats = [{
    label: 'Reports Uploaded Today',
    value: '24',
    icon: Upload,
    color: 'bg-blue-100 text-blue-800'
  }, {
    label: 'Pending Review',
    value: '8',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800'
  }, {
    label: 'Completed Reports',
    value: '156',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800'
  }, {
    label: 'Total Reports',
    value: '1,842',
    icon: FileText,
    color: 'bg-purple-100 text-purple-800'
  }];
  return <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SkipLink />
      <LabNavigation />

      <main id="main-content" className="outline-none py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Laboratory Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              Manage diagnostic reports and test results.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map(stat => <div key={stat.label} className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm flex items-center gap-4">
                <div className={`p-4 rounded-full ${stat.color}`}>
                  <stat.icon className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </div>
              </div>)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b-2 border-gray-100 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Recent Uploads
                  </h2>
                  <Link to="/lab/reports" className="text-purple-700 font-bold hover:underline">
                    View All
                  </Link>
                </div>
                <div className="divide-y divide-gray-100">
                  {[{
                  test: 'Complete Blood Count',
                  patient: 'John Doe',
                  time: '10 mins ago',
                  status: 'Pending'
                }, {
                  test: 'Lipid Panel',
                  patient: 'Jane Smith',
                  time: '1 hour ago',
                  status: 'Completed'
                }, {
                  test: 'Thyroid Function',
                  patient: 'Robert Johnson',
                  time: '2 hours ago',
                  status: 'Completed'
                }].map((upload, i) => <div key={i} className="p-6 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="bg-purple-100 p-3 rounded-lg">
                          <FileText className="h-6 w-6 text-purple-700" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {upload.test}
                          </p>
                          <p className="text-gray-600">
                            {upload.patient} • {upload.time}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${upload.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {upload.status}
                      </span>
                    </div>)}
                </div>
              </section>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <section className="bg-purple-800 text-white rounded-xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
                <div className="space-y-4">
                  <Link to="/lab/upload" className="block w-full bg-white/10 hover:bg-white/20 border-2 border-white/20 rounded-lg p-4 text-left transition-colors">
                    <span className="font-bold block text-lg">
                      Upload New Report
                    </span>
                    <span className="text-purple-100 text-sm">
                      Add lab test results
                    </span>
                  </Link>
                  <Link to="/lab/reports" className="block w-full bg-white/10 hover:bg-white/20 border-2 border-white/20 rounded-lg p-4 text-left transition-colors">
                    <span className="font-bold block text-lg">
                      View All Reports
                    </span>
                    <span className="text-purple-100 text-sm">
                      Browse upload history
                    </span>
                  </Link>
                </div>
              </section>

              <section className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  System Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Storage Used</span>
                    <span className="font-bold text-gray-900">42%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{
                    width: '42%'
                  }}></div>
                  </div>
                  <p className="text-sm text-gray-500">2.1 TB of 5 TB used</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>;
}