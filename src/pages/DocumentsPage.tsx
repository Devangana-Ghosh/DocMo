import { useEffect, useState } from 'react';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { SkipLink } from '../components/SkipLink';
import { FileText, Upload, Download, Eye, Trash2 } from 'lucide-react';
import type { LabReport, MedicalDocument } from '../types/backend';
import { useAuth } from '../contexts/AuthContext';
import { deleteDocument, fetchDocuments, fetchLabReportsByPatient, getDocumentPublicUrl, getLabReportPublicUrl, uploadPatientDocument } from '../services/api';
import i18n from '../i18n';

export function DocumentsPage() {
  const { profile } = useAuth();
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDocuments = async () => {
      if (!profile) return;

      try {
        setLoading(true);
        const [documentData, labReportData] = await Promise.all([
          fetchDocuments(profile.id),
          fetchLabReportsByPatient(profile.id),
        ]);
        setDocuments(documentData);
        setLabReports(labReportData);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load documents.');
      } finally {
        setLoading(false);
      }
    };

    void loadDocuments();
  }, [profile]);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (!profile) return;

      const file = e.target.files[0];

      try {
        const newDoc = await uploadPatientDocument(profile.id, file, 'Report');
        setDocuments((current) => [newDoc, ...current]);
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload document.');
      }

      // Reset the input so the same file can be uploaded again
      e.target.value = '';
    }
  };

  const handleView = async (doc: MedicalDocument) => {
    const url = await getDocumentPublicUrl(doc.file_path);
    window.open(url, '_blank');
  };

  const handleDownload = async (doc: MedicalDocument) => {
    const url = await getDocumentPublicUrl(doc.file_path);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (doc: MedicalDocument) => {
    try {
      await deleteDocument(doc);
      setDocuments((current) => current.filter((item) => item.id !== doc.id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete document.');
    }
  };

  const handleViewLabReport = async (report: LabReport) => {
    const url = await getLabReportPublicUrl(report.file_path);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadLabReport = async (report: LabReport) => {
    const url = await getLabReportPublicUrl(report.file_path);
    const link = document.createElement('a');
    link.href = url;
    link.download = report.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SkipLink />
      <Navigation />

      <main id="main-content" className="outline-none py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {i18n.t('medicalDocuments', { defaultValue: 'Medical Documents' })}
              </h1>
              <p className="text-xl text-gray-700">
                {i18n.t('medicalDocumentsSubtitle', { defaultValue: 'Securely access and manage your health records.' })}
              </p>
            </div>

            <div className="relative">
              <input type="file" id="file-upload" className="sr-only" onChange={handleFileUpload} accept=".pdf,.jpg,.png,.doc,.docx" />
              <label htmlFor="file-upload">
                <span className="inline-flex items-center justify-center px-6 py-3 text-lg font-bold rounded-lg text-white bg-blue-800 hover:bg-blue-900 shadow-lg border-2 border-transparent cursor-pointer transition-transform active:scale-95 focus-within:ring-4 focus-within:ring-yellow-400" role="button" tabIndex={0} onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  document.getElementById('file-upload')?.click();
                }
              }}>
                  <Upload className="mr-2 h-5 w-5" aria-hidden="true" />
                  {i18n.t('documents.upload', { defaultValue: 'Upload Document' })}
                </span>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-lg font-bold text-gray-900">
                      Document Name
                    </th>
                    <th scope="col" className="px-6 py-4 text-lg font-bold text-gray-900">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-4 text-lg font-bold text-gray-900">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-4 text-lg font-bold text-gray-900 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading && (
                      <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">{i18n.t('documents.loading', { defaultValue: 'Loading documents...' })}</td>
                    </tr>
                  )}
                  {documents.map(doc => <tr key={doc.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FileText className="h-6 w-6 text-blue-800 mr-3" aria-hidden="true" />
                          <span className="text-lg font-medium text-gray-900">
                            {doc.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                          {doc.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-lg text-gray-700">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            className="p-2 text-blue-800 hover:bg-blue-100 rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400" 
                            aria-label={`View ${doc.name}`}
                            onClick={() => handleView(doc)}
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button 
                            className="p-2 text-blue-800 hover:bg-blue-100 rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400" 
                            aria-label={`Download ${doc.name}`}
                            onClick={() => handleDownload(doc)}
                          >
                            <Download className="h-5 w-5" />
                          </button>
                          <button 
                            className="p-2 text-red-700 hover:bg-red-50 rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400" 
                            aria-label={`Delete ${doc.name}`} 
                            onClick={() => handleDelete(doc)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
            {documents.length === 0 && <div className="p-12 text-center text-gray-500 text-lg">
                {i18n.t('documents.noDocuments', { defaultValue: 'No documents found. Upload a file to get started.' })}
              </div>}
            {error && <div className="mx-6 mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
          </div>

          <div className="mt-8 bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b-2 border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900">Lab Reports</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-lg font-bold text-gray-900">Report</th>
                    <th scope="col" className="px-6 py-4 text-lg font-bold text-gray-900">Status</th>
                    <th scope="col" className="px-6 py-4 text-lg font-bold text-gray-900">Date</th>
                    <th scope="col" className="px-6 py-4 text-lg font-bold text-gray-900 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading lab reports...</td>
                    </tr>
                  )}
                  {labReports.map((report) => (
                    <tr key={report.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FileText className="h-6 w-6 text-blue-800 mr-3" aria-hidden="true" />
                          <span className="text-lg font-medium text-gray-900">{report.file_name}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{report.test_type}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">{report.status}</span>
                      </td>
                      <td className="px-6 py-4 text-lg text-gray-700">{new Date(report.test_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            className="p-2 text-blue-800 hover:bg-blue-100 rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400"
                            aria-label={`View ${report.file_name}`}
                            onClick={() => void handleViewLabReport(report)}
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            className="p-2 text-blue-800 hover:bg-blue-100 rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400"
                            aria-label={`Download ${report.file_name}`}
                            onClick={() => void handleDownloadLabReport(report)}
                          >
                            <Download className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {labReports.length === 0 && <div className="p-8 text-center text-gray-500 text-lg">No lab reports found yet.</div>}
          </div>
        </div>
      </main>

      <Footer />
    </div>;
}