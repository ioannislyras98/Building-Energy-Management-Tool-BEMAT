import "./../assets/styles/pages.css";
import { BsBuilding } from "react-icons/bs";
import { useLanguage } from "../context/LanguageContext";
import { useProgress } from "../context/ProgressContext";
import { formatDate } from "../utils/dateUtils";
import { useState, useEffect } from "react";
import Cookies from "universal-cookie";
import english_text from "../languages/english.json";
import greek_text from "../languages/greek.json";

const cookies = new Cookies(null, { path: "/" });

export default function BuildingBtn({ uuid, name, usage, date_created, refreshProjects }) {
  const { language } = useLanguage();
  const { refreshTrigger } = useProgress();
  const params =
    language === "en" ? english_text.BuildingBtn : greek_text.BuildingBtn;
  const [progressData, setProgressData] = useState(null);

  const fetchProgressData = () => {
    if (uuid) {
      const token = cookies.get("token");
      fetch(`http://127.0.0.1:8000/projects/building-progress/${uuid}/`, {
        method: "GET",
        headers: {
          "Authorization": `Token ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data && !data.error) {
            setProgressData(data);
          }
        })
        .catch((error) => {
          console.error("Error fetching building progress:", error);
        });
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, [uuid, refreshTrigger]); // Re-fetch when refreshTrigger changes

  // Refetch data every 30 seconds to keep it updated
  useEffect(() => {
    const interval = setInterval(() => {
      fetchProgressData();
      if (refreshProjects) {
        refreshProjects();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [uuid, refreshProjects]);

  const getProgressDisplay = () => {
    if (!progressData) return null;
    
    return (
      <div className="progress-info text-xs mt-1">
        <div className="flex justify-between">
          <span className="text-primary">
            Systems: {progressData.systems_completed}/{progressData.systems_total} ({progressData.systems_percentage}%)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-primary">
            Scenarios: {progressData.scenarios_completed}/{progressData.scenarios_total} ({progressData.scenarios_percentage}%)
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
