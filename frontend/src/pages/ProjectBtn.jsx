//css
import "./../css/pages.css";

//icons
import { BsBuildings } from "react-icons/bs";

export default function ProjectBtn({ name, buildings_count, date_created }) {
    return (
        <>
            <div className="project-icon drop-shadow-[0_5px_15px_rgba(53,_94,_59,_0.25)]">
                <BsBuildings className="p-icon text-white" />
            </div>
            <div className="info w-[180px]">
                <label className="poject-name opacity-80 font-bold text-primary">{name}</label>
                <div className="project-details flex flex-col">
                    <span className="opacity-80 font-medium text-primary text-[13px]">Buildings: {buildings_count}</span>
                    <span className="opacity-80 font-extrabold text-primary text-[12px]">Created: {date_created}</span>
                </div>
            </div>
        </>)
}