import { useState, useEffect } from "react";
import $ from "jquery";
import Cookies from "universal-cookie";
import { useProgress } from "../context/ProgressContext";
import { useSidebar } from "../context/SidebarContext";

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { refreshTrigger } = useProgress();
  const { refreshSidebar } = useSidebar();

  const cookies = new Cookies();
  const token = cookies.get("token") || "";

  const fetchProjects = () => {
    setLoading(true);

    const settings = {
      url: "http://127.0.0.1:8000/projects/get/",
      method: "GET",
      timeout: 0,
      headers: {
        Authorization: `token ${token}`,
      },
    };

    $.ajax(settings)
      .done(function (response) {
        console.log("Projects fetched successfully:", response);
        const projectsArray = Array.isArray(response)
          ? response
          : response.projects || response.data.projects || [];
        setProjects(projectsArray);
        setLoading(false);
      })
      .fail(function (error) {
        console.error(error);
        setError(error);
        setLoading(false);
      });
  };

  const handleProjectCreated = (newProject) => {
    setProjects((prevProjects) => [...prevProjects, newProject]);
    refreshSidebar(); // Refresh sidebar to show new project
  };

  const handleProjectUpdated = (updatedProject) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.uuid === updatedProject.uuid ? updatedProject : project
      )
    );
    refreshSidebar(); // Refresh sidebar to show updated project
    return updatedProject;
  };

  const handleDeleteProject = (projectUuid, params) => {
    const settings = {
      url: `http://127.0.0.1:8000/projects/delete/${projectUuid}/`,
      method: "DELETE",
      timeout: 0,
      headers: {
        Authorization: `token ${token}`,
      },
    };

    return new Promise((resolve, reject) => {
      $.ajax(settings)
        .done(function (response) {
          setProjects((prevProjects) =>
            prevProjects.filter((project) => project.uuid !== projectUuid)
          );
          refreshSidebar(); // Refresh sidebar to remove deleted project
          resolve(response);
        })
        .fail(function (error) {
          console.error("Failed to delete project:", error);
          alert(params.deleteError);
          reject(error);
        });
    });
  };

  const updateBuildingCount = (projectUuid, increment = true) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.uuid === projectUuid
          ? {
              ...project,
              buildings_count: increment
                ? (project.buildings_count || 0) + 1
                : Math.max(0, (project.buildings_count || 1) - 1),
            }
          : project
      )
    );
    refreshSidebar(); // Refresh sidebar to show updated building count
  };

  useEffect(() => {
    if (token) {
      fetchProjects();
    }
  }, [token, refreshTrigger]); // Re-fetch when refreshTrigger changes

  return {
    projects,
    loading,
    error,
    fetchProjects,
    refreshProjects: fetchProjects, // Alias for refetching projects
    handleProjectCreated,
    handleProjectUpdated,
    handleDeleteProject,
    updateBuildingCount,
  };
};
