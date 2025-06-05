import "./../css/pages.css";
import { useContext } from "react";
import Cookies from 'universal-cookie';
import { useLanguage } from "../context/LanguageContext";
import { BsBuildings } from "react-icons/bs";
import english_text from '../languages/english.json';
import greek_text from '../languages/greek.json';

const cookies = new Cookies(null, { path: '/' });

export default function ProjectBtn({ name, buildings_count, date_created }) {
    const { language } = useLanguage();
    const params = language === "en" ? english_text.ProjectBtn : greek_text.ProjectBtn;
    
    return (
        <>
            <div className="project-icon bg-primary">
                <BsBuildings className="p-icon text-white" />
            </div>
            <div className="info w-[180px]">
                <label className="poject-name opacity-80 font-bold text-primary">{name}</label>
                <div className="project-details flex flex-col">
                    <span className="opacity-80 font-medium text-primary text-[13px]">{params.buildings}: {buildings_count}</span>
                    <span className="opacity-80 font-extrabold text-primary text-[12px]">{params.created}: {date_created}</span>
                </div>
            </div>
        </>)
}