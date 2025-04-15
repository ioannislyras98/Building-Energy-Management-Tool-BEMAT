import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Cookies from 'universal-cookie';
import MainLayout from './pages/MainLayout';
import SignUp from './pages/RegisterForms/SignUp';
import LogIn from './pages/RegisterForms/LogIn';
import Logout from "./pages/RegisterForms/Logout";
import ResetPasswordConfirm from "./pages/RegisterForms/ResetPasswordConfirm";
import Home from "./pages/Home";
import Layout from "./tools/Layout";
import PageNotFound from "./pages/PageNotFound";
import UnauthorizedAccess from "./pages/UnauthorizedAccess";
import './App.css';
import { AuthProvider, RequireAuth } from "./tools/Auth";


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="*" element={<PageNotFound />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/reset-password-confirm/:uid/:token" element={<ResetPasswordConfirm />} />
          <Route path="/unauthorized" element={<UnauthorizedAccess />} />
          <Route element={<RequireAuth />}>
            <Route element={<MainLayout />}>          {/*routing to maintain topbar and sidebar visible #TODO: add settings and messages path, maybe routing by project with url param? tbd*/}

              <Route path="" element={<Home />} />
            </Route>
          </Route>
        </Routes >
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
