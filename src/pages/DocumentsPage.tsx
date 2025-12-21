import React, { useState } from 'react';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { SkipLink } from '../components/SkipLink';
import { Button } from '../components/ui/Button';
import { FileText, Upload, Download, Eye, Trash2 } from 'lucide-react';
interface Document {
  id: string;
  name: string;
  type: 'Report' | 'Prescription' | 'Lab Result';
  date: string;
  size: string;
}
const MOCK_DOCUMENTS: Document[] = [{
  id: '1',
  name: 'Blood Test Results.pdf',
  type: 'Lab Result',
  date: 'Oct 24, 2023',
  size: '2.4 MB'
}, {
  id: '2',
  name: 'Cardiology Prescription.pdf',
  type: 'Prescription',
  date: 'Sep 15, 2023',
  size: '1.1 MB'
}, {
  id: '3',
  name: 'Annual Physical Report.pdf',
  type: 'Report',
  date: 'Aug 02, 2023',
  size: '4.5 MB'
}];
export function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>(MOCK_DOCUMENTS);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Mock upload functionality
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newDoc: Document = {
        id: Date.now().toString(),
        name: file.name,
        type: 'Report',
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`
      };
      setDocuments([newDoc, ...documents]);
    }
  };
  return <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SkipLink />
      <Navigation />

      <main id="main-content" className="outline-none py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Medical Documents
              </h1>
              <p className="text-xl text-gray-700">
                Securely access and manage your health records.
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
                  Upload Document
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
                        {doc.date}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button className="p-2 text-blue-800 hover:bg-blue-100 rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400" aria-label={`View ${doc.name}`}>
                            <Eye className="h-5 w-5" />
                          </button>
                          <button className="p-2 text-blue-800 hover:bg-blue-100 rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400" aria-label={`Download ${doc.name}`}>
                            <Download className="h-5 w-5" />
                          </button>
                          <button className="p-2 text-red-700 hover:bg-red-50 rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400" aria-label={`Delete ${doc.name}`} onClick={() => setDocuments(documents.filter(d => d.id !== doc.id))}>
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
            {documents.length === 0 && <div className="p-12 text-center text-gray-500 text-lg">
                No documents found. Upload a file to get started.
              </div>}
          </div>
        </div>
      </main>

      <Footer />
    </div>;
}