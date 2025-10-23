import React, { useState, useEffect, useRef } from "react";
import $ from "jquery";
import "./../../assets/styles/sidebar.css";
import Cookies from "universal-cookie";
import { useLanguage } from "../../context/LanguageContext";
import { useSidebar } from "../../context/SidebarContext";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaUserShield,
  FaChevronDown,
  FaChevronUp,
  FaMapMarkerAlt,
  FaThermometerHalf,
  FaCubes,
  FaBuilding,
  FaTools,
  FaCalculator,
} from "react-icons/fa";
import { IoHome, IoFolderOpen, IoFolder } from "react-icons/io5";

import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import API_BASE_URL from "../../config/api.js";

const cookies = new Cookies(null, { path: "/" });

export default function Sidenav() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectsExpanded, setProjectsExpanded] = useState(false);
  const [adminExpanded, setAdminExpanded] = useState(false);
  const { language } = useLanguage();
  const { refreshTrigger } = useSidebar();
  const params = language === "en" ? english_text.SideBar : greek_text.SideBar;
  const sidebar = useRef(null);
  const navigate = useNavigate();

  const token = cookies.get("token") || "";

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/me/`, {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserInfo(data.data);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/projects/get/`, {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Projects API response:", data);
          if (Array.isArray(data)) {
            setProjects(data);
          } else if (data.projects && Array.isArray(data.projects)) {
            setProjects(data.projects);
          } else if (
            data.data &&
            data.data.projects &&
            Array.isArray(data.data.projects)
          ) {
            setProjects(data.data.projects);
          } else {
            console.log("Unexpected projects data structure:", data);
            setProjects([]);
          }
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    if (token) {
      fetchUserInfo();
      fetchProjects();
    }
  }, [token, refreshTrigger]);

  useEffect(() => {
    if (sidebarExpanded) {
      document.querySelector("body")?.classList.add("sidebar-open");
    } else {
      document.querySelector("body")?.classList.remove("sidebar-open");
    }
  }, [sidebarExpanded]);

  useEffect(() => {
    if (!sidebarExpanded) {
      setProjectsExpanded(false);
      setAdminExpanded(false);
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
          {/* Home */}
          <div
            onClick={() => navigate("/")}
            className="flex nav-link cursor-pointer hover:bg-gray-100 transition-colors duration-200">
            <IoHome className="sidebar-icon" />
            {sidebarExpanded && (
              <span className="pl-3 text-md font-medium tracking-tighter focus:outline-none focus:ring whitespace-nowrap">
                {params.home}
              </span>
            )}
          </div>

          {/* Projects Dropdown */}
          <div className="mt-4">
            <div
              onClick={() => setProjectsExpanded(!projectsExpanded)}
              className="flex nav-link cursor-pointer hover:bg-gray-100 transition-colors duration-200 items-center">
              {projectsExpanded ? (
                <IoFolderOpen className="sidebar-icon" />
              ) : (
                <IoFolder className="sidebar-icon" />
              )}
              {sidebarExpanded && (
                <>
                  <span className="pl-3 text-md font-medium tracking-tighter focus:outline-none focus:ring whitespace-nowrap flex-1">
                    {params.projects}
                    {projects.length > 0 && (
                      <span className="project-count-badge ml-2">
                        {projects.length}
                      </span>
                    )}
                  </span>
                  {projectsExpanded ? (
                    <FaChevronUp className="text-xs" />
                  ) : (
                    <FaChevronDown className="text-xs" />
                  )}
                </>
              )}
            </div>
            {/* Projects Submenu */}
            {projectsExpanded && sidebarExpanded && (
              <div className="ml-8 mt-2 space-y-2 animate-slide-down">
                {projects.length > 0 && (
                  <div className="space-y-1">
                    {projects.map((project, index) => (
                      <div
                        key={project.uuid || project.id || index}
                        onClick={() => navigate(`/projects/${project.uuid}`)}
                        className="project-item flex items-center justify-between py-2 px-3 text-sm text-primary hover:text-primary-bold cursor-pointer"
                        title={project.name}>
                        <span className="truncate flex-1 max-w-[120px]">
                          {project.name}
                        </span>
                        {project.is_submitted && (
                          <span className="submitted-badge ml-2">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {projects.length === 0 && (
                  <div className="ml-4 py-2 text-xs text-gray-400">
                    {language === "en"
                      ? "No projects yet"
                      : "Δεν υπάρχουν έργα"}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Admin Panel - only show for admin users */}
          {userInfo && (userInfo.is_superuser || userInfo.is_staff) && (
            <div className="mt-4">
              <div
                onClick={() => setAdminExpanded(!adminExpanded)}
                className="flex nav-link cursor-pointer hover:bg-primary/10 transition-colors duration-200 items-center">
                <FaUserShield className="sidebar-icon text-primary text-lg" />
                {sidebarExpanded && (
                  <>
                    <span className="pl-3 text-md font-medium tracking-tighter focus:outline-none focus:ring whitespace-nowrap text-primary flex-1">
                      {params.adminPanel}
                    </span>
                    {adminExpanded ? (
                      <FaChevronUp className="text-xs text-primary" />
                    ) : (
                      <FaChevronDown className="text-xs text-primary" />
                    )}
                  </>
                )}
              </div>
              {/* Admin Submenu */}
              {adminExpanded && sidebarExpanded && (
                <div className="ml-8 mt-2 space-y-2 animate-slide-down">
                  <div
                    onClick={() => navigate("/admin")}
                    className="admin-submenu-item flex items-center py-2 px-3 text-sm text-primary hover:text-primary-bold cursor-pointer">
                    <FaUserShield className="mr-2 text-xs" />
                    <span>{params.adminDashboard}</span>
                  </div>
                  <div
                    onClick={() => navigate("/admin/prefectures")}
                    className="admin-submenu-item flex items-center py-2 px-3 text-sm text-primary hover:text-primary-bold cursor-pointer">
                    <FaMapMarkerAlt className="mr-2 text-xs" />
                    <span>{params.prefectures}</span>
                  </div>
                  <div
                    onClick={() => navigate("/admin/materials")}
                    className="admin-submenu-item flex items-center py-2 px-3 text-sm text-primary hover:text-primary-bold cursor-pointer">
                    <FaTools className="mr-2 text-xs" />
                    <span>{params.materials}</span>
                  </div>
                  <div
                    onClick={() => navigate("/admin/numeric-values")}
                    className="admin-submenu-item flex items-center py-2 px-3 text-sm text-primary hover:text-primary-bold cursor-pointer">
                    <FaCalculator className="mr-2 text-xs" />
                    <span>
                      {language === "en"
                        ? "Numeric Values"
                        : "Αριθμητικές Τιμές"}
                    </span>
                  </div>
                </div>
              )}
            </div>
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
