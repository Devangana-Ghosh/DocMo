import { createContext, useContext, useState, ReactNode } from 'react';

export interface LabReport {
  id: string;
  patientName: string;
  patientMRN: string;
  testType: string;
  fileName: string;
  uploadDate: string;
  status: 'Pending' | 'Completed' | 'Reviewed';
  file?: File;
  url?: string;
}

interface LabReportsContextType {
  reports: LabReport[];
  addReport: (report: Omit<LabReport, 'id' | 'uploadDate' | 'status'>) => void;
}

const LabReportsContext = createContext<LabReportsContextType | undefined>(undefined);

const INITIAL_REPORTS: LabReport[] = [
  {
    id: '1',
    patientName: 'John Doe',
    patientMRN: 'MRN-1024',
    testType: 'Complete Blood Count',
    fileName: 'CBC_JohnDoe_Nov2023.pdf',
    uploadDate: 'Nov 10, 2023',
    status: 'Completed'
  },
  {
    id: '2',
    patientName: 'Jane Smith',
    patientMRN: 'MRN-1025',
    testType: 'Lipid Panel',
    fileName: 'Lipid_JaneSmith_Nov2023.pdf',
    uploadDate: 'Nov 10, 2023',
    status: 'Reviewed'
  },
  {
    id: '3',
    patientName: 'Robert Johnson',
    patientMRN: 'MRN-1026',
    testType: 'Thyroid Function',
    fileName: 'Thyroid_RobertJ_Nov2023.pdf',
    uploadDate: 'Nov 09, 2023',
    status: 'Completed'
  },
  {
    id: '4',
    patientName: 'Emily Davis',
    patientMRN: 'MRN-1027',
    testType: 'X-Ray Chest',
    fileName: 'XRay_EmilyD_Nov2023.pdf',
    uploadDate: 'Nov 09, 2023',
    status: 'Pending'
  },
  {
    id: '5',
    patientName: 'Michael Chen',
    patientMRN: 'MRN-1028',
    testType: 'Urinalysis',
    fileName: 'Urine_MichaelC_Nov2023.pdf',
    uploadDate: 'Nov 08, 2023',
    status: 'Completed'
  },
  {
    id: '6',
    patientName: 'Sarah Wilson',
    patientMRN: 'MRN-1029',
    testType: 'MRI Brain',
    fileName: 'MRI_SarahW_Nov2023.pdf',
    uploadDate: 'Nov 08, 2023',
    status: 'Reviewed'
  }
];

export function LabReportsProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<LabReport[]>(INITIAL_REPORTS);

  const addReport = (newReport: Omit<LabReport, 'id' | 'uploadDate' | 'status'>) => {
    const report: LabReport = {
      ...newReport,
      id: Date.now().toString(),
      uploadDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      status: 'Pending'
    };
    setReports(prev => [report, ...prev]);
  };

  return (
    <LabReportsContext.Provider value={{ reports, addReport }}>
      {children}
    </LabReportsContext.Provider>
  );
}

export function useLabReports() {
  const context = useContext(LabReportsContext);
  if (!context) {
    throw new Error('useLabReports must be used within LabReportsProvider');
  }
  return context;
}
