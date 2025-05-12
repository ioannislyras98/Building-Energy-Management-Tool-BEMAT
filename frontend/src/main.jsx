import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Assuming your main App component is in App.jsx
import './index.css'; // Or your main css file
import { LanguageProvider } from './context/LanguageContext'; // Assuming this is how you provide language

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
        <App />
    </LanguageProvider>
  </React.StrictMode>
);
