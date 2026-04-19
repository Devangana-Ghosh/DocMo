import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { FindDoctorPage } from './pages/FindDoctorPage';
import { BookingPage } from './pages/BookingPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { ServicesPage } from './pages/ServicesPage';
import { LocationsPage } from './pages/LocationsPage';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard.tsx';
import { PatientsPage } from './pages/doctor/PatientsPage';
import { AppointmentsPage as DoctorAppointmentsPage } from './pages/doctor/AppointmentsPage';
import { AvailabilityPage } from './pages/doctor/AvailabilityPage';
import { PrescriptionsPage as DoctorPrescriptionsPage } from './pages/doctor/PrescriptionsPage';
import { LabDashboard } from './pages/lab/LabDashboard';
import { UploadReportPage } from './pages/lab/UploadReportPage';
import { ReportsPage } from './pages/lab/ReportsPage';
import { LoginPage } from './pages/LoginPage';
import { PatientLoginPage } from './pages/auth/PatientLoginPage';
import { DoctorLoginPage } from './pages/auth/DoctorLoginPage';
import { LabLoginPage } from './pages/auth/LabLoginPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { PrescriptionsPage } from './pages/PrescriptionsPage';
import { ContactPage } from './pages/ContactPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ToastProvider } from './components/ui/Toast';
import { AssistantChatbot } from './components/ai/AssistantChatbot';

export function App() {
  return <AuthProvider>
    <ToastProvider>
      <Router>
        <Routes>
        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/patient" element={<PatientLoginPage />} />
        <Route path="/login/doctor" element={<DoctorLoginPage />} />
        <Route path="/login/lab" element={<LabLoginPage />} />
        
        {/* Patient Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/find-doctor" element={<ProtectedRoute allowedRoles={['patient']}><FindDoctorPage /></ProtectedRoute>} />
        <Route path="/book/:id" element={<ProtectedRoute allowedRoles={['patient']}><BookingPage /></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute allowedRoles={['patient']}><AppointmentsPage /></ProtectedRoute>} />
        <Route path="/prescriptions" element={<ProtectedRoute allowedRoles={['patient']}><PrescriptionsPage /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute allowedRoles={['patient']}><DocumentsPage /></ProtectedRoute>} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/locations" element={<LocationsPage />} />

        {/* Doctor Routes */}
        <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={['doctor']}><PatientsPage /></ProtectedRoute>} />
        <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAppointmentsPage /></ProtectedRoute>} />
        <Route path="/doctor/availability" element={<ProtectedRoute allowedRoles={['doctor']}><AvailabilityPage /></ProtectedRoute>} />
        <Route path="/doctor/prescriptions" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorPrescriptionsPage /></ProtectedRoute>} />

        {/* Laboratory Routes */}
        <Route path="/lab/dashboard" element={<ProtectedRoute allowedRoles={['lab']}><LabDashboard /></ProtectedRoute>} />
        <Route path="/lab/upload" element={<ProtectedRoute allowedRoles={['lab']}><UploadReportPage /></ProtectedRoute>} />
        <Route path="/lab/reports" element={<ProtectedRoute allowedRoles={['lab']}><ReportsPage /></ProtectedRoute>} />
        </Routes>
        <AssistantChatbot />
      </Router>
    </ToastProvider>
  </AuthProvider>;
}