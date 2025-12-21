import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { FindDoctorPage } from './pages/FindDoctorPage';
import { BookingPage } from './pages/BookingPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { ServicesPage } from './pages/ServicesPage';
import { LocationsPage } from './pages/LocationsPage';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { PatientsPage } from './pages/doctor/PatientsPage';
import { AppointmentsPage } from './pages/doctor/AppointmentsPage';
import { AvailabilityPage } from './pages/doctor/AvailabilityPage';
import { PrescriptionsPage } from './pages/doctor/PrescriptionsPage';
import { LabDashboard } from './pages/lab/LabDashboard';
import { UploadReportPage } from './pages/lab/UploadReportPage';
import { ReportsPage } from './pages/lab/ReportsPage';
import { LoginPage } from './pages/LoginPage';
import { PatientLoginPage } from './pages/auth/PatientLoginPage';
import { DoctorLoginPage } from './pages/auth/DoctorLoginPage';
import { LabLoginPage } from './pages/auth/LabLoginPage';
export function App() {
  return <Router>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/patient" element={<PatientLoginPage />} />
        <Route path="/login/doctor" element={<DoctorLoginPage />} />
        <Route path="/login/lab" element={<LabLoginPage />} />
        
        {/* Patient Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/find-doctor" element={<FindDoctorPage />} />
        <Route path="/book/:id" element={<BookingPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/locations" element={<LocationsPage />} />

        {/* Doctor Routes */}
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/patients" element={<PatientsPage />} />
        <Route path="/doctor/appointments" element={<AppointmentsPage />} />
        <Route path="/doctor/availability" element={<AvailabilityPage />} />
        <Route path="/doctor/prescriptions" element={<PrescriptionsPage />} />

        {/* Laboratory Routes */}
        <Route path="/lab/dashboard" element={<LabDashboard />} />
        <Route path="/lab/upload" element={<UploadReportPage />} />
        <Route path="/lab/reports" element={<ReportsPage />} />
      </Routes>
    </Router>;
}