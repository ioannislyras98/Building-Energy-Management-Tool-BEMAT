import React, { useState, useCallback } from "react";
import Cookies from 'universal-cookie';

const cookies = new Cookies(null, { path: '/' });

function useLanguage(initialLang = 'gr') {
  const [language, setLanguage] = useState(initialLang);

  const toggleLanguage = () => {
    console.log("yes")
    setLanguage(prev => (prev === 'en' ? 'gr' : 'en'));

    cookies.set('language', language);
  };

  return { language, toggleLanguage };
}

export default useLanguage;
