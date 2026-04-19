import { X, Printer } from 'lucide-react';
import { ReportTemplate } from './ReportTemplate.tsx';
import type { ReportData } from './ReportTemplate.tsx';

interface GenerateReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: ReportData | null;
}

export function GenerateReportModal({ isOpen, onClose, data }: GenerateReportModalProps) {
    if (!isOpen || !data) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 print:bg-transparent">
            {/* Modal Container */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden print:hidden border border-gray-200 shadow-teal-900/10 m-4">

                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Final Medical Report Preview</h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-teal-700 transition shadow-sm"
                        >
                            <Printer className="h-4 w-4" /> Print / Save PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full transition"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Modal Body (Preview Area) */}
                <div className="overflow-y-auto p-4 sm:p-8 bg-gray-100/50 flex-1 flex justify-center">
                    <ReportTemplate data={data} />
                </div>
            </div>

            {/* Printable version (Only visible when printing) */}
            <div className="hidden print:block absolute top-0 left-0 w-full min-h-screen bg-white z-[9999]" style={{ display: 'none' }}>
                <ReportTemplate data={data} />
            </div>
        </div>
    );
}