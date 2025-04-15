import React, { useState, useEffect, useRef } from "react";
//jquery
import $ from "jquery";
//css
import "./../css/sidebar.css"
//icons
import { FaArrowRight } from "react-icons/fa6";
import { IoHome } from "react-icons/io5";

export default function Sidenav() {
    // Define state for sidebar expansion
    const [sidebarExpanded, setSidebarExpanded] = useState(true);


    const sidebar = useRef(null);

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
                className={` ${sidebarExpanded ? "sidebar-expanded" : "sidebar-shrinked"
                    }`}>
                <div className="pt-[80px] pl-1">         
                    <a href="/" className="flex nav-link">
                    <IoHome className="sidebar-icon" />
                    {
                        sidebarExpanded && <span
                            className="pl-3 text-md font-medium tracking-tighter focus:outline-none focus:ring whitespace-nowrap cursor-pointer"
                        > Home
                        </span>
                    }

                </a></div>

                {/* Expand / collapse button */}
                <div className="pt-3 lg:inline-flex  mt-auto ">
                    <div className="flex-1" />
                    <div className="px-3 py-2 justify-end">
                        <button onClick={() => setSidebarExpanded(!sidebarExpanded)}>
                            <FaArrowRight className={`${!sidebarExpanded ? "rotate-0" : "rotate-180"} sidebar-icon`} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
};