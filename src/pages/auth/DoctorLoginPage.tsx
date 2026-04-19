import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SkipLink } from '../../components/SkipLink';
import { Navigation } from '../../components/Navigation';
import { Footer } from '../../components/Footer';
import { Stethoscope, Mail, Lock, Eye, EyeOff, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function DoctorLoginPage() {
  const navigate = useNavigate();
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signInWithPassword, signUpWithPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (isSignUpMode) {
        const result = await signUpWithPassword(email, password, 'doctor', fullName.trim(), phone.trim());
        if (result.needsEmailConfirmation) {
          setSuccess('Account created. Check your email to confirm, then sign in.');
          setIsSignUpMode(false);
        } else {
          navigate('/doctor/dashboard');
        }
      } else {
        await signInWithPassword(email, password, 'doctor');
        navigate('/doctor/dashboard');
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Unable to sign in.');
    } finally {
      setIsLoading(false);
    }
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
                    {isSignUpMode ? 'Create Doctor Account' : 'Doctor Login'}
                  </h1>
                  <p className="text-gray-600 text-lg">
                    {isSignUpMode ? 'Create your doctor account to access clinical tools' : 'Enter your credentials to access your account'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                      {success}
                    </div>
                  )}

                  {isSignUpMode && (
                    <>
                      <div>
                        <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Stethoscope className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="full-name"
                            name="full-name"
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg placeholder-gray-400"
                            placeholder="Your full name"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg placeholder-gray-400"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </div>
                    </>
                  )}

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
                    {isLoading ? (isSignUpMode ? 'Creating Account...' : 'Signing In...') : (isSignUpMode ? 'Create Account' : 'Sign In')}
                  </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                  {isSignUpMode ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    className="font-semibold text-green-700 hover:underline"
                    onClick={() => {
                      setIsSignUpMode((prev) => !prev);
                      setError('');
                      setSuccess('');
                    }}
                  >
                    {isSignUpMode ? 'Sign in' : 'Sign up'}
                  </button>
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