import $ from "jquery";
import "./../../assets/styles/topbar.css";
import { useState, useRef, useEffect } from "react";
import Cookies from "universal-cookie";
import { useLanguage } from "../../context/LanguageContext";
import { useProgress } from "../../context/ProgressContext";
import { useNavigate } from "react-router-dom";

import { FaBell, FaCircleUser } from "react-icons/fa6";
import { HiCog6Tooth } from "react-icons/hi2";
import { MdLogout } from "react-icons/md";
import { MdTranslate } from "react-icons/md";

import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";

const cookies = new Cookies(null, { path: "/" });

export default function TopBar() {
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [pendingProjectsData, setPendingProjectsData] = useState(null);
  const drop = useRef(null);
  const { language, toggleLanguage } = useLanguage();
  const { refreshTrigger } = useProgress();
  const params = language === "en" ? english_text.TopBar : greek_text.TopBar;
  const navigate = useNavigate();
  const token = cookies.get("token") || "";

  useEffect(() => {
    if (token) {
      const settings = {
        url: "http://127.0.0.1:8000/users/me/",
        method: "GET",
        timeout: 0,
        headers: {
          Authorization: `Token ${token}`,
        },
      };

      $.ajax(settings)
        .done(function (response) {
          console.log("User data:", response);
          setUserData(response.data);
        })
        .fail(function (error) {
          console.error("Failed to fetch user data:", error);
        });

      // Fetch pending projects data
      const fetchPendingProjects = () => {
        const pendingSettings = {
          url: "http://127.0.0.1:8000/projects/pending-percentage/",
          method: "GET",
          timeout: 0,
          headers: {
            Authorization: `Token ${token}`,
          },
        };

        $.ajax(pendingSettings)
          .done(function (response) {
            console.log("Pending projects data:", response);
            setPendingProjectsData(response);
          })
          .fail(function (error) {
            console.error("Failed to fetch pending projects data:", error);
          });
      };

      fetchPendingProjects();

      // Refresh pending projects data every 5 minutes
      const interval = setInterval(fetchPendingProjects, 300000);

      return () => clearInterval(interval);
    }
  }, [token, refreshTrigger]); // Re-fetch when refreshTrigger changes

  const handleOutsideClicks = (ev) => {
    if (open && drop.current && !drop.current.contains(ev.target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClicks);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClicks);
    };
  }, [open]);

  const handleLogout = () => {
    cookies.remove("token", { path: "/" });
    navigate("/login");
  };

  return (
    <nav id="topbar">
      <div className="topbar-items-container">
        <a href="/" className="logo topbar-item">
          <div id="logo-image" alt="BEMAT Logo"></div>
          <span>BEMAT</span>
        </a>
        <a className="nav-title topbar-item">{params.home}</a>
        <div className="w-full md:block md:w-auto" id="navbar-multi-level">
          <ul className="topbar-right">
            <li className="hover:text-primary-bold">
              <a
                href="#"
                className="block py-2 px-3 rounded-sm md:bg-transparent md:p-0 topbar-item topbar-right-item relative"
                aria-current="page">
                <FaBell className="size-6" />
                {pendingProjectsData &&
                  pendingProjectsData.pending_count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {pendingProjectsData.pending_percentage.toFixed(0)}%
                    </span>
                  )}
              </a>
            </li>
            <li
              className="hover:text-primary-bold topbar-item dropdown"
              ref={drop}>
              <button
                id="user-dropdown-btn"
                data-dropdown-toggle="user-dropdown"
                className="topbar-right-item dropdown">
                <div
                  id="topbar-username"
                  onClick={() => {
                    setOpen((open) => !open);
                  }}>
                  {userData && userData.email
                    ? `${userData.first_name || ""} ${
                        userData.last_name || ""
                      }`.trim() || userData.email
                    : params.loading}
                </div>
                <FaCircleUser className="size-6" />
                <svg
                  className="w-2.5 h-2.5 ms-2.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6">
                  <path d="m1 1 4 4 4-4" />
                </svg>
              </button>
              {open && (
                <div
                  id="user-dropdown"
                  className="absolute top-full right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <ul aria-labelledby="dropdownLargeButton">
                    <li>
                      <a
                        href="#"
                        className="px-4 py-2 flex gap-2 items-center text-primary hover:bg-primary hover:text-white transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpen(false);
                          navigate("/settings");
                        }}>
                        <HiCog6Tooth className="size-[20px]" />
                        {params.settings}
                      </a>
                    </li>
                    <li>
                      <a
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLanguage();
                          setOpen(false);
                        }}
                        className="px-4 py-2 flex gap-2 items-center cursor-pointer text-primary hover:bg-primary hover:text-white transition-colors">
                        <MdTranslate className="size-[20px]" />
                        {params.changeLanguage}
                      </a>
                    </li>
                    <li>
                      <a
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLogout();
                        }}
                        className="px-4 py-2 flex gap-2 items-center cursor-pointer text-primary hover:bg-primary hover:text-white transition-colors">
                        <MdLogout className="size-[20px]" />
                        {params.logout}
                      </a>
                    </li>
                  </ul>
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
