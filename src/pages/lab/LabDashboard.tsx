import { useEffect, useMemo, useState } from 'react';
import { LabNavigation } from '../../components/LabNavigation';
import { Footer } from '../../components/Footer';
import { SkipLink } from '../../components/SkipLink';
import { FileText, Upload, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchLabReports } from '../../services/api';
import type { LabReport } from '../../types/backend';
import { useTranslation } from 'react-i18next';
export function LabDashboard() {
  const { t } = useTranslation();
  const [reports, setReports] = useState<LabReport[]>([]);

  useEffect(() => {
    const loadReports = async () => {
      const data = await fetchLabReports();
      setReports(data);
    };

    void loadReports();
  }, []);

  const reportsToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return reports.filter((item) => item.created_at.slice(0, 10) === today).length;
  }, [reports]);

  const stats = [{
    label: t('labDashboard.uploadedToday'),
    value: String(reportsToday),
    icon: Upload,
    color: 'bg-blue-100 text-blue-800'
  }, {
    label: t('labDashboard.pendingReview'),
    value: String(reports.filter((item) => item.status === 'Pending').length),
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800'
  }, {
    label: t('labDashboard.completedReports'),
    value: String(reports.filter((item) => item.status === 'Completed' || item.status === 'Reviewed').length),
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800'
  }, {
    label: t('labDashboard.totalReports'),
    value: String(reports.length),
    icon: FileText,
    color: 'bg-purple-100 text-purple-800'
  }];

  const recentUploads = reports.slice(0, 3);
  return <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SkipLink />
      <LabNavigation />

      <main id="main-content" className="outline-none py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('labDashboard.title')}
            </h1>
            <p className="text-xl text-gray-600">
              {t('labDashboard.subtitle')}
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
                    {t('labDashboard.recentUploads')}
                  </h2>
                  <Link to="/lab/reports" className="text-purple-700 font-bold hover:underline">
                    {t('labDashboard.viewAll')}
                  </Link>
                </div>
                <div className="divide-y divide-gray-100">
                  {recentUploads.map((upload) => <div key={upload.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="bg-purple-100 p-3 rounded-lg">
                          <FileText className="h-6 w-6 text-purple-700" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {upload.test_type}
                          </p>
                          <p className="text-gray-600">
                            {upload.patient?.full_name ?? t('labDashboard.patientFallback')} • {new Date(upload.created_at).toLocaleString()}
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
                <h2 className="text-2xl font-bold mb-6">{t('labDashboard.quickActions')}</h2>
                <div className="space-y-4">
                  <Link to="/lab/upload" className="block w-full bg-white/10 hover:bg-white/20 border-2 border-white/20 rounded-lg p-4 text-left transition-colors">
                    <span className="font-bold block text-lg">
                      {t('labDashboard.uploadNew')}
                    </span>
                    <span className="text-purple-100 text-sm">
                      {t('labDashboard.uploadNewHelp')}
                    </span>
                  </Link>
                  <Link to="/lab/reports" className="block w-full bg-white/10 hover:bg-white/20 border-2 border-white/20 rounded-lg p-4 text-left transition-colors">
                    <span className="font-bold block text-lg">
                      {t('labDashboard.viewReports')}
                    </span>
                    <span className="text-purple-100 text-sm">
                      {t('labDashboard.viewReportsHelp')}
                    </span>
                  </Link>
                </div>
              </section>

              <section className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {t('labDashboard.systemStatus')}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">{t('labDashboard.storageUsed')}</span>
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