import axios from "axios";
import Cookies from "universal-cookie";

const cookies = new Cookies();

export function getuser() {
  return axios
    .get("http://127.0.0.1:8000/user/")
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
}

// Prefecture API functions
export function getAllPrefectures() {
  const token = cookies.get("token") || "";
  return axios
    .get("http://127.0.0.1:8000/prefectures/active/all/", {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log("Error fetching prefectures:", error);
      throw error;
    });
}

export function getAllPrefecturesAdmin() {
  const token = cookies.get("token") || "";
  return axios
    .get("http://127.0.0.1:8000/prefectures/admin/all/", {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log("Error fetching all prefectures for admin:", error);
      throw error;
    });
}

export function getPrefecturesByZone(zone) {
  const token = cookies.get("token") || "";
  return axios
    .get(`http://127.0.0.1:8000/prefectures/zone/${zone}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log("Error fetching prefectures by zone:", error);
      throw error;
    });
}

export function getEnergyZones() {
  const token = cookies.get("token") || "";
  return axios
    .get("http://127.0.0.1:8000/prefectures/zones/list/", {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log("Error fetching energy zones:", error);
      throw error;
    });
}

// Admin Prefecture CRUD operations
export function createPrefecture(data) {
  const token = cookies.get("token") || "";
  return axios
    .post("http://127.0.0.1:8000/prefectures/", data, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log("Error creating prefecture:", error);
      throw error;
    });
}

export function updatePrefecture(uuid, data) {
  const token = cookies.get("token") || "";
  return axios
    .put(`http://127.0.0.1:8000/prefectures/${uuid}/`, data, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log("Error updating prefecture:", error);
      throw error;
    });
}

export function deletePrefecture(uuid) {
  const token = cookies.get("token") || "";
  return axios
    .delete(`http://127.0.0.1:8000/prefectures/${uuid}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log("Error deleting prefecture:", error);
      throw error;
    });
}

// Air Conditioning Replacement API functions

// Old Air Conditioning Units
export function createOldAirConditioning(data) {
  const token = cookies.get("token") || "";
  return axios
    .post(
      "http://127.0.0.1:8000/air_conditioning_replacements/old/create/",
      data,
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log("Error creating old air conditioning:", error);
      throw error;
    });
}

export function getOldAirConditioningsByBuilding(buildingUuid) {
  const token = cookies.get("token") || "";
  return axios
    .get(
      `http://127.0.0.1:8000/air_conditioning_replacements/old/building/${buildingUuid}/`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    )
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log("Error fetching old air conditionings:", error);
      throw error;
    });
}

export function updateOldAirConditioning(acUuid, data) {
  const token = cookies.get("token") || "";
  return axios
    .put(
      `http://127.0.0.1:8000/air_conditioning_replacements/old/update/${acUuid}/`,
      data,
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log("Error updating old air conditioning:", error);
      throw error;
    });
}

export function deleteOldAirConditioning(acUuid) {
  const token = cookies.get("token") || "";
  return axios
    .delete(
      `http://127.0.0.1:8000/air_conditioning_replacements/old/delete/${acUuid}/`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    )
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log("Error deleting old air conditioning:", error);
      throw error;
    });
}

// New Air Conditioning Units
export function createNewAirConditioning(data) {
  const token = cookies.get("token") || "";
  return axios
    .post(
      "http://127.0.0.1:8000/air_conditioning_replacements/new/create/",
      data,
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log("Error creating new air conditioning:", error);
      throw error;
    });
}

export function getNewAirConditioningsByBuilding(buildingUuid) {
  const token = cookies.get("token") || "";
  return axios
    .get(
      `http://127.0.0.1:8000/air_conditioning_replacements/new/building/${buildingUuid}/`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    )
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log("Error fetching new air conditionings:", error);
      throw error;
    });
}

export function updateNewAirConditioning(acUuid, data) {
  const token = cookies.get("token") || "";
  return axios
    .put(
      `http://127.0.0.1:8000/air_conditioning_replacements/new/update/${acUuid}/`,
      data,
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log("Error updating new air conditioning:", error);
      throw error;
    });
}

export function deleteNewAirConditioning(acUuid) {
  const token = cookies.get("token") || "";
  return axios
    .delete(
      `http://127.0.0.1:8000/air_conditioning_replacements/new/delete/${acUuid}/`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    )
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log("Error deleting new air conditioning:", error);
      throw error;
    });
}

// Air Conditioning Analysis
export function createAirConditioningAnalysis(data) {
  const token = cookies.get("token") || "";
  return axios
    .post(
      "http://127.0.0.1:8000/air_conditioning_replacements/analysis/create/",
      data,
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log("Error creating air conditioning analysis:", error);
      throw error;
    });
}

export function getAirConditioningAnalysisByBuilding(buildingUuid) {
  const token = cookies.get("token") || "";
  return axios
    .get(
      `http://127.0.0.1:8000/air_conditioning_replacements/analysis/building/${buildingUuid}/`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    )
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log("Error fetching air conditioning analysis:", error);
      throw error;
    });
}

export function updateAirConditioningAnalysis(analysisUuid, data) {
  const token = cookies.get("token") || "";
  return axios
    .put(
      `http://127.0.0.1:8000/air_conditioning_replacements/analysis/update/${analysisUuid}/`,
      data,
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log("Error updating air conditioning analysis:", error);
      throw error;
    });
}
