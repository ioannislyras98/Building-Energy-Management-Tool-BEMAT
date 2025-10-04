import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "../../context/LanguageContext";
import Cookies from "universal-cookie";
import BulkDeleteConfirmation from "./BulkDeleteConfirmation";
import DataTable from "./DataTable";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";

const cookies = new Cookies();

const UsersManagement = () => {
  const { language } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    per_page: 25,
    sort_by: "-date_joined",
    is_active: "",
    is_staff: "",
    date_from: "",
    date_to: "",
  });
  const [pagination, setPagination] = useState(null);

  const translations =
    language === "en"
      ? english_text.AdminUsersManagement
      : greek_text.AdminUsersManagement;
  const token = cookies.get("token") || "";

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null) {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(
        `http://127.0.0.1:8000/admin-api/users-table/?${queryParams}`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        setUsers(data.data.users);
        setPagination(data.data.pagination);
      } else {
        setError(data.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [filters, token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleBulkDelete = async (userIds) => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/admin-api/users/bulk-delete/",
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_ids: userIds }),
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        // Refresh the users list
        await fetchUsers();
        setSelectedUsers([]);
        setShowDeleteConfirmation(false);

        // Show success message
        alert(`Successfully deleted ${data.data.deleted_count} users`);
      } else {
        throw new Error(data.error || "Failed to delete users");
      }
    } catch (error) {
      console.error("Error deleting users:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleSort = (sortBy) => {
    setFilters((prev) => ({ ...prev, sort_by: sortBy }));
  };

  const columns = [
    {
      key: "select",
      title: (
        <input
          type="checkbox"
          checked={
            users &&
            users.length > 0 &&
            users.every((user) => selectedUsers.includes(user.id))
          }
          onChange={(e) => {
            if (users && users.length > 0) {
              const filteredUserIds = users.map((user) => user.id);
              if (e.target.checked) {
                setSelectedUsers((prev) => [
                  ...new Set([...prev, ...filteredUserIds]),
                ]);
              } else {
                setSelectedUsers((prev) =>
                  prev.filter((id) => !filteredUserIds.includes(id))
                );
              }
            }
          }}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
      ),
      width: "50px",
      render: (user) => (
        <input
          type="checkbox"
          checked={selectedUsers.includes(user.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedUsers([...selectedUsers, user.id]);
            } else {
              setSelectedUsers(selectedUsers.filter((id) => id !== user.id));
            }
          }}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
      ),
    },
    {
      key: "email",
      title: translations?.email || "Email",
      sortable: true,
      render: (user) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.first_name && user.last_name
                ? `${user.first_name} ${user.last_name}`
                : translations?.noName || "No Name"}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "is_staff",
      title: translations?.status || "Status",
      sortable: true,
      render: (user) => {
        if (user.is_superuser) {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              ⭐ {translations?.superuser || "Superuser"}
            </span>
          );
        } else if (user.is_staff) {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary-bold">
              👔 {translations?.staff || "Staff"}
            </span>
          );
        } else {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              👤 {translations?.user || "User"}
            </span>
          );
        }
      },
    },
    {
      key: "projects_count",
      title: translations?.projects || "Projects",
      sortable: true,
      render: (user) => (
        <span className="text-sm font-medium text-gray-900">
          {user.projects_count || 0}
        </span>
      ),
    },
    {
      key: "is_active",
      title: translations?.active || "Active",
      sortable: true,
      render: (user) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.is_active
              ? "bg-green-100 text-green-800"
              : "bg-primary-light text-primary-bold"
          }`}>
          {user.is_active ? "✅" : "❌"}{" "}
          {user.is_active
            ? translations?.yes || "Yes"
            : translations?.no || "No"}
        </span>
      ),
    },
    {
      key: "date_joined",
      title: translations?.dateJoined || "Date Joined",
      sortable: true,
      render: (user) => (
        <div className="text-sm text-gray-900">
          {user.date_joined
            ? new Date(user.date_joined).toLocaleDateString(
                language === "en" ? "en-US" : "el-GR",
                { year: "numeric", month: "short", day: "numeric" }
              )
            : "N/A"}
        </div>
      ),
    },
    {
      key: "actions",
      title: language === "en" ? "Actions" : "Ενέργειες",
      width: "120px",
      render: (user) => (
        <div className="flex items-center justify-end">
          <button
            onClick={() => handleDeleteUser(user)}
            className="text-primary hover:text-primary-bold transition-colors duration-200"
            title={language === "en" ? "Delete User" : "Διαγραφή Χρήστη"}>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  const filterComponents = (
    <div className="flex flex-wrap gap-4 mb-4">
      <input
        type="text"
        placeholder={translations?.searchPlaceholder || "Search users..."}
        value={filters.search}
        onChange={(e) => handleFilterChange({ search: e.target.value })}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <select
        value={filters.is_active}
        onChange={(e) => handleFilterChange({ is_active: e.target.value })}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
        <option value="">
          {translations?.allActive || "All Active Status"}
        </option>
        <option value="true">{translations?.active || "Active"}</option>
        <option value="false">{translations?.inactive || "Inactive"}</option>
      </select>

      <select
        value={filters.is_staff}
        onChange={(e) => handleFilterChange({ is_staff: e.target.value })}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
        <option value="">{translations?.allRoles || "All Roles"}</option>
        <option value="true">{translations?.staff || "Staff"}</option>
        <option value="false">
          {translations?.regularUsers || "Regular Users"}
        </option>
      </select>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">
          {translations?.dateFrom || "From Date"}:
        </label>
        <input
          type="date"
          value={filters.date_from}
          onChange={(e) => handleFilterChange({ date_from: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">
          {translations?.dateTo || "To Date"}:
        </label>
        <input
          type="date"
          value={filters.date_to}
          onChange={(e) => handleFilterChange({ date_to: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );

  const bulkActions = selectedUsers.length > 0 && (
    <div className="mb-4 flex items-center justify-between bg-primary-light p-4 rounded-lg">
      <span className="text-sm text-gray-700">
        {selectedUsers.length} {translations?.selectedUsers || "users selected"}
      </span>
      <button
        onClick={() => setShowDeleteConfirmation(true)}
        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
        🗑️ {translations?.bulkDelete || "Bulk Delete"}
      </button>
    </div>
  );

  // Action handlers
  const handleDeleteUser = async (user) => {
    if (
      window.confirm(
        `${
          language === "en"
            ? "Are you sure you want to delete user"
            : "Είστε σίγουροι ότι θέλετε να διαγράψετε τον χρήστη"
        } ${user.email}?`
      )
    ) {
      try {
        await handleBulkDelete([user.id]);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <div className="text-xl mb-2">❌ {translations?.error || "Error"}</div>
        <div className="text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          👥 {translations?.title || "Users Management"}
        </h2>
        <p className="text-gray-600">
          {translations?.subtitle || "Manage system users with bulk operations"}
        </p>
      </div>

      {filterComponents}
      {bulkActions}

      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSort={handleSort}
        currentSort={filters.sort_by}
        emptyMessage={translations?.noUsers || "No users found"}
      />

      {showDeleteConfirmation && (
        <BulkDeleteConfirmation
          isOpen={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={() => handleBulkDelete(selectedUsers)}
          items={users.filter((user) => selectedUsers.includes(user.id))}
          itemType="users"
          titleField="email"
          warningMessage={
            translations?.deleteWarning ||
            "This will permanently delete the selected users and all their associated data including projects and buildings."
          }
        />
      )}
    </div>
  );
};

export default UsersManagement;
