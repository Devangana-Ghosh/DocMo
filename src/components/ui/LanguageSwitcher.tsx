import { useTranslation } from 'react-i18next';

type LanguageOption = 'en' | 'hi' | 'ta';

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  const value = (['en', 'hi', 'ta'].includes(i18n.language) ? i18n.language : 'en') as LanguageOption;

  return (
    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
      <span className="font-medium">{t('language.label')}</span>
      <select
        aria-label={t('language.label')}
        className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={value}
        onChange={(event) => void i18n.changeLanguage(event.target.value)}
      >
        <option value="en">{t('language.english')}</option>
        <option value="hi">{t('language.hindi')}</option>
        <option value="ta">{t('language.tamil')}</option>
      </select>
    </label>
  );
}
