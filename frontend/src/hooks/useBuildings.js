import { useState } from 'react';
import $ from 'jquery';
import Cookies from 'universal-cookie';

export const useBuildings = () => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const cookies = new Cookies();
  const token = cookies.get("token") || "";

  const fetchBuildings = (projectUuid) => {
    if (!projectUuid) {
      setBuildings([]);
      return;
    }
    
    setLoading(true);
    
    const settings = {
      url: `http://127.0.0.1:8000/buildings/get/?project=${projectUuid}`,
      method: "GET",
      timeout: 0,
      headers: {
        Authorization: `token ${token}`,
      },
    };

    $.ajax(settings)
      .done(function (response) {
        const buildingsArray = Array.isArray(response)
          ? response
          : response.buildings || response.data || [];
        setBuildings(buildingsArray);
        setLoading(false);
      })
      .fail(function (error) {
        console.error("Failed to fetch buildings:", error);
        setError(error);
        setLoading(false);
        if (error.responseJSON?.error) {
          alert(error.responseJSON.error);
        }
      });
  };

  const handleBuildingCreated = (newBuilding) => {
    setBuildings((prevBuildings) => [...prevBuildings, newBuilding]);
  };
  
  const clearBuildings = () => {
    setBuildings([]);
  };

  return {
    buildings,
    loading,
    error,
    fetchBuildings,
    handleBuildingCreated,
    clearBuildings
  };
};