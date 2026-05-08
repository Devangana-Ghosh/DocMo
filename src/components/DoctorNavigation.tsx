import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Stethoscope, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './ui/LanguageSwitcher';

export function DoctorNavigation() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const navLinks = [{
    name: t('nav.dashboard'),
    href: '/doctor/dashboard'
  }, {
    name: t('nav.patients'),
    href: '/doctor/patients'
  }, {
    name: t('nav.appointments'),
    href: '/doctor/appointments'
  }, {
    name: t('nav.availability'),
    href: '/doctor/availability'
  }, {
    name: t('nav.prescriptions'),
    href: '/doctor/prescriptions'
  }];
  const isActive = (path: string) => location.pathname === path;
  return <header className="border-b-2 border-teal-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Area */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Stethoscope className="h-8 w-8 text-teal-800" />
            <Link to="/doctor/dashboard" className="text-2xl font-bold text-teal-900 hover:underline focus:outline-none focus:ring-4 focus:ring-teal-500 rounded-lg px-2 py-1" aria-label={t('nav.doctorPortalHome')}>
              DoctMo <span className="text-teal-700 font-medium">Doctor</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-2" aria-label="Doctor Navigation">
            {navLinks.map(link => <Link key={link.name} to={link.href} className={`
                  text-lg font-medium rounded-lg px-3 py-2 transition-colors duration-200
                  focus:outline-none focus:ring-4 focus:ring-teal-500
                  ${isActive(link.href) ? 'bg-teal-100 text-teal-900 font-bold border-2 border-teal-200' : 'text-gray-700 hover:text-teal-800 hover:bg-teal-50 border-2 border-transparent'}
                `} aria-current={isActive(link.href) ? 'page' : undefined}>
                {link.name}
              </Link>)}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-gray-900">
                Dr. Sarah Wilson
              </p>
              <p className="text-xs text-gray-500">Cardiology</p>
            </div>
            <button 
              type="button" 
              onClick={() => navigate('/login/doctor')} 
              className="flex items-center gap-2 text-teal-800 hover:bg-teal-50 px-3 py-2 rounded-lg font-bold border-2 border-transparent hover:border-teal-200 focus:outline-none focus:ring-4 focus:ring-teal-500" 
              aria-label={t('nav.logout')}
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:inline">{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </header>;
}