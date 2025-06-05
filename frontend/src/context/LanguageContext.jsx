import React, { createContext, useState, useContext, useEffect } from "react";
import Cookies from 'universal-cookie';

const cookies = new Cookies(null, { path: '/' });
const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(cookies.get('language') || 'gr');

  useEffect(() => {
    cookies.set('language', language, { path: '/' });
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'en' ? 'gr' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};