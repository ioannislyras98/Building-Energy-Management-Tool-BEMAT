import "./../assets/styles/pages.css";
import { BsBuilding } from "react-icons/bs";
import { useLanguage } from "../context/LanguageContext";
import Cookies from "universal-cookie";
import english_text from "../languages/english.json";
import greek_text from "../languages/greek.json";

const cookies = new Cookies(null, { path: "/" });

export default function BuildingBtn({ name, usage, date_created }) {
  const { language } = useLanguage();
  const params =
    language === "en" ? english_text.BuildingBtn : greek_text.BuildingBtn;

  return (
    <>
      <div className="project-icon bg-primary">
        <BsBuilding className="p-icon text-white" />
      </div>
      <div className="info w-[180px]">
        <label className="building-name opacity-80 font-bold text-primary">
          {name}
        </label>
        <div className="building-details flex flex-col">
          <span className="opacity-80 font-medium text-primary text-[13px]">
            {params.usage}: {usage}
          </span>
          <span className="opacity-80 font-extrabold text-primary text-[12px]">
            {params.created}: {date_created}
          </span>
        </div>
      </div>
    </>
  );
}
