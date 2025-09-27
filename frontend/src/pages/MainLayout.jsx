import React from "react";
import { Outlet } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
import SideBar from "../components/layout/SideBar";
import { SidebarProvider } from "../context/SidebarContext";

const MainLayout = () => {
  return (
    <SidebarProvider>
      <TopBar />
      <SideBar />
      <Outlet />
    </SidebarProvider>
  );
};

export default MainLayout;
