import React from "react";
import { Outlet } from "react-router-dom";
import TopBar from "../components/layout/TopBar";
import SideBar from "../components/layout/SideBar";

const MainLayout = () => {
  return (
    <>
      <TopBar />
      <SideBar />
      <Outlet />
    </>
  );
};

export default MainLayout;
