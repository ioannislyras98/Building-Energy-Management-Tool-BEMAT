import { useState, useEffect } from 'react';
import $ from 'jquery';
import Cookies from 'universal-cookie';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
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
          : response.projects || response.data || [];
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
  };
  
  const handleProjectUpdated = (updatedProject) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.uuid === updatedProject.uuid ? updatedProject : project
      )
    );
    return updatedProject;
  };
  
  const handleDeleteProject = (projectUuid, params) => {
    if (window.confirm(params.confirmDelete)) {
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
            resolve(response);
          })
          .fail(function (error) {
            console.error("Failed to delete project:", error);
            alert(params.deleteError);
            reject(error);
          });
      });
    }
    
    return Promise.reject(new Error("Delete cancelled"));
  };
  
  const updateBuildingCount = (projectUuid, increment = true) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.uuid === projectUuid
          ? { 
              ...project, 
              buildings_count: increment 
                ? (project.buildings_count || 0) + 1 
                : Math.max(0, (project.buildings_count || 1) - 1) 
            }
          : project
      )
    );
  };

  useEffect(() => {
    if (token) {
      fetchProjects();
    }
  }, [token]);
  
  return {
    projects,
    loading,
    error,
    fetchProjects,
    handleProjectCreated,
    handleProjectUpdated,
    handleDeleteProject,
    updateBuildingCount
  };
};