import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Cookies from 'universal-cookie';
import SignUp from './pages/SignUp';
import Home from "./pages/Home";
import './App.css';


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes >
    </>
  );
}

export default App;
