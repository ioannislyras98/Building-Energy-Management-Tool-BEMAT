import { useState, useCallback } from "react";
import { useSidebar } from "../context/SidebarContext";
import { getBuildingsByProject } from "../../services/ApiService";

export const useBuildings = () => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { refreshSidebar } = useSidebar();

  const fetchBuildings = useCallback(async (projectUuid) => {
    if (!projectUuid) {
      setBuildings([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getBuildingsByProject(projectUuid);
      const buildingsArray = Array.isArray(response)
        ? response
        : response.buildings || response.data || [];
      setBuildings(buildingsArray);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Failed to fetch buildings.";
      setError(errorMessage);
      if (err.response?.data?.error) {
        alert(err.response.data.error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBuildingCreated = useCallback(
    (newBuilding) => {
      setBuildings((prevBuildings) => [...prevBuildings, newBuilding]);
      refreshSidebar();
    },
    [refreshSidebar]
  );

  const handleBuildingDeleted = useCallback(
    (buildingUuid) => {
      setBuildings((prevBuildings) =>
        prevBuildings.filter((building) => building.uuid !== buildingUuid)
      );
      refreshSidebar();
    },
    [refreshSidebar]
  );

  const clearBuildings = useCallback(() => {
    setBuildings([]);
  }, []);

  return {
    buildings,
    loading,
    error,
    fetchBuildings,
    handleBuildingCreated,
    handleBuildingDeleted,
    clearBuildings,
  };
};
