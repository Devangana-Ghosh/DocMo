import { useEffect, useState } from 'react';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { SkipLink } from '../components/SkipLink';
import { Pill, Calendar, User, FileText, Download, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchPrescriptionsByPatient, requestPrescriptionRefill } from '../services/api';
import type { Prescription } from '../types/backend';
import { useToast } from '../components/ui/Toast';
import { buildRxNormInfoUrl } from '../services/integrations';
import { useTranslation } from 'react-i18next';

export function PrescriptionsPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const toast = useToast();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'refill-needed' | 'cancelled'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadPrescriptions = async () => {
      if (!profile) return;

      try {
        setLoading(true);
        const data = await fetchPrescriptionsByPatient(profile.id);
        setPrescriptions(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : t('patientRx.loadError'));
      } finally {
        setLoading(false);
      }
    };

    void loadPrescriptions();
  }, [profile]);

  const filteredPrescriptions = prescriptions.filter(rx => {
    if (filter === 'all') return true;
    if (filter === 'refill-needed') return rx.status === 'Refill Needed';
    if (filter === 'cancelled') return rx.status === 'Cancelled';
    return rx.status.toLowerCase() === filter;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      'Active': 'bg-green-100 text-green-800',
      'Completed': 'bg-gray-100 text-gray-800',
      'Refill Needed': 'bg-orange-100 text-orange-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return styles[status as keyof typeof styles] || styles.Active;
  };

  const handleRequestRefill = async (prescription: Prescription) => {
    try {
      const updated = await requestPrescriptionRefill(prescription.id);
      setPrescriptions((current) => current.map((item) => (item.id === prescription.id ? updated : item)));
      setSuccess(t('patientRx.refillSuccess'));
      toast.success(t('patientRx.refillTitle'), t('patientRx.refillMessage', { name: prescription.medication_name }));
    } catch (refillError) {
      setError(refillError instanceof Error ? refillError.message : t('patientRx.refillError'));
    }
  };

  const handleDownload = (rx: Prescription) => {
    const text = `${rx.medication_name}\n${t('patientRx.dosage')}: ${rx.dosage}\n${t('patientRx.frequency')}: ${rx.frequency}\n${t('patientRx.duration')}: ${rx.duration}\n${t('patientRx.instructions')}: ${rx.instructions}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${rx.medication_name.replace(/\s+/g, '_')}_prescription.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SkipLink />
      <Navigation />

      <main id="main-content" className="outline-none py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {t('patientRx.title')}
            </h1>
            <p className="text-xl text-gray-700">
              {t('patientRx.subtitle')}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="mb-8 border-b border-gray-200">
            <nav className="flex space-x-8" aria-label={t('patientRx.filterLabel')}>
              {(['all', 'active', 'refill-needed', 'completed', 'cancelled'] as const).map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-lg capitalize transition-colors
                    focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-t
                    ${filter === filterOption
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                  aria-current={filter === filterOption ? 'page' : undefined}
                >
                  {t(`patientRx.filters.${filterOption}`)}
                </button>
              ))}
            </nav>
          </div>

          {/* Prescriptions List */}
          <div className="space-y-6">
            {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
            {success && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">{success}</div>}
            {loading ? (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
                <p className="text-xl text-gray-500">{t('patientRx.loading')}</p>
              </div>
            ) : filteredPrescriptions.length === 0 ? (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
                <Pill className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-500">{t('patientRx.noResults', { filter: filter === 'all' ? '' : t(`patientRx.filters.${filter}`) })}</p>
              </div>
            ) : (
              filteredPrescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="bg-white rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      {/* Left Section - Prescription Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 rounded-lg p-3">
                              <Pill className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900">
                                {rx.medication_name}
                              </h3>
                              <p className="text-lg text-gray-600">{rx.dosage} - {rx.frequency}</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getStatusBadge(rx.status)}`}>
                            {rx.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="flex items-center text-gray-700 mb-2">
                              <User className="h-5 w-5 mr-2 text-blue-600" />
                              <span className="text-sm font-medium">{t('patientRx.prescribedBy')}</span>
                            </div>
                            <p className="text-lg ml-7">{rx.doctor?.full_name ?? 'Doctor'}</p>
                          </div>
                          <div>
                            <div className="flex items-center text-gray-700 mb-2">
                              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                              <span className="text-sm font-medium">{t('patientRx.date')}</span>
                            </div>
                            <p className="text-lg ml-7">{new Date(rx.created_at ?? '').toLocaleDateString()}</p>
                          </div>
                          <div>
                            <div className="flex items-center text-gray-700 mb-2">
                              <FileText className="h-5 w-5 mr-2 text-blue-600" />
                              <span className="text-sm font-medium">{t('patientRx.duration')}</span>
                            </div>
                            <p className="text-lg ml-7">{rx.duration}</p>
                          </div>
                          <div>
                            <div className="flex items-center text-gray-700 mb-2">
                              <RefreshCw className="h-5 w-5 mr-2 text-blue-600" />
                              <span className="text-sm font-medium">{t('patientRx.refills')}</span>
                            </div>
                            <p className="text-lg ml-7">{rx.refills_remaining} remaining</p>
                          </div>
                        </div>

                        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                          <p className="text-sm font-medium text-gray-700 mb-1">{t('patientRx.instructions')}</p>
                          <p className="text-base text-gray-900">{rx.instructions}</p>
                          <a
                            href={buildRxNormInfoUrl({ rxcui: rx.rxcui, medicationName: rx.medication_name })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-block text-sm font-semibold text-blue-700 underline"
                          >
                            {t('patientRx.learnMore')}
                          </a>
                        </div>
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex lg:flex-col gap-3 lg:min-w-[160px]">
                        <button 
                          onClick={() => handleDownload(rx)}
                          className="flex-1 lg:flex-none px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="h-5 w-5" />
                          {t('patientRx.download')}
                        </button>
                        {rx.status === 'Active' && rx.refills_remaining > 0 && (
                          <button 
                            onClick={() => handleRequestRefill(rx)}
                            className="flex-1 lg:flex-none px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-medium hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors flex items-center justify-center gap-2"
                          >
                            <RefreshCw className="h-5 w-5" />
                            {t('patientRx.requestRefill')}
                          </button>
                        )}
                        {rx.status === 'Refill Needed' && (
                          <button
                            type="button"
                            disabled
                            className="flex-1 lg:flex-none px-6 py-3 bg-orange-100 text-orange-800 rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <RefreshCw className="h-5 w-5" />
                            {t('patientRx.pendingApproval')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
