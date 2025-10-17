import { useContext } from 'react';
import { I18n } from 'aws-amplify/utils';
import { LanguageContext } from '../context/LanguageContext';

// Custom hook that combines language context with translation functionality
export const useTranslation = () => {
  const languageContext = useContext(LanguageContext);
  
  // Use languageVersion to trigger re-renders when language changes
  const languageVersion = languageContext?.languageVersion || 0;
  
  return {
    t: (key: string): string => {
      // languageVersion dependency ensures re-render when language changes
      return I18n.get(key) || key;
    },
    // Expose language context for components that need it
    currentLanguage: languageContext?.currentLanguage || 'en',
    changeLanguage: languageContext?.changeLanguage || (() => {}),
    languageVersion
  };
};

