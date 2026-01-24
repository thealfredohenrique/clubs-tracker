'use client';

import { useTranslation, type Language } from '@/lib/i18n';

// ============================================
// COMPONENT
// ============================================

export function LanguageToggle() {
  const { language, setLanguage } = useTranslation();

  const handleToggle = (lang: Language) => {
    if (lang !== language) {
      setLanguage(lang);
    }
  };

  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-gray-800/50 border border-gray-700/50">
      <button
        onClick={() => handleToggle('pt')}
        className={`
          flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all
          ${language === 'pt'
            ? 'bg-gray-700 text-white'
            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }
        `}
        title="Português"
      >
        <span className="text-sm">🇧🇷</span>
        <span className="hidden sm:inline">PT</span>
      </button>
      <button
        onClick={() => handleToggle('en')}
        className={`
          flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all
          ${language === 'en'
            ? 'bg-gray-700 text-white'
            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }
        `}
        title="English"
      >
        <span className="text-sm">🇺🇸</span>
        <span className="hidden sm:inline">EN</span>
      </button>
    </div>
  );
}
