import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Cookies from 'universal-cookie';
import SignUp from './pages/RegisterForms/SignUp';
import LogIn from './pages/RegisterForms/LogIn';
import Home from "./pages/Home";
import './App.css';


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<LogIn />} />
      </Routes >
    </>
  );
}

export default App;
