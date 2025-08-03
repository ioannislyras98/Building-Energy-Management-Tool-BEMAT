/**
 * Activity Logger Helper
 * Provides utility functions to automatically log building activities
 */

import $ from "jquery";
import Cookies from "universal-cookie";

const cookies = new Cookies();

class ActivityLogger {
  constructor() {
    this.token = cookies.get("token") || "";
    this.baseUrl = "http://127.0.0.1:8000/building-activities/log/";
  }

  /**
   * Log a building activity
   * @param {Object} params - Activity parameters
   * @param {string} params.building - Building UUID
   * @param {string} params.project - Project UUID
   * @param {string} params.action_type - Type of action (create, update, delete, etc.)
   * @param {string} params.title - Short title describing the activity
   * @param {string} params.description - Detailed description (optional)
   * @param {Object} params.extra_data - Additional data (optional)
   */
  async logActivity(params) {
    try {
      const response = await $.ajax({
        url: this.baseUrl,
        method: "POST",
        headers: {
          "Authorization": `Token ${this.token}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify(params),
      });
      
      console.log("Activity logged successfully:", response);
      return response;
    } catch (error) {
      console.error("Error logging activity:", error);
      // Don't throw error to avoid breaking the main functionality
      return null;
    }
  }

  /**
   * Log contact creation/update
   */
  logContactActivity(building, project, action, contactData) {
    return this.logActivity({
      building,
      project,
      action_type: "contact",
      title: action === "create" 
        ? `Νέα επαφή: ${contactData.name}` 
        : `Ενημέρωση επαφής: ${contactData.name}`,
      description: `${action === "create" ? "Δημιουργήθηκε" : "Ενημερώθηκε"} επαφή με email: ${contactData.email}`,
      extra_data: {
        contact_name: contactData.name,
        contact_email: contactData.email,
        action: action
      }
    });
  }

  /**
   * Log image upload/update/delete
   */
  logImageActivity(building, project, action, imageData) {
    const actionMap = {
      create: "Νέα εικόνα",
      update: "Ενημέρωση εικόνας", 
      delete: "Διαγραφή εικόνας"
    };

    return this.logActivity({
      building,
      project,
      action_type: "image",
      title: `${actionMap[action]}: ${imageData.title}`,
      description: `${actionMap[action]} στην κατηγορία: ${imageData.category}`,
      extra_data: {
        image_title: imageData.title,
        image_category: imageData.category,
        action: action
      }
    });
  }

  /**
   * Log system creation/update/delete
   */
  logSystemActivity(building, project, action, systemType, systemData) {
    const actionMap = {
      create: "Νέο σύστημα",
      update: "Ενημέρωση συστήματος",
      delete: "Διαγραφή συστήματος"
    };

    return this.logActivity({
      building,
      project,
      action_type: "system",
      title: `${actionMap[action]}: ${systemType}`,
      description: `${actionMap[action]} τύπου ${systemType}`,
      extra_data: {
        system_type: systemType,
        system_data: systemData,
        action: action
      }
    });
  }

  /**
   * Log energy data creation/update
   */
  logEnergyActivity(building, project, action, energyData) {
    return this.logActivity({
      building,
      project,
      action_type: "energy",
      title: action === "create" 
        ? "Νέα ενεργειακά δεδομένα" 
        : "Ενημέρωση ενεργειακών δεδομένων",
      description: `${action === "create" ? "Προστέθηκαν" : "Ενημερώθηκαν"} ενεργειακά δεδομένα`,
      extra_data: {
        energy_data: energyData,
        action: action
      }
    });
  }

  /**
   * Log calculation performed
   */
  logCalculationActivity(building, project, calculationType, results) {
    return this.logActivity({
      building,
      project,
      action_type: "calculation",
      title: `Υπολογισμός: ${calculationType}`,
      description: `Εκτελέστηκε υπολογισμός τύπου ${calculationType}`,
      extra_data: {
        calculation_type: calculationType,
        results: results
      }
    });
  }

  /**
   * Log data export
   */
  logExportActivity(building, project, exportType, format) {
    return this.logActivity({
      building,
      project,
      action_type: "export",
      title: `Εξαγωγή δεδομένων: ${exportType}`,
      description: `Εξήχθησαν δεδομένα τύπου ${exportType} σε μορφή ${format}`,
      extra_data: {
        export_type: exportType,
        format: format
      }
    });
  }

  /**
   * Log data import
   */
  logImportActivity(building, project, importType, fileName) {
    return this.logActivity({
      building,
      project,
      action_type: "import",
      title: `Εισαγωγή δεδομένων: ${importType}`,
      description: `Εισήχθησαν δεδομένα από αρχείο: ${fileName}`,
      extra_data: {
        import_type: importType,
        file_name: fileName
      }
    });
  }

  /**
   * Log material creation/update
   */
  logMaterialActivity(building, project, action, materialData) {
    return this.logActivity({
      building,
      project,
      action_type: "material",
      title: action === "create" 
        ? `Νέο υλικό: ${materialData.name}` 
        : `Ενημέρωση υλικού: ${materialData.name}`,
      description: `${action === "create" ? "Προστέθηκε" : "Ενημερώθηκε"} υλικό`,
      extra_data: {
        material_name: materialData.name,
        material_type: materialData.type,
        action: action
      }
    });
  }

  /**
   * Log building update
   */
  logBuildingUpdate(building, project, updatedFields) {
    return this.logActivity({
      building,
      project,
      action_type: "update",
      title: "Ενημέρωση κτιρίου",
      description: `Ενημερώθηκαν τα πεδία: ${updatedFields.join(", ")}`,
      extra_data: {
        updated_fields: updatedFields
      }
    });
  }

  /**
   * Log generic activity
   */
  logGenericActivity(building, project, action_type, title, description, extra_data = {}) {
    return this.logActivity({
      building,
      project,
      action_type,
      title,
      description,
      extra_data
    });
  }
}

// Create singleton instance
const activityLogger = new ActivityLogger();

export default activityLogger;
