import { useState } from 'react';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { SkipLink } from '../components/SkipLink';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { submitContactMessage } from '../services/api';
import { useToast } from '../components/ui/Toast';
import { useTranslation } from 'react-i18next';

export function ContactPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      await submitContactMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        subject: formData.subject,
        message: formData.message,
      });

      setSuccessMessage(t('contact.success'));
      toast.success(t('contact.toastSentTitle'), t('contact.toastSentText'));
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : t('contact.sendError');
      setErrorMessage(message);
      toast.error(t('contact.toastFailTitle'), message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SkipLink />
      <Navigation />

      <main id="main-content" className="outline-none py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('contact.title')}
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              {t('contact.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Contact Cards */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('contact.phone')}</h3>
              <p className="text-gray-600 mb-2">{t('contact.phoneHelp')}</p>
              <a href="tel:+15551234567" className="text-blue-600 font-medium hover:underline text-lg">
                {t('contact.phoneValue')}
              </a>
            </div>

            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('contact.email')}</h3>
              <p className="text-gray-600 mb-2">{t('contact.emailHelp')}</p>
              <a href="mailto:support@docmo.com" className="text-blue-600 font-medium hover:underline text-lg">
                support@docmo.com
              </a>
            </div>

            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('contact.location')}</h3>
              <p className="text-gray-600 mb-2">{t('contact.locationHelp')}</p>
              <p className="text-gray-900 font-medium">
                123 Healthcare Ave<br />
                Medical District, NY 10001
              </p>
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg mb-12">
            <div className="flex items-start">
              <Clock className="h-6 w-6 text-blue-600 mr-3 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('contact.businessHours')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700">
                  <div><span className="font-medium">{t('contact.hours.weekdays')}</span> 8:00 AM - 6:00 PM</div>
                  <div><span className="font-medium">{t('contact.hours.saturday')}</span> 9:00 AM - 2:00 PM</div>
                  <div><span className="font-medium">{t('contact.hours.sunday')}</span> {t('contact.hours.closed')}</div>
                  <div><span className="font-medium">{t('contact.hours.emergency')}</span> 24/7 {t('contact.hours.available')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm p-8 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              {t('contact.sendMessage')}
            </h2>
            {successMessage && <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
                {successMessage}
              </div>}
            {errorMessage && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {errorMessage}
              </div>}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.form.fullName')}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('contact.form.fullNamePlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.form.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('contact.form.emailPlaceholder')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.form.phone')}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('contact.form.phonePlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('contact.form.subject')}
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">{t('contact.form.selectSubject')}</option>
                    <option value="general">{t('contact.form.subjectOptions.general')}</option>
                    <option value="appointment">{t('contact.form.subjectOptions.appointment')}</option>
                    <option value="technical">{t('contact.form.subjectOptions.technical')}</option>
                    <option value="billing">{t('contact.form.subjectOptions.billing')}</option>
                    <option value="feedback">{t('contact.form.subjectOptions.feedback')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('contact.form.message')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder={t('contact.form.messagePlaceholder')}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? t('contact.sending') : (
                  <>
                    <Send className="h-5 w-5" />
                    {t('contact.send')}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
