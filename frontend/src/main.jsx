import React from 'react'
import { StrictMode } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createRoot } from 'react-dom/client'
import './css/pages.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
)
