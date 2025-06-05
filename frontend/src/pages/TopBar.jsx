import $ from "jquery";
import "./../css/topbar.css"
import { useState, useRef, useEffect } from "react";
import Cookies from 'universal-cookie';
import { useLanguage } from "../context/LanguageContext"; 
import { useNavigate } from "react-router-dom";

import { FaBell, FaCircleUser } from "react-icons/fa6";
import { HiCog6Tooth } from "react-icons/hi2";
import { MdLogout } from "react-icons/md";
import { MdTranslate } from "react-icons/md";

import english_text from '../languages/english.json';
import greek_text from '../languages/greek.json';

const cookies = new Cookies(null, { path: '/' });

export default function TopBar() {
    const [open, setOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const drop = useRef(null);
    const { language, toggleLanguage } = useLanguage();
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
                    "Authorization": `token ${token}`
                },
            };

            $.ajax(settings)
                .done(function (response) {
                    console.log("User data:", response);
                    setUserData(response);
                })
                .fail(function (error) {
                    console.error("Failed to fetch user data:", error);
                });
        }
    }, [token]);

    const handleOutsideClicks = (ev) => {
        if (open && drop.current && !drop.current.contains(ev.target)) {
            setOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("click", handleOutsideClicks);
        return () => {
            document.removeEventListener("click", handleOutsideClicks)
        };
    });

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
                            <a href="#" className="block py-2 px-3 rounded-sm md:bg-transparent md:p-0 topbar-item topbar-right-item" aria-current="page">
                                <FaBell className="size-6" />
                            </a>
                        </li>
                        <li className="hover:text-primary-bold topbar-item dropdown" ref={drop}>
                            <button id="user-dropdown-btn" data-dropdown-toggle="user-dropdown" className="topbar-right-item dropdown">
                                <div id="topbar-username" onClick={() => { setOpen(open => !open) }}>
                                    {userData ? `${userData.first_name} ${userData.last_name}` : params.loading}
                                </div>
                                <FaCircleUser className="size-6" />
                                <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                    <path d="m1 1 4 4 4-4" />
                                </svg>
                            </button>
                            {open &&
                                <div id="user-dropdown">
                                    <ul aria-labelledby="dropdownLargeButton">
                                        <li>
                                            <a href="#" className="px-4 py-2 flex gap-2 self-start">
                                                <HiCog6Tooth className="size-[20px]" />
                                                {params.settings}
                                            </a>
                                        </li>
                                        <li>
                                            <a onClick={toggleLanguage} className="px-4 py-2 flex gap-2 self-start cursor-pointer">
                                                <MdTranslate className="size-[20px]" />
                                                {params.changeLanguage}
                                            </a>
                                        </li>
                                        <li>
                                            <a onClick={handleLogout} className="px-4 py-2 flex gap-2 self-start cursor-pointer">
                                                <MdLogout className="size-[20px]" />
                                                {params.logout}
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            }
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}