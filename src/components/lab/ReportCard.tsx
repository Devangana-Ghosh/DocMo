import { FileText, Download, Eye, Calendar, User } from 'lucide-react';
import { Button } from '../ui/Button';
import type { LabReport } from '../../types/backend';
interface ReportCardProps {
  report: LabReport;
  onView?: (report: LabReport) => void;
  onDownload?: (report: LabReport) => void;
  onReview?: (report: LabReport) => void;
}
export function ReportCard({
  report,
  onView,
  onDownload,
  onReview
}: ReportCardProps) {
  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Completed: 'bg-green-100 text-green-800',
    Reviewed: 'bg-blue-100 text-blue-800'
  };
  return <article className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm hover:border-purple-500 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-3 rounded-lg border-2 border-purple-200">
            <FileText className="h-6 w-6 text-purple-700" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              {report.test_type}
            </h3>
            <p className="text-sm text-gray-600 break-all">{report.file_name}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusColors[report.status]}`}>
          {report.status}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-gray-700">
          <User className="h-5 w-5 text-purple-600" />
          <div>
            <p className="text-sm text-gray-500">Patient</p>
            <p className="font-bold">{report.patient?.full_name ?? 'Patient'}</p>
            <p className="text-sm text-gray-600">{report.patient?.mrn ?? '-'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="h-5 w-5 text-purple-600" />
          <div>
            <p className="text-sm text-gray-500">Upload Date</p>
            <p className="font-bold">{new Date(report.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-3">
        <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Review Notes</p>
        <p className="text-sm text-gray-700 line-clamp-2">{report.notes ?? 'No notes added yet.'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          className="w-full text-purple-700 border-purple-200 hover:bg-purple-50" 
          leftIcon={<Eye className="h-5 w-5" />}
          onClick={() => onView?.(report)}
        >
          View
        </Button>
        <Button 
          variant="outline" 
          className="w-full text-gray-700 border-gray-300" 
          leftIcon={<Download className="h-5 w-5" />}
          onClick={() => onDownload?.(report)}
        >
          Download
        </Button>
        {report.status !== 'Reviewed' && onReview && (
          <Button
            className="w-full sm:col-span-2 bg-green-600 text-white hover:bg-green-700"
            onClick={() => onReview(report)}
          >
            Mark Reviewed
          </Button>
        )}
      </div>
    </article>;
}