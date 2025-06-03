import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import SideBar from './SideBar';

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