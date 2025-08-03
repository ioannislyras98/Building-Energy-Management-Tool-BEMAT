import React, { useState, useEffect, useRef } from "react";
import $ from "jquery";
import "./../../assets/styles/sidebar.css";
import Cookies from "universal-cookie";
import { useLanguage } from "../../context/LanguageContext";
import { FaArrowRight, FaUserShield } from "react-icons/fa6";
import { IoHome } from "react-icons/io5";

import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";

const cookies = new Cookies(null, { path: "/" });

export default function Sidenav() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const { language } = useLanguage();
  const params = language === "en" ? english_text.SideBar : greek_text.SideBar;
  const sidebar = useRef(null);

  const token = cookies.get("token") || "";

  // Check if user is admin
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/users/me/', {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserInfo(data.data);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    if (token) {
      fetchUserInfo();
    }
  }, [token]);

  useEffect(() => {
    if (sidebarExpanded) {
      document.querySelector("body")?.classList.add("sidebar-open");
    } else {
      document.querySelector("body")?.classList.remove("sidebar-open");
    }
  }, [sidebarExpanded]);

  return (
    <>
      <div
        id="sidebar"
        ref={sidebar}
        className={` ${
          sidebarExpanded ? "sidebar-expanded" : "sidebar-shrinked"
        }`}>
        <div className="pt-[80px] pl-1">
          <a href="/" className="flex nav-link">
            <IoHome className="sidebar-icon" />
            {sidebarExpanded && (
              <span className="pl-3 text-md font-medium tracking-tighter focus:outline-none focus:ring whitespace-nowrap cursor-pointer">
                {" "}
                {params.home}
              </span>
            )}
          </a>

          {/* Admin Dashboard Link - only show for admin users */}
          {userInfo && (userInfo.is_superuser || userInfo.is_staff) && (
            <a href="/admin" className="flex nav-link mt-4">
              <FaUserShield className="sidebar-icon text-red-500" />
              {sidebarExpanded && (
                <span className="pl-3 text-md font-medium tracking-tighter focus:outline-none focus:ring whitespace-nowrap cursor-pointer text-red-500">
                  Admin Dashboard
                </span>
              )}
            </a>
          )}
        </div>

        <div className="pt-3 lg:inline-flex mt-auto">
          <div className="flex-1" />
          <div className="px-3 py-2 justify-end">
            <button onClick={() => setSidebarExpanded(!sidebarExpanded)}>
              <FaArrowRight
                className={`${
                  !sidebarExpanded ? "rotate-0" : "rotate-180"
                } sidebar-icon`}
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
