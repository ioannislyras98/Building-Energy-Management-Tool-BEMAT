import "./../assets/styles/pages.css";
import Cookies from "universal-cookie";
import { useLanguage } from "../context/LanguageContext";
import { formatDate } from "../utils/dateUtils";
import { BsBuildings } from "react-icons/bs";
import { FaCheckCircle, FaClock } from "react-icons/fa";
import english_text from "../languages/english.json";
import greek_text from "../languages/greek.json";

const cookies = new Cookies(null, { path: "/" });

export default function ProjectBtn({ name, buildings_count, date_created, is_submitted, completion_status }) {
  const { language } = useLanguage();
  const params =
    language === "en" ? english_text.ProjectBtn : greek_text.ProjectBtn;

  const getSubmissionIcon = () => {
    if (is_submitted) {
      return <FaCheckCircle className="text-green-500 size-4" title="Submitted" />;
    } else {
      return <FaClock className="text-yellow-500 size-4" title="Pending" />;
    }
  };

  const getProgressDisplay = () => {
    if (!completion_status) return null;
    
    return (
      <div className="progress-info text-xs mt-1">
        <div className="flex justify-between">
          <span className="text-primary">
            Systems: {completion_status.systems_completed}/{completion_status.systems_total} ({completion_status.overall_systems_progress}%)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-primary">
            Scenarios: {completion_status.scenarios_completed}/{completion_status.scenarios_total} ({completion_status.overall_scenarios_progress}%)
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="project-icon !bg-primary">
        <BsBuildings className="p-icon !text-white" />
      </div>
      <div className="info w-[180px]">
        <div className="flex items-center justify-between">
          <label className="poject-name opacity-80 font-bold text-primary">
            {name}
          </label>
          {getSubmissionIcon()}
        </div>
        <div className="project-details flex flex-col">
          <span className="opacity-80 font-medium text-primary text-[13px]">
            {params.buildings}: {buildings_count}
          </span>
          <span className="opacity-80 font-extrabold text-primary text-[12px]">
            {params.created}: {formatDate(date_created)}
          </span>
          {getProgressDisplay()}
        </div>
      </div>
    </>
  );
}
