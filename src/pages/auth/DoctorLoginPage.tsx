import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SkipLink } from '../../components/SkipLink';
import { Navigation } from '../../components/Navigation';
import { Footer } from '../../components/Footer';
import { Stethoscope, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export function DoctorLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      navigate('/doctor/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen font-sans text-gray-900 antialiased" style={{background: 'linear-gradient(135deg, #fafafa 0%, #f8fafc 25%, #f1f5f9 50%, #e2e8f0 100%)'}}>
      <SkipLink />
      <Navigation />

      <main id="main-content" tabIndex={-1} className="outline-none">
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Doctor Portal Description */}
            <div className="flex justify-center lg:justify-end">
              <div className="bg-white rounded-3xl p-10 shadow-lg max-w-md w-full">
                <div className="text-center">
                  <div className="bg-green-500 rounded-2xl p-6 w-20 h-20 mx-auto mb-8 flex items-center justify-center">
                    <Stethoscope className="h-10 w-10 text-white" />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-800 mb-6">
                    Doctor Portal
                  </h2>
                  
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Manage patient consultations, view schedules, and access clinical tools.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex justify-center lg:justify-start">
              <div className="max-w-md w-full">
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    Doctor Login
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Enter your credentials to access your account
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg placeholder-gray-400"
                        placeholder="doctor@example.com"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <button
                        type="button"
                        className="text-sm text-green-600 hover:text-green-700 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg placeholder-gray-400"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>

                {/* Alternative Login Options */}
                <div className="mt-8 text-center">
                  <p className="text-gray-500 mb-6">OR CONTINUE WITH</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors">
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </button>
                    
                    <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors">
                      <svg className="h-5 w-5 mr-2 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.219-.359-1.219c0-1.142.662-1.995 1.488-1.995.219 0 .359.219.359.578 0 .359-.219 1.142-.359 1.781-.219.937.578 1.781 1.514 1.781 1.781 0 3.145-1.883 3.145-4.604 0-2.404-1.723-4.084-4.188-4.084-2.854 0-4.604 2.134-4.604 4.604 0 .937.359 1.95.801 2.404.219.219.219.359.219.578-.359.578-.578.578-.938.359-1.781-.578-2.854-2.403-2.854-3.883 0-3.145 2.284-6.029 6.607-6.029 3.482 0 6.196 2.482 6.196 5.79 0 3.482-2.184 6.196-5.196 6.196-1.014 0-1.975-.527-2.304-1.184 0 0-.508 1.934-.632 2.404-.227.859-.851 1.934-1.268 2.595.953.295 1.967.447 3.029.447 6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                      </svg>
                      GitHub
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}