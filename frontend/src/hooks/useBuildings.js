import { useState, useCallback } from 'react'; 
import $ from 'jquery';
import Cookies from 'universal-cookie';

export const useBuildings = () => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const cookies = new Cookies(null, { path: '/' }); 
  const token = cookies.get("token") || "";

  const fetchBuildings = useCallback((projectUuid) => {
    if (!projectUuid) {
      setBuildings([]);
      return;
    }
    
    setLoading(true);
    setError(null); 
    
    const settings = {
      url: `http://127.0.0.1:8000/buildings/get/?project=${projectUuid}`,
      method: "GET",
      timeout: 0,
      headers: {
        Authorization: `token ${token}`,
      },
    };

    console.log("Fetching buildings with settings:", settings); 
    $.ajax(settings)
      .done(function (response) {
        console.log("Buildings fetched successfully:", response); 
        const buildingsArray = Array.isArray(response)
          ? response
          : response.buildings || response.data || [];
        setBuildings(buildingsArray);
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        console.error("Failed to fetch buildings:", textStatus, errorThrown, jqXHR);
        console.log("Fetch buildings failed. jqXHR:", jqXHR, "textStatus:", textStatus, "errorThrown:", errorThrown); 
        const errorMessage = jqXHR.responseJSON?.error || jqXHR.statusText || "Failed to fetch buildings.";
        setError(errorMessage);
        if (jqXHR.responseJSON?.error) {
          alert(jqXHR.responseJSON.error);
        }
      })
      .always(function () {
        console.log("Fetch buildings AJAX call finished.");
        setLoading(false);
      });
  }, [token]); 

  const handleBuildingCreated = useCallback((newBuilding) => {
    setBuildings((prevBuildings) => [...prevBuildings, newBuilding]);
  }, []); 
  
  const clearBuildings = useCallback(() => {
    setBuildings([]);
  }, []);

  return {
    buildings,
    loading,
    error,
    fetchBuildings,
    handleBuildingCreated,
    clearBuildings
  };
};