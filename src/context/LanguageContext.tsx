import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { I18n } from 'aws-amplify/utils';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (language: string) => void;
  languageVersion: number; // Add this to force re-renders
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export { LanguageContext };

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Function to detect browser language
const detectBrowserLanguage = (): string => {
  // Get browser language
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  
  // Extract the primary language code (e.g., 'en' from 'en-US')
  const primaryLang = browserLang.split('-')[0].toLowerCase();
  
  // Map supported languages
  const supportedLanguages = ['en', 'es', 'pt'];
  
  // Check if browser language is supported
  if (supportedLanguages.includes(primaryLang)) {
    return primaryLang;
  }
  
  // Default to English if browser language is not supported
  return 'en';
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // First try to get saved language from localStorage
    const savedLanguage = localStorage.getItem('userLanguage');
    if (savedLanguage && ['en', 'es', 'pt'].includes(savedLanguage)) {
      return savedLanguage;
    }
    // Fall back to browser language detection
    return detectBrowserLanguage();
  });
  
  // Add a version counter to force re-renders when language changes
  const [languageVersion, setLanguageVersion] = useState(0);

  // Set the language in Amplify I18n when component mounts
  useEffect(() => {
    I18n.setLanguage(currentLanguage);
  }, [currentLanguage]);

  const changeLanguage = (language: string) => {
    setCurrentLanguage(language);
    setLanguageVersion(prev => prev + 1);
    I18n.setLanguage(language);
    // Save language preference to localStorage
    localStorage.setItem('userLanguage', language);
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, languageVersion }}>
      {children}
    </LanguageContext.Provider>
  );
}; 