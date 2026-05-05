import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SkipLink } from '../components/SkipLink';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { User, Stethoscope, FlaskConical } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = [
    {
      id: 'patient',
      title: t('login.roles.patient.title'),
      description: t('login.roles.patient.description'),
      icon: User,
      route: '/login/patient',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-200'
    },
    {
      id: 'doctor',
      title: t('login.roles.doctor.title'),
      description: t('login.roles.doctor.description'),
      icon: Stethoscope,
      route: '/login/doctor',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-200'
    },
    {
      id: 'lab',
      title: t('login.roles.lab.title'),
      description: t('login.roles.lab.description'),
      icon: FlaskConical,
      route: '/login/lab',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-200'
    }
  ];

  const handleRoleSelect = (role: typeof roles[0]) => {
    setSelectedRole(role.id);
    // Navigate to the specific login page for the role
    setTimeout(() => {
      navigate(role.route);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-25 to-blue-50 font-sans text-gray-900 antialiased selection:bg-blue-200 selection:text-blue-900" style={{background: 'linear-gradient(135deg, #fafafa 0%, #f8fafc 25%, #f1f5f9 50%, #e2e8f0 100%)'}}>
      <SkipLink />
      <Navigation />

      <main id="main-content" tabIndex={-1} className="outline-none">
        {/* Hero Section */}
        <section className="py-16 sm:py-24 lg:py-32" aria-labelledby="login-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center mb-12">
              <div className="bg-blue-600 rounded-xl p-4 mr-4 shadow-lg">
                <svg className="h-10 w-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <h1 className="text-5xl font-bold text-gray-800">
                {t('login.welcome')} <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">docmo</span>
              </h1>
            </div>

            <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed font-medium">
              {t('login.subtitle')}
            </p>

            {/* Role Selection Cards */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role)}
                    disabled={selectedRole !== null}
                    className={`
                      relative group p-10 rounded-2xl border-2 transition-all duration-300 bg-white shadow-lg
                      focus:outline-none focus:ring-4 focus:ring-blue-500
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50 scale-105 shadow-xl' 
                        : selectedRole 
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-xl hover:scale-105'
                      }
                    `}
                  >
                    <div className={`
                      w-20 h-20 mx-auto mb-8 rounded-2xl flex items-center justify-center
                      ${isSelected ? role.bgColor : 'bg-blue-50 group-hover:' + role.bgColor}
                    `}>
                      <Icon className={`
                        h-10 w-10 transition-colors duration-300
                        ${isSelected ? role.iconColor : 'text-blue-400 group-hover:' + role.iconColor}
                      `} />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-800 mb-6">
                      {role.title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed text-lg">
                      {role.description}
                    </p>

                    {isSelected && (
                      <div className="absolute inset-0 rounded-2xl bg-blue-500 bg-opacity-10 flex items-center justify-center">
                        <div className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-lg">
                          {t('login.opening')}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}