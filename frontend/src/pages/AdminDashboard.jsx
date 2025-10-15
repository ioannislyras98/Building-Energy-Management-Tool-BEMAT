import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import Cookies from "universal-cookie";
import AdminStats from "../components/admin/AdminStats";
import UsersManagement from "../components/admin/UsersManagement";
import ProjectsManagement from "../components/admin/ProjectsManagement";
import english_text from "../languages/english.json";
import greek_text from "../languages/greek.json";
import API_BASE_URL from "../config/api.js";
import {
  FaChartBar,
  FaUsers,
  FaProjectDiagram,
  FaUserShield,
} from "react-icons/fa";

const cookies = new Cookies();

const AdminDashboard = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("stats");
  const [loading, setLoading] = useState(true);

  const text =
    language === "en" ? english_text.AdminDashboard : greek_text.AdminDashboard;
  const token = cookies.get("token") || "";

  useEffect(() => {
    const checkAuthAndAdmin = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/users/me/`, {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await response.json();

        // Handle different response structures
        let userData;
        if (data.success && data.data && data.data.user) {
          userData = data.data.user;
        } else if (data.data) {
          userData = data.data;
        } else if (data.user) {
          userData = data.user;
        } else {
          userData = data;
        }

        if (!userData.is_staff) {
          navigate("/dashboard");
          return;
        }
      } catch (error) {
        console.error("Auth error:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndAdmin();
  }, [token, navigate]);

  const tabs = [
    { id: "stats", name: text.statistics || "Statistics", icon: FaChartBar },
    { id: "users", name: text.users || "Users", icon: FaUsers },
    {
      id: "projects",
      name: text.projects || "Projects",
      icon: FaProjectDiagram,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "stats":
        return <AdminStats />;
      case "users":
        return <UsersManagement />;
      case "projects":
        return <ProjectsManagement />;
      default:
        return <AdminStats />;
    }
  };

  if (loading) {
    return (
      <div className="admin-container p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">⏳</div>
          <div className="text-lg text-gray-600">
            {text.loading || "Loading admin dashboard..."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FaUserShield className="text-primary text-xl" />
            <h1 className="text-2xl font-bold text-gray-800">
              {text.title ||
                (language === "en" ? "Admin Dashboard" : "Πίνακας Διαχείρισης")}
            </h1>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm rounded-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}>
                  <IconComponent className="text-lg" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">{renderContent()}</div>
    </div>
  );
};

export default AdminDashboard;
