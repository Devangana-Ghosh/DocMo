import { Stethoscope } from 'lucide-react';

export interface ReportData {
    patientName: string;
    patientAge: string;
    patientGender: string;
    date: string;
    doctorName: string;
    doctorSpecialty: string;
    hospitalName: string;
    hospitalAddress: string;
    diagnosis: string;
    medicines: { name: string; dosage: string; frequency: string; duration: string }[];
    advice: string;
}

interface ReportTemplateProps {
    data: ReportData;
}

export function ReportTemplate({ data }: ReportTemplateProps) {
    return (
        <div id="printable-report" className="bg-white p-8 w-full max-w-4xl mx-auto text-gray-900 border border-gray-100 shadow-sm print:shadow-none print:border-none">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-teal-800 pb-6 mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-teal-800 p-2 rounded-lg text-white print:bg-teal-800 !print:text-white">
                        <Stethoscope className="h-8 w-8" color="white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-teal-900">{data.hospitalName}</h1>
                        <p className="text-sm text-gray-600">{data.hospitalAddress}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-gray-800">{data.doctorName}</h2>
                    <p className="text-sm text-teal-700 font-medium">{data.doctorSpecialty}</p>
                </div>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-2 gap-4 mb-8 bg-gray-50 p-4 rounded-lg print:bg-transparent print:border print:border-gray-200">
                <div>
                    <p className="text-sm text-gray-500">Patient Name</p>
                    <p className="font-bold text-lg">{data.patientName}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-bold">{data.date}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Age / Gender</p>
                    <p className="font-medium">{data.patientAge} / {data.patientGender}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Report ID</p>
                    <p className="font-medium text-gray-600">REP-{Math.floor(Math.random() * 10000)}</p>
                </div>
            </div>

            {/* Diagnosis */}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-teal-800 border-b border-gray-200 pb-2 mb-3">Diagnosis</h3>
                <p className="text-gray-800 bg-teal-50 p-4 rounded-lg border border-teal-100 print:bg-transparent print:border-gray-200">{data.diagnosis}</p>
            </div>

            {/* Prescription / Medicines */}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-teal-800 border-b border-gray-200 pb-2 mb-3">Rx - Prescribed Medicines</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700 print:bg-transparent print:border-b print:border-gray-300">
                                <th className="py-2 px-4 border-b">Medicine</th>
                                <th className="py-2 px-4 border-b">Dosage</th>
                                <th className="py-2 px-4 border-b">Frequency</th>
                                <th className="py-2 px-4 border-b">Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.medicines.map((med, index) => (
                                <tr key={index} className="border-b border-gray-100">
                                    <td className="py-3 px-4 font-medium">{med.name}</td>
                                    <td className="py-3 px-4 text-gray-600">{med.dosage}</td>
                                    <td className="py-3 px-4 text-gray-600">{med.frequency}</td>
                                    <td className="py-3 px-4 text-gray-600">{med.duration}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Advice / Notes */}
            <div className="mb-12">
                <h3 className="text-lg font-bold text-teal-800 border-b border-gray-200 pb-2 mb-3">Doctor's Advice / Notes</h3>
                <p className="text-gray-800 whitespace-pre-line">{data.advice}</p>
            </div>

            {/* Footer / Signature */}
            <div className="mt-16 pt-8 border-t border-gray-200 flex justify-between items-end">
                <div>
                    <p className="text-sm text-gray-500">This is a digitally generated medical report.</p>
                </div>
                <div className="text-center">
                    <div className="w-48 border-b-2 border-gray-400 mb-2"></div>
                    <p className="font-bold text-gray-800">Doctor's Signature</p>
                </div>
            </div>
        </div>
    );
}