import React, { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import Cookies from "universal-cookie";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";

const cookies = new Cookies();

const AdminStats = () => {
  const { language } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const translations =
    language === "en" ? english_text.AdminStats : greek_text.AdminStats;
  const token = cookies.get("token") || "";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch dashboard stats from dedicated endpoint
        const statsResponse = await fetch(
          "http://127.0.0.1:8000/admin-api/dashboard-stats/",
          {
            method: "GET",
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!statsResponse.ok) {
          throw new Error(
            `Failed to fetch dashboard stats: ${statsResponse.status}`
          );
        }

        const statsData = await statsResponse.json();

        if (statsData.status === "success") {
          const data = statsData.data;

          setStats({
            totalUsers: data.users.total || 0,
            totalProjects: data.projects.total || 0,
            submittedProjects: 0, // This would need additional endpoint
            draftProjects: data.projects.total || 0,
            totalBuildings: data.buildings.total || 0,
          });
        } else {
          setError("Failed to fetch statistics");
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        setError(error.message || "Failed to fetch statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="text-xl text-gray-600">
          ⏳ {translations?.loading || "Loading statistics..."}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <div className="text-xl mb-2">❌ {translations?.error || "Error"}</div>
        <div className="text-sm">{error}</div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon, color, description }) => (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${color}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="text-3xl font-semibold text-gray-900">{value}</dd>
            {description && (
              <dd className="text-sm text-gray-400">{description}</dd>
            )}
          </dl>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📊 {translations?.title || "System Statistics"}
        </h2>
        <p className="text-gray-600">
          {translations?.subtitle || "Overview of system usage and activity"}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={translations?.totalUsers || "Total Users"}
          value={stats?.totalUsers || 0}
          icon="👥"
          color="border-blue-500"
          description={translations?.registeredUsers || "Registered users"}
        />

        <StatCard
          title={translations?.totalProjects || "Total Projects"}
          value={stats?.totalProjects || 0}
          icon="📋"
          color="border-green-500"
          description={translations?.allProjects || "All projects"}
        />

        <StatCard
          title={translations?.submittedProjects || "Submitted Projects"}
          value={stats?.submittedProjects || 0}
          icon="✅"
          color="border-indigo-500"
          description={translations?.completedProjects || "Completed projects"}
        />

        <StatCard
          title={translations?.draftProjects || "Draft Projects"}
          value={stats?.draftProjects || 0}
          icon="📝"
          color="border-yellow-500"
          description={translations?.inProgress || "In progress"}
        />
      </div>

      {/* Buildings Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title={translations?.totalBuildings || "Total Buildings"}
          value={stats?.totalBuildings || 0}
          icon="🏢"
          color="border-purple-500"
          description={
            translations?.registeredBuildings || "Registered buildings"
          }
        />
      </div>
    </div>
  );
};

export default AdminStats;
