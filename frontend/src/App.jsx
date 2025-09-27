import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./pages/MainLayout";
import SignUp from "./pages/auth/SignUp";
import LogIn from "./pages/auth/LogIn";
import Logout from "./pages/auth/Logout";
import ResetPasswordConfirm from "./pages/auth/ResetPasswordConfirm";
import Home from "./pages/Home";
import ProjectView from "./pages/ProjectView";
import Layout from "./tools/Layout";
import PageNotFound from "./pages/PageNotFound";
import BuildingProfilePage from "./pages/BuildingProfilePage";
import UnauthorizedAccess from "./pages/UnauthorizedAccess";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPrefectures from "./pages/admin/AdminPrefectures";
import AdminThermalZones from "./pages/admin/AdminThermalZones";
import AdminMaterials from "./pages/admin/AdminMaterials";

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
              <Route path="/projects/:projectUuid" element={<ProjectView />} />
              <Route
                path="/projects/:projectUuid/buildings/:buildingUuid"
                element={<BuildingProfilePage />}
              />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/prefectures" element={<AdminPrefectures />} />
              <Route
                path="/admin/thermal-zones"
                element={<AdminThermalZones />}
              />
              <Route path="/admin/materials" element={<AdminMaterials />} />
            </Route>
          </Route>

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
