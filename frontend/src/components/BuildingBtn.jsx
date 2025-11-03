import "./../assets/styles/pages.css";
import { BsBuilding } from "react-icons/bs";
import { useLanguage } from "../context/LanguageContext";
import { useProgress } from "../context/ProgressContext";
import { formatDate } from "../utils/dateUtils";
import { useState, useEffect } from "react";
import Cookies from "universal-cookie";
import axios from "axios";
import english_text from "../languages/english.json";
import greek_text from "../languages/greek.json";
import API_BASE_URL from "../config/api.js";

const cookies = new Cookies(null, { path: "/" });

export default function BuildingBtn({
  uuid,
  name,
  usage,
  date_created,
  refreshProjects,
}) {
  const { language } = useLanguage();
  const { refreshTrigger } = useProgress();
  const params =
    language === "en" ? english_text.BuildingBtn : greek_text.BuildingBtn;
  const [progressData, setProgressData] = useState(null);

  const fetchProgressData = () => {
    if (uuid) {
      const token = cookies.get("token");
      axios
        .get(`${API_BASE_URL}/projects/building-progress/${uuid}/`, {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          const data = response.data;
          const actualData = data?.data || data;

          if (
            actualData &&
            typeof actualData === "object" &&
            !actualData.error
          ) {
            setProgressData(actualData);
          } else {
            setProgressData(null);
          }
        })
        .catch((error) => {});
    }
  };

  const refreshProgress = () => {
    fetchProgressData();
    if (refreshProjects) {
      refreshProjects();
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, [uuid, refreshTrigger]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchProgressData();
      if (refreshProjects) {
        refreshProjects();
      }
    }, 120000); 

    return () => clearInterval(interval);
  }, [uuid, refreshProjects]);

  const translations =
    language === "en"
      ? english_text.ProjectProgress
      : greek_text.ProjectProgress;

  const getProgressDisplay = () => {
    const displayData = progressData || {
      systems_completed: 0,
      systems_total: 5,
      systems_percentage: 0,
      scenarios_completed: 0,
      scenarios_total: 11,
      scenarios_percentage: 0,
    };

    return (
      <div className="progress-info text-xs mt-1">
        <div className="flex justify-between">
          <span className="text-primary">
            {translations?.systems || "Systems"}:{" "}
            {displayData.systems_completed}/{displayData.systems_total} (
            {displayData.systems_percentage}%)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-primary">
            {translations?.scenarios || "Scenarios"}:{" "}
            {displayData.scenarios_completed}/{displayData.scenarios_total} (
            {displayData.scenarios_percentage}%)
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="project-icon !bg-primary">
        <BsBuilding className="p-icon !text-white" />
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
            {params.created}: {formatDate(date_created)}
          </span>
          {getProgressDisplay()}
        </div>
      </div>
    </>
  );
}
