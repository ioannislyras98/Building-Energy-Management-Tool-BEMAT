import React, { createContext, useState, useContext, useEffect } from "react";
import Cookies from 'universal-cookie';

const cookies = new Cookies(null, { path: '/' });
const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Get initial language from cookie or default to Greek
  const [language, setLanguage] = useState(cookies.get('language') || 'gr');

  // Update cookie whenever language changes
  useEffect(() => {
    cookies.set('language', language, { path: '/' });
  }, [language]);

  // Function to toggle language
  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'en' ? 'gr' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};