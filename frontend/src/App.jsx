import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./pages/MainLayout";
import SignUp from "./pages/auth/SignUp";
import LogIn from "./pages/auth/LogIn";
import Logout from "./pages/auth/Logout";
import ResetPasswordConfirm from "./pages/auth/ResetPasswordConfirm";
import Home from "./pages/Home";
import Layout from "./tools/Layout";
import PageNotFound from "./pages/PageNotFound";
import BuildingProfilePage from "./pages/BuildingProfilePage";
import UnauthorizedAccess from "./pages/UnauthorizedAccess";
import "./App.css";
import { AuthProvider, RequireAuth } from "./tools/Auth";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/logout" element={<Logout />} />
          <Route
            path="/reset-password-confirm/:uid/:token"
            element={<ResetPasswordConfirm />}
          />
          <Route path="/unauthorized" element={<UnauthorizedAccess />} />

          <Route element={<RequireAuth />}>
            <Route element={<MainLayout />}>
              <Route path="" element={<Home />} />
              <Route path="/projects/:projectUuid" element={<Home />} />
              <Route
                path="/projects/:projectUuid/buildings/:buildingUuid"
                element={<BuildingProfilePage />}
              />
            </Route>
          </Route>

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
