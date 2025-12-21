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
import AdminMaterials from "./pages/admin/AdminMaterials";
import AdminPrefectures from "./pages/admin/AdminPrefectures";
import AdminNumericValues from "./pages/AdminNumericValues";
import Settings from "./pages/Settings";

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
              <Route
                path="/projects/:projectUuid/buildings/:buildingUuid/energy-profile"
                element={<BuildingProfilePage />}
              />
              <Route
                path="/projects/:projectUuid/buildings/:buildingUuid/systems"
                element={<BuildingProfilePage />}
              />
              <Route
                path="/projects/:projectUuid/buildings/:buildingUuid/thermal-zones"
                element={<BuildingProfilePage />}
              />
              <Route
                path="/projects/:projectUuid/buildings/:buildingUuid/electrical-consumptions"
                element={<BuildingProfilePage />}
              />
              <Route
                path="/projects/:projectUuid/buildings/:buildingUuid/scenarios"
                element={<BuildingProfilePage />}
              />
              <Route
                path="/projects/:projectUuid/buildings/:buildingUuid/scenarios/:scenarioId"
                element={<BuildingProfilePage />}
              />
              <Route
                path="/projects/:projectUuid/buildings/:buildingUuid/results"
                element={<BuildingProfilePage />}
              />
              <Route
                path="/projects/:projectUuid/buildings/:buildingUuid/images"
                element={<BuildingProfilePage />}
              />
              <Route
                path="/projects/:projectUuid/buildings/:buildingUuid/thermal-insulation"
                element={<BuildingProfilePage />}
              />
              <Route
                path="/projects/:projectUuid/buildings/:buildingUuid/roof-thermal-insulation"
                element={<BuildingProfilePage />}
              />
              <Route
                path="/projects/:projectUuid/buildings/:buildingUuid/photovoltaic-systems"
                element={<BuildingProfilePage />}
              />
              <Route
                path="/projects/:projectUuid/buildings/:buildingUuid/window-replacement"
                element={<BuildingProfilePage />}
              />
              <Route
                path="/projects/:projectUuid/buildings/:buildingUuid/bulb-replacement"
                element={<BuildingProfilePage />}
              />
              <Route
                path="/projects/:projectUuid/buildings/:buildingUuid/air-conditioning-replacement"
                element={<BuildingProfilePage />}
              />
              <Route
                path="/projects/:projectUuid/buildings/:buildingUuid/hot-water-upgrade"
                element={<BuildingProfilePage />}
              />
              <Route
                path="/projects/:projectUuid/buildings/:buildingUuid/natural-gas-network"
                element={<BuildingProfilePage />}
              />
              <Route
                path="/projects/:projectUuid/buildings/:buildingUuid/exterior-blinds"
                element={<BuildingProfilePage />}
              />
              <Route
                path="/projects/:projectUuid/buildings/:buildingUuid/automatic-lighting-control"
                element={<BuildingProfilePage />}
              />
              <Route
                path="/projects/:projectUuid/buildings/:buildingUuid/boiler-replacement"
                element={<BuildingProfilePage />}
              />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/materials" element={<AdminMaterials />} />
              <Route path="/admin/prefectures" element={<AdminPrefectures />} />
              <Route
                path="/admin/numeric-values"
                element={<AdminNumericValues />}
              />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
