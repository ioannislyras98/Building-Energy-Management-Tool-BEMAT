import React, { useState, useEffect } from "react";
import Cookies from "universal-cookie";
import { useLanguage } from "../context/LanguageContext";
import english_text from "../languages/english.json";
import greek_text from "../languages/greek.json";

const cookies = new Cookies();

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const { language } = useLanguage();
  const text =
    language === "en" ? english_text.AdminDashboard : greek_text.AdminDashboard;
  const commonText =
    language === "en" ? english_text.AdminCommon : greek_text.AdminCommon;
  const token = cookies.get("token") || "";

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/admin-api/dashboard-stats/",
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Access denied: Admin privileges required");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setError(error.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/admin-api/users/", {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Access denied: Admin privileges required");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.message);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchDashboardStats(), fetchUsers()]);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">{text.loading}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <div className="text-lg mb-2">{text.error}</div>
        <div className="text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-container container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">{text.title}</h1>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "dashboard"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}>
            {text.dashboard}
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "users"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}>
            {text.usersManagement}
          </button>
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && stats && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary-light rounded-md">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {text.totalUsers}
                  </h3>
                  <p className="text-2xl font-bold text-primary">
                    {stats.users.total}
                  </p>
                  <p className="text-sm text-gray-500">
                    {stats.users.active} {text.active}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary-light rounded-md">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {text.totalProjects}
                  </h3>
                  <p className="text-2xl font-bold text-primary">
                    {stats.projects.total}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary-light rounded-md">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {text.totalBuildings}
                  </h3>
                  <p className="text-2xl font-bold text-primary">
                    {stats.buildings.total}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-primary-light/10">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <svg
                className="h-6 w-6 text-primary mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {text.usersManagement}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {language === "en"
                ? `Managing ${users.length} users`
                : `Διαχείριση ${users.length} χρηστών`}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 tracking-wide border-b-2 border-primary/20">
                    {text.user}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wide border-b-2 border-primary/20">
                    {text.status}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 tracking-wide border-b-2 border-primary/20">
                    {text.projects}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 tracking-wide border-b-2 border-primary/20">
                    {text.buildings}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wide border-b-2 border-primary/20">
                    {text.joined}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user, index) => (
                  <tr
                    key={user.uuid}
                    className={`transition-all duration-200 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary-light/10 hover:shadow-md ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}>
                    <td className="px-8 py-6">
                      <div className="flex items-center group">
                        <div className="flex-shrink-0 h-12 w-12 relative">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary-bold flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                            <span className="text-sm font-bold text-white">
                              {user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          {user.is_superuser && (
                            <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white">★</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4 min-w-0 flex-1">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors duration-200">
                            {user.first_name || user.last_name
                              ? `${user.first_name} ${user.last_name}`.trim()
                              : text.noName}
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full shadow-sm ${
                          user.is_superuser
                            ? "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-200"
                            : user.is_staff
                            ? "bg-gradient-to-r from-primary-light to-primary text-primary-bold border border-primary/20"
                            : "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-200"
                        }`}>
                        {user.is_superuser && (
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        )}
                        {user.is_superuser
                          ? text.superuser
                          : user.is_staff
                          ? text.staff
                          : text.user}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-800 text-sm font-bold rounded-full">
                          {user.projects_count}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-800 text-sm font-bold rounded-full">
                          {user.buildings_count}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="text-sm text-gray-700 font-medium">
                        {new Date(user.date_joined).toLocaleDateString(
                          language === "en" ? "en-US" : "el-GR",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {language === "en"
                  ? `Total: ${users.length} users`
                  : `Σύνολο: ${users.length} χρήστες`}
              </span>
              <span>
                {language === "en"
                  ? `Active: ${users.filter((u) => u.last_login).length}`
                  : `Ενεργοί: ${users.filter((u) => u.last_login).length}`}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
