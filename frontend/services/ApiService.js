import axios from "axios";
import Cookies from "universal-cookie";
import API_BASE_URL from "../src/config/api";

const cookies = new Cookies();

const getAuthHeaders = () => {
  const token = cookies.get("token") || "";
  return {
    Authorization: `Token ${token}`,
    "Content-Type": "application/json",
  };
};

export async function getuser() {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/me/`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getAllPrefectures() {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/prefectures/active/all/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getAllPrefecturesAdmin() {
  try {
    const response = await axios.get(`${API_BASE_URL}/prefectures/admin/all/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getPrefecturesByZone(zone) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/prefectures/zone/${zone}/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getEnergyZones() {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/prefectures/zones/list/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function createPrefecture(data) {
  try {
    const response = await axios.post(`${API_BASE_URL}/prefectures/`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updatePrefecture(uuid, data) {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/prefectures/${uuid}/`,
      data,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deletePrefecture(uuid) {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/prefectures/${uuid}/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function createOldAirConditioning(data) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/air_conditioning_replacements/old/create/`,
      data,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getOldAirConditioningsByBuilding(buildingUuid) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/air_conditioning_replacements/old/building/${buildingUuid}/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateOldAirConditioning(acUuid, data) {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/air_conditioning_replacements/old/update/${acUuid}/`,
      data,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteOldAirConditioning(acUuid) {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/air_conditioning_replacements/old/delete/${acUuid}/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function createNewAirConditioning(data) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/air_conditioning_replacements/new/create/`,
      data,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getNewAirConditioningsByBuilding(buildingUuid) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/air_conditioning_replacements/new/building/${buildingUuid}/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateNewAirConditioning(acUuid, data) {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/air_conditioning_replacements/new/update/${acUuid}/`,
      data,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteNewAirConditioning(acUuid) {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/air_conditioning_replacements/new/delete/${acUuid}/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function createAirConditioningAnalysis(data) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/air_conditioning_replacements/analysis/create/`,
      data,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getAirConditioningAnalysisByBuilding(buildingUuid) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/air_conditioning_replacements/analysis/building/${buildingUuid}/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateAirConditioningAnalysis(analysisUuid, data) {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/air_conditioning_replacements/analysis/update/${analysisUuid}/`,
      data,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getBuildingsByProject(projectUuid) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/buildings/get/?project=${projectUuid}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getBuildingById(buildingUuid) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/buildings/get/${buildingUuid}/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function createBuilding(data) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/buildings/create/`,
      data,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateBuilding(buildingUuid, data) {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/buildings/update/${buildingUuid}/`,
      data,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteBuilding(buildingUuid) {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/buildings/delete/${buildingUuid}/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getBoilerDetailsByBuilding(buildingUuid) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/boiler_details/building/${buildingUuid}/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteBoilerDetail(uuid) {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/boiler_details/delete/${uuid}/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getCoolingSystemByBuilding(buildingUuid) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/cooling_systems/building/${buildingUuid}/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteCoolingSystem(uuid) {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/cooling_systems/delete/${uuid}/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getHeatingSystemByBuilding(buildingUuid) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/heating_systems/building/${buildingUuid}/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteHeatingSystem(uuid) {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/heating_systems/delete/${uuid}/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getHotWaterSystemByBuilding(buildingUuid) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/domestic_hot_water_systems/building/${buildingUuid}/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteHotWaterSystem(uuid) {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/domestic_hot_water_systems/delete/${uuid}/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getSolarCollectorsByBuilding(buildingUuid) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/solar_collectors/building/${buildingUuid}/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteSolarCollectors(uuid) {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/solar_collectors/delete/${uuid}/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getImagesByBuilding(buildingUuid) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/building-images/building/${buildingUuid}/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function createImage(data) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/building-images/`,
      data,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateImage(imageId, data) {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/building-images/${imageId}/`,
      data,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteImage(imageId) {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/building-images/${imageId}/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function submitProject(projectUuid) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/projects/${projectUuid}/submit/`,
      {},
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function createProject(data) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/projects/create/`,
      data,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateProject(projectUuid, data) {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/projects/update/${projectUuid}/`,
      data,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteProject(projectUuid) {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/projects/delete/${projectUuid}/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function login(email, password) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/users/login/`,
      {
        email,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function signup(userData) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/users/signup/`,
      userData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function requestPasswordReset(email) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/users/password-reset/`,
      {
        email,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function confirmPasswordReset(
  uid,
  token,
  newPassword,
  newPasswordConfirm
) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/users/reset-password-confirm/${uid}/${token}/`,
      {
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getMaterialCategories() {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/materials/categories/list/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getAllMaterials() {
  try {
    const response = await axios.get(`${API_BASE_URL}/materials/admin/all/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function createMaterial(data) {
  try {
    const response = await axios.post(`${API_BASE_URL}/materials/`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateMaterial(materialId, data) {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/materials/${materialId}/`,
      data,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteMaterial(materialId) {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/materials/${materialId}/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}


export async function getNumericValues() {
  try {
    const response = await axios.get(`${API_BASE_URL}/numeric_values/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateNumericValue(valueId, value) {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/numeric_values/${valueId}/`,
      {
        value: value,
      },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getUserProfile() {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/me/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function updateUserProfile(data) {
  try {
    const response = await axios.patch(`${API_BASE_URL}/users/me/`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function changePassword(
  currentPassword,
  newPassword,
  confirmPassword
) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/users/change-password/`,
      {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      },
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getPendingProjectsPercentage() {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/projects/pending-percentage/`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getProjects() {
  try {
    const response = await axios.get(`${API_BASE_URL}/projects/get/`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
