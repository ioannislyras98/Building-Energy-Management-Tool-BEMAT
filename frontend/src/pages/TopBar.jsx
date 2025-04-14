//jquery
import $ from "jquery";
//css
import "./../css/topbar.css"
//hooks
import { useState, useRef, useEffect } from "react";
//cookie
import Cookies from 'universal-cookie';
import useLanguage from "../tools/cookies/language-cookie";

//icons
import { FaBell, FaCircleUser } from "react-icons/fa6";
import { HiCog6Tooth } from "react-icons/hi2";
import { MdLogout } from "react-icons/md";

//language
import english_text from '../languages/english.json';
import greek_text from '../languages/greek.json';

const cookies = new Cookies(null, { path: '/' });

export default function TopBar({ language, user = "Name Surname" }) {
    const [open, setOpen] = useState(false);
    const drop = useRef(null);

    const handleOutsideClicks = (ev) => {
        if (open && drop.current && !drop.current.contains(ev.target)) {
            setOpen(false);
            ;
        }
    };

    useEffect(() => {
        document.addEventListener("click", handleOutsideClicks);
        return () => {
            document.removeEventListener("click", handleOutsideClicks)
        };
    });

    return (
        <nav id="topbar">
            <div className="topbar-items-container">
                <a href="#" className="logo topbar-item">
                    <div id="logo-image" alt="Flowbite Logo"></div>
                    <span>BEMAT</span>
                </a>
                <a className="nav-title topbar-item">Home</a>
                <div className="w-full md:block md:w-auto" id="navbar-multi-level">
                    <ul className="topbar-right">
                        <li className="hover:text-primary-bold">
                            <a href="#" className="block py-2 px-3 rounded-sm md:bg-transparent md:p-0 topbar-item topbar-right-item" aria-current="page">
                                <FaBell className="size-6" />
                            </a>
                        </li>
                        <li className="hover:text-primary-bold topbar-item dropdown" ref={drop}>
                            <button id="user-dropdown-btn" data-dropdown-toggle="user-dropdown" className="topbar-right-item dropdown">
                                <div id="topbar-username" onClick={() => { setOpen(open => !open) }}>{user}</div>
                                <FaCircleUser className="size-6" />
                                <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                    <path d="m1 1 4 4 4-4" />
                                </svg></button>
                            {open &&
                                <div id="user-dropdown">
                                    <ul aria-labelledby="dropdownLargeButton">
                                        <li className="">
                                            <a href="#" className="px-4 py-2 flex gap-2 self-start">
                                                <HiCog6Tooth className="size-[20px]" />
                                                Settings
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" className="px-4 py-2 flex gap-2 self-start">
                                                <MdLogout className="size-[20px]" />
                                                Logout
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