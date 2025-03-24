import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Cookies from 'universal-cookie';
import SignUp from './pages/RegisterForms/SignUp';
import LogIn from './pages/RegisterForms/LogIn';
import Home from "./pages/Home";
import Layout from "./tools/Layout";
import PageNotFound from "./pages/PageNotFound";
import UnauthorizedAccess from "./pages/UnauthorizedAccess";
import './App.css';
import { AuthProvider,RequireAuth } from "./tools/Auth";


function App() {
  return (
    <AuthProvider>
     <BrowserRouter>
      <Routes>
        <Route element={<Layout />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="*" element={<PageNotFound />} />
        <Route path="/unauthorized" element={<UnauthorizedAccess />} />
        <Route element={<RequireAuth />}>
              <Route path="" element={<Home />} />
            </Route>
      </Routes >
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
