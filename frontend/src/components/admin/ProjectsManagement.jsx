import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "../../context/LanguageContext";
import Cookies from "universal-cookie";
import ConfirmationDialog from "../dialogs/ConfirmationDialog";
import DataTable from "./DataTable";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import API_BASE_URL from "../../config/api";

const cookies = new Cookies();

const ProjectsManagement = () => {
  const { language } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    per_page: 25,
    sort_by: "-date_created",
    is_submitted: "",
    user_id: "",
    date_from: "",
    date_to: "",
  });
  const [pagination, setPagination] = useState(null);

  const translations =
    language === "en"
      ? english_text.AdminProjectsManagement
      : greek_text.AdminProjectsManagement;
  const token = cookies.get("token") || "";

  const fetchProjects = useCallback(async () => {
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
        `${API_BASE_URL}/admin-api/projects-table/?${queryParams}`,
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
        setProjects(data.data.projects);
        setPagination(data.data.pagination);
      } else {
        setError(data.message || "Failed to fetch projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [filters, token]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleBulkDelete = async (projectIds) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin-api/projects/bulk-delete/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ project_ids: projectIds }),
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        // Refresh the projects list
        await fetchProjects();
        setSelectedProjects([]);
        setBulkDeleteDialogOpen(false);

        // Show success message
        alert(`Successfully deleted ${data.data.deleted_count} projects`);
      } else {
        throw new Error(data.error || "Failed to delete projects");
      }
    } catch (error) {
      console.error("Error deleting projects:", error);
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
            projects &&
            projects.length > 0 &&
            projects.every((project) => selectedProjects.includes(project.id))
          }
          onChange={(e) => {
            if (projects && projects.length > 0) {
              const filteredProjectIds = projects.map((project) => project.id);
              if (e.target.checked) {
                setSelectedProjects((prev) => [
                  ...new Set([...prev, ...filteredProjectIds]),
                ]);
              } else {
                setSelectedProjects((prev) =>
                  prev.filter((id) => !filteredProjectIds.includes(id))
                );
              }
            }
          }}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
      ),
      width: "50px",
      render: (project) => (
        <input
          type="checkbox"
          checked={selectedProjects.includes(project.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedProjects([...selectedProjects, project.id]);
            } else {
              setSelectedProjects(
                selectedProjects.filter((id) => id !== project.id)
              );
            }
          }}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
      ),
    },
    {
      key: "name",
      title: translations?.projectName || "Project Name",
      sortable: true,
      render: (project) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {project.name}
          </div>
          <div className="text-sm text-gray-500 font-mono">
            {project.uuid?.substring(0, 8)}...
          </div>
        </div>
      ),
    },
    {
      key: "user__email",
      title: translations?.owner || "Owner",
      sortable: true,
      render: (project) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {project.user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {project.user?.username || project.user?.email}
            </div>
            <div className="text-sm text-gray-500">{project.user?.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "is_submitted",
      title: translations?.status || "Status",
      sortable: true,
      render: (project) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            project.is_submitted
              ? "bg-green-100 text-green-800"
              : "bg-primary-light text-primary-bold"
          }`}>
          {project.is_submitted ? "✅" : "📝"}{" "}
          {project.is_submitted
            ? translations?.submitted || "Submitted"
            : translations?.draft || "Draft"}
        </span>
      ),
    },
    {
      key: "buildings_count",
      title: translations?.buildings || "Buildings",
      sortable: true,
      render: (project) => (
        <div className="flex items-center">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-primary-light text-primary-bold text-xs font-bold rounded-full">
            {project.buildings_count || 0}
          </span>
        </div>
      ),
    },
    {
      key: "cost_per_kwh_fuel",
      title: translations?.fuelCost || "Fuel Cost",
      sortable: true,
      render: (project) => (
        <div className="text-sm text-gray-900">
          €{project.cost_per_kwh_fuel?.toFixed(3) || "0.000"}/kWh
        </div>
      ),
    },
    {
      key: "cost_per_kwh_electricity",
      title: translations?.electricityCost || "Electricity Cost",
      sortable: true,
      render: (project) => (
        <div className="text-sm text-gray-900">
          €{project.cost_per_kwh_electricity?.toFixed(3) || "0.000"}/kWh
        </div>
      ),
    },
    {
      key: "date_created",
      title: translations?.dateCreated || "Date Created",
      sortable: true,
      render: (project) => (
        <div className="text-sm text-gray-900">
          {project.date_created
            ? new Date(project.date_created).toLocaleDateString(
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
      render: (project) => (
        <div className="flex items-center justify-end">
          <button
            onClick={() => handleDeleteProjectClick(project)}
            className="text-red-600 hover:text-red-900 transition-colors duration-200"
            title={language === "en" ? "Delete Project" : "Διαγραφή Έργου"}>
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
        placeholder={translations?.searchPlaceholder || "Search projects..."}
        value={filters.search}
        onChange={(e) => handleFilterChange({ search: e.target.value })}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <select
        value={filters.is_submitted}
        onChange={(e) => handleFilterChange({ is_submitted: e.target.value })}
        className="px py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
        <option value="">{translations?.allStatus || "All Status"}</option>
        <option value="true">{translations?.submitted || "Submitted"}</option>
        <option value="false">{translations?.draft || "Draft"}</option>
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

  const bulkActions = selectedProjects.length > 0 && (
    <div className="mb-4 flex items-center justify-between bg-primary-light p-4 rounded-lg">
      <span className="text-sm text-gray-700">
        {selectedProjects.length}{" "}
        {translations?.selectedProjects || "projects selected"}
      </span>
      <button
        onClick={() => setBulkDeleteDialogOpen(true)}
        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
        🗑️ {translations?.bulkDelete || "Bulk Delete"}
      </button>
    </div>
  );

  // Action handlers
  const handleDeleteProjectClick = (project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteProjectConfirm = async () => {
    if (!projectToDelete) return;

    try {
      await handleBulkDelete([projectToDelete.id]);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const handleBulkDeleteConfirm = async () => {
    await handleBulkDelete(selectedProjects);
  };

  const handleBulkDeleteDialogClose = () => {
    setBulkDeleteDialogOpen(false);
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
          📋 {translations?.title || "Projects Management"}
        </h2>
        <p className="text-gray-600">
          {translations?.subtitle ||
            "Manage system projects with bulk operations"}
        </p>
      </div>

      {filterComponents}
      {bulkActions}

      <DataTable
        data={projects}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSort={handleSort}
        currentSort={filters.sort_by}
        emptyMessage={translations?.noProjects || "No projects found"}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationDialog
        open={bulkDeleteDialogOpen}
        onClose={handleBulkDeleteDialogClose}
        onConfirm={handleBulkDeleteConfirm}
        title={
          language === "en"
            ? "Delete Selected Projects"
            : "Διαγραφή Επιλεγμένων Έργων"
        }
        message={
          selectedProjects.length > 0
            ? `${
                language === "en"
                  ? `Are you sure you want to delete ${
                      selectedProjects.length
                    } selected project${
                      selectedProjects.length !== 1 ? "s" : ""
                    }? This will permanently delete all associated data including buildings, energy consumption data, and calculations.`
                  : `Είστε βέβαιοι ότι θέλετε να διαγράψετε ${
                      selectedProjects.length
                    } επιλεγμέν${
                      selectedProjects.length === 1 ? "ο έργο" : "α έργα"
                    }? Αυτό θα διαγράψει μόνιμα όλα τα σχετικά δεδομένα συμπεριλαμβανομένων κτιρίων, δεδομένων κατανάλωσης ενέργειας και υπολογισμών.`
              }`
            : ""
        }
        confirmText={language === "en" ? "Delete All" : "Διαγραφή Όλων"}
        cancelText={language === "en" ? "Cancel" : "Άκυρο"}
        confirmColor="error"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleDeleteProjectConfirm}
        title={language === "en" ? "Delete Project" : "Διαγραφή Έργου"}
        message={
          projectToDelete
            ? `${
                language === "en"
                  ? "Are you sure you want to delete project"
                  : "Είστε βέβαιοι ότι θέλετε να διαγράψετε το έργο"
              } "${projectToDelete.name}"?`
            : ""
        }
        confirmText={language === "en" ? "Delete" : "Διαγραφή"}
        cancelText={language === "en" ? "Cancel" : "Άκυρο"}
        confirmColor="error"
      />
    </div>
  );
};

export default ProjectsManagement;
