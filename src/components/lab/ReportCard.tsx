import React from 'react';
import { FileText, Download, Eye, Calendar, User } from 'lucide-react';
import { Button } from '../ui/Button';
export interface LabReport {
  id: string;
  patientName: string;
  patientMRN: string;
  testType: string;
  fileName: string;
  uploadDate: string;
  status: 'Pending' | 'Completed' | 'Reviewed';
}
interface ReportCardProps {
  report: LabReport;
}
export function ReportCard({
  report
}: ReportCardProps) {
  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Completed: 'bg-green-100 text-green-800',
    Reviewed: 'bg-blue-100 text-blue-800'
  };
  return <article className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm hover:border-purple-500 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-3 rounded-lg border-2 border-purple-200">
            <FileText className="h-6 w-6 text-purple-700" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {report.testType}
            </h3>
            <p className="text-gray-600">{report.fileName}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusColors[report.status]}`}>
          {report.status}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2 text-gray-700">
          <User className="h-5 w-5 text-purple-600" />
          <div>
            <p className="text-sm text-gray-500">Patient</p>
            <p className="font-bold">{report.patientName}</p>
            <p className="text-sm text-gray-600">{report.patientMRN}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="h-5 w-5 text-purple-600" />
          <div>
            <p className="text-sm text-gray-500">Upload Date</p>
            <p className="font-bold">{report.uploadDate}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 text-purple-700 border-purple-200 hover:bg-purple-50" leftIcon={<Eye className="h-5 w-5" />}>
          View
        </Button>
        <Button variant="outline" className="flex-1 text-gray-700 border-gray-300" leftIcon={<Download className="h-5 w-5" />}>
          Download
        </Button>
      </div>
    </article>;
}