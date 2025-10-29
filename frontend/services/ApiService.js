import axios from "axios";
import Cookies from "universal-cookie";
import API_BASE_URL from "../src/config/api";

const cookies = new Cookies();

export function getuser() {
  return axios
    .get(`${API_BASE_URL}/user/`)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {});
}

export function getAllPrefectures() {
  const token = cookies.get("token") || "";
  return axios
    .get(`${API_BASE_URL}/prefectures/active/all/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function getAllPrefecturesAdmin() {
  const token = cookies.get("token") || "";
  return axios
    .get(`${API_BASE_URL}/prefectures/admin/all/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function getPrefecturesByZone(zone) {
  const token = cookies.get("token") || "";
  return axios
    .get(`${API_BASE_URL}/prefectures/zone/${zone}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function getEnergyZones() {
  const token = cookies.get("token") || "";
  return axios
    .get(`${API_BASE_URL}/prefectures/zones/list/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

// Admin Prefecture CRUD operations
export function createPrefecture(data) {
  const token = cookies.get("token") || "";
  return axios
    .post(`${API_BASE_URL}/prefectures/`, data, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function updatePrefecture(uuid, data) {
  const token = cookies.get("token") || "";
  return axios
    .put(`${API_BASE_URL}/prefectures/${uuid}/`, data, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function deletePrefecture(uuid) {
  const token = cookies.get("token") || "";
  return axios
    .delete(`${API_BASE_URL}/prefectures/${uuid}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function createOldAirConditioning(data) {
  const token = cookies.get("token") || "";
  return axios
    .post(`${API_BASE_URL}/air_conditioning_replacements/old/create/`, data, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function getOldAirConditioningsByBuilding(buildingUuid) {
  const token = cookies.get("token") || "";
  return axios
    .get(
      `${API_BASE_URL}/air_conditioning_replacements/old/building/${buildingUuid}/`,
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
      throw error;
    });
}

export function updateOldAirConditioning(acUuid, data) {
  const token = cookies.get("token") || "";
  return axios
    .put(
      `${API_BASE_URL}/air_conditioning_replacements/old/update/${acUuid}/`,
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
      throw error;
    });
}

export function deleteOldAirConditioning(acUuid) {
  const token = cookies.get("token") || "";
  return axios
    .delete(
      `${API_BASE_URL}/air_conditioning_replacements/old/delete/${acUuid}/`,
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
      throw error;
    });
}

// New Air Conditioning Units
export function createNewAirConditioning(data) {
  const token = cookies.get("token") || "";
  return axios
    .post(`${API_BASE_URL}/air_conditioning_replacements/new/create/`, data, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function getNewAirConditioningsByBuilding(buildingUuid) {
  const token = cookies.get("token") || "";
  return axios
    .get(
      `${API_BASE_URL}/air_conditioning_replacements/new/building/${buildingUuid}/`,
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
      throw error;
    });
}

export function updateNewAirConditioning(acUuid, data) {
  const token = cookies.get("token") || "";
  return axios
    .put(
      `${API_BASE_URL}/air_conditioning_replacements/new/update/${acUuid}/`,
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
      throw error;
    });
}

export function deleteNewAirConditioning(acUuid) {
  const token = cookies.get("token") || "";
  return axios
    .delete(
      `${API_BASE_URL}/air_conditioning_replacements/new/delete/${acUuid}/`,
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
      throw error;
    });
}

export function createAirConditioningAnalysis(data) {
  const token = cookies.get("token") || "";
  return axios
    .post(
      `${API_BASE_URL}/air_conditioning_replacements/analysis/create/`,
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
      throw error;
    });
}

export function getAirConditioningAnalysisByBuilding(buildingUuid) {
  const token = cookies.get("token") || "";
  return axios
    .get(
      `${API_BASE_URL}/air_conditioning_replacements/analysis/building/${buildingUuid}/`,
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
      throw error;
    });
}

export function updateAirConditioningAnalysis(analysisUuid, data) {
  const token = cookies.get("token") || "";
  return axios
    .put(
      `${API_BASE_URL}/air_conditioning_replacements/analysis/update/${analysisUuid}/`,
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
      throw error;
    });
}

export function getBuildingsByProject(projectUuid) {
  const token = cookies.get("token") || "";
  return axios
    .get(`${API_BASE_URL}/buildings/get/?project=${projectUuid}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function getBuildingById(buildingUuid) {
  const token = cookies.get("token") || "";
  return axios
    .get(`${API_BASE_URL}/buildings/get/${buildingUuid}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function createBuilding(data) {
  const token = cookies.get("token") || "";
  return axios
    .post(`${API_BASE_URL}/buildings/create/`, data, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function updateBuilding(buildingUuid, data) {
  const token = cookies.get("token") || "";
  return axios
    .put(`${API_BASE_URL}/buildings/update/${buildingUuid}/`, data, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function deleteBuilding(buildingUuid) {
  const token = cookies.get("token") || "";
  return axios
    .delete(`${API_BASE_URL}/buildings/delete/${buildingUuid}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

// Systems API functions
// Boiler Detail
export function getBoilerDetailsByBuilding(buildingUuid) {
  const token = cookies.get("token") || "";
  return axios
    .get(`${API_BASE_URL}/boiler_details/building/${buildingUuid}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function deleteBoilerDetail(uuid) {
  const token = cookies.get("token") || "";
  return axios
    .delete(`${API_BASE_URL}/boiler_details/delete/${uuid}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

// Cooling System
export function getCoolingSystemByBuilding(buildingUuid) {
  const token = cookies.get("token") || "";
  return axios
    .get(`${API_BASE_URL}/cooling_systems/building/${buildingUuid}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function deleteCoolingSystem(uuid) {
  const token = cookies.get("token") || "";
  return axios
    .delete(`${API_BASE_URL}/cooling_systems/delete/${uuid}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

// Heating System
export function getHeatingSystemByBuilding(buildingUuid) {
  const token = cookies.get("token") || "";
  return axios
    .get(`${API_BASE_URL}/heating_systems/building/${buildingUuid}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function deleteHeatingSystem(uuid) {
  const token = cookies.get("token") || "";
  return axios
    .delete(`${API_BASE_URL}/heating_systems/delete/${uuid}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

// Hot Water System
export function getHotWaterSystemByBuilding(buildingUuid) {
  const token = cookies.get("token") || "";
  return axios
    .get(
      `${API_BASE_URL}/domestic_hot_water_systems/building/${buildingUuid}/`,
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
      throw error;
    });
}

export function deleteHotWaterSystem(uuid) {
  const token = cookies.get("token") || "";
  return axios
    .delete(`${API_BASE_URL}/domestic_hot_water_systems/delete/${uuid}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

// Solar Collectors
export function getSolarCollectorsByBuilding(buildingUuid) {
  const token = cookies.get("token") || "";
  return axios
    .get(`${API_BASE_URL}/solar_collectors/building/${buildingUuid}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function deleteSolarCollectors(uuid) {
  const token = cookies.get("token") || "";
  return axios
    .delete(`${API_BASE_URL}/solar_collectors/delete/${uuid}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

// Images API functions
export function getImagesByBuilding(buildingUuid) {
  const token = cookies.get("token") || "";
  return axios
    .get(`${API_BASE_URL}/building-images/building/${buildingUuid}/`, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function createImage(data) {
  const token = cookies.get("token") || "";
  return axios
    .post(`${API_BASE_URL}/building-images/`, data, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function updateImage(imageId, data) {
  const token = cookies.get("token") || "";
  return axios
    .put(`${API_BASE_URL}/building-images/${imageId}/`, data, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function deleteImage(imageId) {
  const token = cookies.get("token") || "";
  return axios
    .delete(`${API_BASE_URL}/building-images/${imageId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

// Projects API functions
export function submitProject(projectUuid) {
  const token = cookies.get("token") || "";
  return axios
    .post(
      `${API_BASE_URL}/projects/${projectUuid}/submit/`,
      {},
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
      throw error;
    });
}

export function createProject(data) {
  const token = cookies.get("token") || "";
  return axios
    .post(`${API_BASE_URL}/projects/create/`, data, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function updateProject(projectUuid, data) {
  const token = cookies.get("token") || "";
  return axios
    .put(`${API_BASE_URL}/projects/update/${projectUuid}/`, data, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function deleteProject(projectUuid) {
  const token = cookies.get("token") || "";
  return axios
    .delete(`${API_BASE_URL}/projects/delete/${projectUuid}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

// Authentication API functions
export function login(email, password) {
  return axios
    .post(
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
    )
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function signup(userData) {
  return axios
    .post(`${API_BASE_URL}/users/signup/`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function requestPasswordReset(email) {
  return axios
    .post(
      `${API_BASE_URL}/users/password-reset/`,
      {
        email,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function confirmPasswordReset(
  uid,
  token,
  newPassword,
  newPasswordConfirm
) {
  return axios
    .post(
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
    )
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

// ==================== Admin Prefecture APIs ====================
export function getAllPrefectures() {
  const token = cookies.get("token") || "";
  return axios
    .get(`${API_BASE_URL}/prefectures/admin/all/`, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function createPrefecture(data) {
  const token = cookies.get("token") || "";
  return axios
    .post(`${API_BASE_URL}/prefectures/`, data, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function updatePrefecture(prefectureId, data) {
  const token = cookies.get("token") || "";
  return axios
    .put(`${API_BASE_URL}/prefectures/${prefectureId}/`, data, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function deletePrefecture(prefectureId) {
  const token = cookies.get("token") || "";
  return axios
    .delete(`${API_BASE_URL}/prefectures/${prefectureId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

// ==================== Admin Material APIs ====================
export function getMaterialCategories() {
  const token = cookies.get("token") || "";
  return axios
    .get(`${API_BASE_URL}/materials/categories/list/`, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function getAllMaterials() {
  const token = cookies.get("token") || "";
  return axios
    .get(`${API_BASE_URL}/materials/admin/all/`, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function createMaterial(data) {
  const token = cookies.get("token") || "";
  return axios
    .post(`${API_BASE_URL}/materials/`, data, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function updateMaterial(materialId, data) {
  const token = cookies.get("token") || "";
  return axios
    .put(`${API_BASE_URL}/materials/${materialId}/`, data, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function deleteMaterial(materialId) {
  const token = cookies.get("token") || "";
  return axios
    .delete(`${API_BASE_URL}/materials/${materialId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

// ==================== Admin Numeric Values APIs ====================
export function getNumericValues() {
  const token = cookies.get("token") || "";
  return axios
    .get(`${API_BASE_URL}/numeric_values/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function updateNumericValue(valueId, value) {
  const token = cookies.get("token") || "";
  return axios
    .patch(
      `${API_BASE_URL}/numeric_values/${valueId}/`,
      {
        value: value,
      },
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
      throw error;
    });
}

// ==================== User Profile APIs ====================
export function getUserProfile() {
  const token = cookies.get("token") || "";
  return axios
    .get(`${API_BASE_URL}/users/me/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function updateUserProfile(data) {
  const token = cookies.get("token") || "";
  return axios
    .patch(`${API_BASE_URL}/users/me/`, data, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function changePassword(currentPassword, newPassword, confirmPassword) {
  const token = cookies.get("token") || "";
  return axios
    .post(
      `${API_BASE_URL}/users/change-password/`,
      {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      },
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
      throw error;
    });
}

export function getPendingProjectsPercentage() {
  const token = cookies.get("token") || "";
  return axios
    .get(`${API_BASE_URL}/projects/pending-percentage/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}

export function getProjects() {
  const token = cookies.get("token") || "";
  return axios
    .get(`${API_BASE_URL}/projects/get/`, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
}
