import React, { useState, useEffect } from "react";
import $ from "jquery";
import Cookies from "universal-cookie";
import {
  Button,
  Card,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Grid,
  TextField,
  Alert,
  CardContent,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SolarPowerIcon from "@mui/icons-material/SolarPower";
import SaveIcon from "@mui/icons-material/Save";
import ConfirmationDialog from "../dialogs/ConfirmationDialog";
import { useLanguage } from "../../context/LanguageContext";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`photovoltaic-tabpanel-${index}`}
      aria-labelledby={`photovoltaic-tab-${index}`}
      {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PhotovoltaicSystemTabContent = ({
  buildingUuid,
  projectUuid,
  buildingData,
  params,
}) => {
  const cookies = new Cookies(null, { path: "/" });
  const token = cookies.get("token");

  const { language } = useLanguage();
  const translations =
    language === "en"
      ? english_text.PhotovoltaicSystemTabContent || {}
      : greek_text.PhotovoltaicSystemTabContent || {};

  // Debug logging
  useEffect(() => {
    console.log("PhotovoltaicSystemTabContent props:", {
      buildingUuid,
      projectUuid,
      buildingData: !!buildingData,
      params: !!params,
    });
  }, [buildingUuid, projectUuid, buildingData, params]);

  // State management
  const [currentPhotovoltaicSystem, setCurrentPhotovoltaicSystem] =
    useState(null);
  const [photovoltaicSystem, setPhotovoltaicSystem] = useState({
    building: buildingUuid,
    project: projectUuid,
    // Installation fields
    pv_panels_quantity: "",
    pv_panels_unit_price: "",
    metal_bases_quantity: "",
    metal_bases_unit_price: "",
    piping_quantity: "",
    piping_unit_price: "",
    wiring_quantity: "",
    wiring_unit_price: "",
    inverter_quantity: "",
    inverter_unit_price: "",
    installation_quantity: "",
    installation_unit_price: "",
    // Economic fields
    total_cost: "",
    unexpected_expenses: "",
    value_after_unexpected: "",
    tax_24: "",
    total_project_cost: "",
    subsidy_amount: "",
    net_cost: "",
    payback_period: "",
    annual_savings: "",
    investment_return: "",
    // Energy fields
    power_per_panel: "",
    collector_efficiency: "",
    installation_angle: "",
    pv_usage: "electricity",
    pv_system_type: "grid_connected",
    annual_energy_production: "",
    carbon_footprint_reduction: "",
  });

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSystem, setDeletingSystem] = useState(null);

  // Functions for data fetching and manipulation
  useEffect(() => {
    if (buildingUuid) {
      fetchOrCreatePhotovoltaicSystem();
    } else {
      // If no buildingUuid, prepare for creating a new system
      setCurrentPhotovoltaicSystem(null);
      setPhotovoltaicSystem({
        building: null,
        project: projectUuid || null,
        // Installation fields
        pv_panels_quantity: "",
        pv_panels_unit_price: "",
        metal_bases_quantity: "",
        metal_bases_unit_price: "",
        piping_quantity: "",
        piping_unit_price: "",
        wiring_quantity: "",
        wiring_unit_price: "",
        inverter_quantity: "",
        inverter_unit_price: "",
        installation_quantity: "",
        installation_unit_price: "",
        // Economic fields
        total_cost: "",
        unexpected_expenses: "",
        value_after_unexpected: "",
        tax_24: "",
        total_project_cost: "",
        // Energy fields
        power_per_panel: "",
        collector_efficiency: "",
        installation_angle: "",
        pv_usage: "electricity",
        pv_system_type: "grid_connected",
        annual_energy_production: "",
        carbon_footprint_reduction: "",
      });
    }
  }, [buildingUuid, projectUuid]);

  const fetchOrCreatePhotovoltaicSystem = () => {
    if (!buildingUuid || !token) {
      console.log("Missing buildingUuid or token:", {
        buildingUuid,
        token: !!token,
      });
      return;
    }

    setLoading(true);

    $.ajax({
      url: `http://127.0.0.1:8000/photovoltaic_systems/building/${buildingUuid}/`,
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
      success: (data) => {
        if (data.data && data.data.length > 0) {
          const existing = data.data[0];
          setCurrentPhotovoltaicSystem(existing);
          setPhotovoltaicSystem(existing);
        } else {
          createNewPhotovoltaicSystem();
        }
        setLoading(false);
      },
      error: (jqXHR) => {
        console.error("Error fetching photovoltaic system:", jqXHR);
        createNewPhotovoltaicSystem();
      },
    });
  };

  const createNewPhotovoltaicSystem = () => {
    if (!buildingUuid || !projectUuid || !token) {
      console.log("Missing required data for creating photovoltaic system:", {
        buildingUuid,
        projectUuid,
        token: !!token,
      });
      setLoading(false);
      return;
    }

    const newData = {
      building: buildingUuid,
      project: projectUuid,
      pv_panels_quantity: 0,
      pv_panels_unit_price: 0,
      metal_bases_quantity: 0,
      metal_bases_unit_price: 0,
      piping_quantity: 0,
      piping_unit_price: 0,
      wiring_quantity: 0,
      wiring_unit_price: 0,
      inverter_quantity: 0,
      inverter_unit_price: 0,
      installation_quantity: 0,
      installation_unit_price: 0,
      total_cost: 0,
      unexpected_expenses: 0,
      value_after_unexpected: 0,
      tax_24: 0,
      total_project_cost: 0,
      subsidy_amount: 0,
      net_cost: 0,
      payback_period: 0,
      annual_savings: 0,
      investment_return: 0,
      power_per_panel: 0,
      collector_efficiency: 0,
      installation_angle: 0,
      pv_usage: "electricity",
      pv_system_type: "grid_connected",
      annual_energy_production: 0,
      carbon_footprint_reduction: 0,
    };
    $.ajax({
      url: "http://127.0.0.1:8000/photovoltaic_systems/",
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(newData),
      success: (data) => {
        setCurrentPhotovoltaicSystem(data);
        setPhotovoltaicSystem(data);
        setLoading(false);
      },
      error: (jqXHR) => {
        console.error("Error creating photovoltaic system:", jqXHR);
        setError(
          translations.errorLoad ||
            "Σφάλμα κατά τη δημιουργία νέου φωτοβολταϊκού συστήματος"
        );
        setLoading(false);
      },
    });
  };

  const handleInputChange = (field, value) => {
    // For price fields, ensure maximum 2 decimal places
    if (field.includes("unit_price")) {
      // Allow empty string for deletion
      if (value === "") {
        setPhotovoltaicSystem((prev) => ({
          ...prev,
          [field]: value,
        }));
        return;
      }

      // Convert to number and limit to 2 decimal places
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        const roundedValue = Math.round(numValue * 100) / 100;
        setPhotovoltaicSystem((prev) => ({
          ...prev,
          [field]: roundedValue.toString(),
        }));
      }
    } else {
      setPhotovoltaicSystem((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSave = () => {
    if (!token) {
      console.log("Missing token for saving");
      setError(
        translations.errorSave ||
          "Δεν είναι δυνατή η αποθήκευση - λείπει το token πιστοποίησης"
      );
      return;
    }

    setLoading(true);

    // Calculate and update economic indicators before saving
    const updatedPhotovoltaicSystem = {
      ...photovoltaicSystem,
      ...calculateEconomicIndicators(),
      // Ensure building is set if buildingUuid exists
      building: buildingUuid || photovoltaicSystem.building,
      project: projectUuid || photovoltaicSystem.project,
    };

    // Determine if this is CREATE or UPDATE
    const isUpdate =
      currentPhotovoltaicSystem && currentPhotovoltaicSystem.uuid;
    const method = isUpdate ? "PUT" : "POST";
    const url = isUpdate
      ? `http://127.0.0.1:8000/photovoltaic_systems/${currentPhotovoltaicSystem.uuid}/`
      : "http://127.0.0.1:8000/photovoltaic_systems/";

    console.log(`${isUpdate ? "Updating" : "Creating"} photovoltaic system:`, {
      method,
      url,
      data: updatedPhotovoltaicSystem,
    });

    $.ajax({
      url: url,
      method: method,
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(updatedPhotovoltaicSystem),
      success: (data) => {
        console.log(
          `Photovoltaic system ${
            isUpdate ? "updated" : "created"
          } successfully:`,
          data
        );
        setCurrentPhotovoltaicSystem(data);
        setPhotovoltaicSystem(data);
        setSuccess(
          isUpdate
            ? translations.updateSuccess ||
                "Το φωτοβολταϊκό σύστημα ενημερώθηκε επιτυχώς!"
            : translations.createSuccess ||
                "Το φωτοβολταϊκό σύστημα δημιουργήθηκε επιτυχώς!"
        );
        setLoading(false);
      },
      error: (jqXHR) => {
        console.error(
          `Error ${isUpdate ? "updating" : "creating"} photovoltaic system:`,
          jqXHR
        );
        setError(
          jqXHR.responseJSON?.detail ||
            translations.errorSave ||
            `Σφάλμα κατά την ${isUpdate ? "ενημέρωση" : "δημιουργία"}`
        );
        setLoading(false);
      },
    });
  };

  // Calculate economic indicators automatically
  const calculateEconomicIndicators = () => {
    // Calculate total cost from installation data
    const totalCost =
      (parseFloat(photovoltaicSystem.pv_panels_quantity) || 0) *
        (parseFloat(photovoltaicSystem.pv_panels_unit_price) || 0) +
      (parseFloat(photovoltaicSystem.metal_bases_quantity) || 0) *
        (parseFloat(photovoltaicSystem.metal_bases_unit_price) || 0) +
      (parseFloat(photovoltaicSystem.piping_quantity) || 0) *
        (parseFloat(photovoltaicSystem.piping_unit_price) || 0) +
      (parseFloat(photovoltaicSystem.wiring_quantity) || 0) *
        (parseFloat(photovoltaicSystem.wiring_unit_price) || 0) +
      (parseFloat(photovoltaicSystem.inverter_quantity) || 0) *
        (parseFloat(photovoltaicSystem.inverter_unit_price) || 0) +
      (parseFloat(photovoltaicSystem.installation_quantity) || 0) *
        (parseFloat(photovoltaicSystem.installation_unit_price) || 0);

    // Calculate unexpected expenses (9% of total cost)
    const unexpectedExpenses = totalCost * 0.09;

    // Calculate value after unexpected expenses
    const valueAfterUnexpected = totalCost + unexpectedExpenses;

    // Calculate tax (24% of value after unexpected expenses)
    const tax24 = valueAfterUnexpected * 0.24;

    // Calculate total project cost
    const totalProjectCost = valueAfterUnexpected + tax24;

    return {
      total_cost: totalCost,
      unexpected_expenses: unexpectedExpenses,
      value_after_unexpected: valueAfterUnexpected,
      tax_24: tax24,
      total_project_cost: totalProjectCost,
    };
  };

  // Update economic indicators when installation data changes
  useEffect(() => {
    const economicData = calculateEconomicIndicators();
    setPhotovoltaicSystem((prev) => ({
      ...prev,
      ...economicData,
    }));
  }, [
    photovoltaicSystem.pv_panels_quantity,
    photovoltaicSystem.pv_panels_unit_price,
    photovoltaicSystem.metal_bases_quantity,
    photovoltaicSystem.metal_bases_unit_price,
    photovoltaicSystem.piping_quantity,
    photovoltaicSystem.piping_unit_price,
    photovoltaicSystem.wiring_quantity,
    photovoltaicSystem.wiring_unit_price,
    photovoltaicSystem.inverter_quantity,
    photovoltaicSystem.inverter_unit_price,
    photovoltaicSystem.installation_quantity,
    photovoltaicSystem.installation_unit_price,
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-600">
            {translations.loading || "Φόρτωση..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="bg-primary/10 p-2 rounded-full mr-3">
              <SolarPowerIcon className="w-6 h-6 text-primary" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {translations.title || "Φωτοβολταϊκά Συστήματα"}
              </h2>
              <p className="text-gray-600 mt-1">
                {translations.description ||
                  "Διαχείριση εγκατάστασης και διαμόρφωσης φωτοβολταϊκού συστήματος"}
              </p>
            </div>
          </div>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={loading}
            sx={{
              backgroundColor: "var(--color-primary)",
              "&:hover": {
                backgroundColor: "var(--color-primary-dark)",
              },
            }}>
            {translations.save || "Αποθήκευση"}
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess(null)}
          sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md">
        <Tabs
          value={tabValue}
          onChange={(event, newValue) => setTabValue(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            px: 3,
            pt: 2,
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
            },
            "& .Mui-selected": {
              color: "var(--color-primary) !important",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "var(--color-primary)",
            },
          }}>
          <Tab
            label={translations.installationTab || "Εγκατάσταση Φ/Β Συστήματος"}
          />
          <Tab
            label={translations.economicIndicatorsTab || "Οικονομικοί Δείκτες"}
          />
          <Tab
            label={translations.energyIndicatorsTab || "Ενεργειακοί Δείκτες"}
          />
        </Tabs>

        {/* Tab 1: Installation */}
        <TabPanel value={tabValue} index={0}>
          <div className="space-y-4">
            <Typography variant="h6" gutterBottom>
              {translations.sections?.installation ||
                "Εγκατάσταση Φωτοβολταϊκού Συστήματος"}
            </Typography>

            {/* Installation Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-primary-light rounded-lg">
                <thead className="bg-primary-light/20">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-primary border-b">
                      {translations.table?.category || "Κατηγορία"}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-primary border-b">
                      {translations.table?.quantity || "Ποσότητα"}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-primary border-b">
                      {translations.table?.unit || "Μονάδα"}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-primary border-b">
                      {translations.table?.unitPrice || "Τιμή Μονάδας (€)"}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-primary border-b">
                      {translations.table?.totalCost || "Συνολικό Κόστος (€)"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* Φωτοβολταϊκά Πλαίσια */}
                  <tr className="hover:bg-primary-light/10">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {translations.installation?.pvPanels ||
                        "Φωτοβολταϊκά Πλαίσια"}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={photovoltaicSystem.pv_panels_quantity}
                        onChange={(e) =>
                          handleInputChange(
                            "pv_panels_quantity",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-primary-light"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {translations.units?.pieces || "τεμάχια"}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={photovoltaicSystem.pv_panels_unit_price}
                        onChange={(e) =>
                          handleInputChange(
                            "pv_panels_unit_price",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-primary-light"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {photovoltaicSystem.pv_panels_quantity &&
                      photovoltaicSystem.pv_panels_unit_price
                        ? (
                            parseFloat(photovoltaicSystem.pv_panels_quantity) *
                            parseFloat(photovoltaicSystem.pv_panels_unit_price)
                          ).toFixed(2)
                        : "0.00"}
                    </td>
                  </tr>

                  {/* Μεταλλικές Βάσεις Στήριξης */}
                  <tr className="hover:bg-primary-light/10">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {translations.installation?.metalBases ||
                        "Μεταλλικές Βάσεις Στήριξης"}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={photovoltaicSystem.metal_bases_quantity}
                        onChange={(e) =>
                          handleInputChange(
                            "metal_bases_quantity",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-primary-light"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {translations.units?.pieces || "τεμάχια"}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={photovoltaicSystem.metal_bases_unit_price}
                        onChange={(e) =>
                          handleInputChange(
                            "metal_bases_unit_price",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-primary-light"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {photovoltaicSystem.metal_bases_quantity &&
                      photovoltaicSystem.metal_bases_unit_price
                        ? (
                            parseFloat(
                              photovoltaicSystem.metal_bases_quantity
                            ) *
                            parseFloat(
                              photovoltaicSystem.metal_bases_unit_price
                            )
                          ).toFixed(2)
                        : "0.00"}
                    </td>
                  </tr>

                  {/* Σωληνώσεις */}
                  <tr className="hover:bg-primary-light/10">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {translations.installation?.piping || "Σωληνώσεις"}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={photovoltaicSystem.piping_quantity}
                        onChange={(e) =>
                          handleInputChange("piping_quantity", e.target.value)
                        }
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-primary-light"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {translations.units?.meters || "μέτρα"}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={photovoltaicSystem.piping_unit_price}
                        onChange={(e) =>
                          handleInputChange("piping_unit_price", e.target.value)
                        }
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-primary-light"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {photovoltaicSystem.piping_quantity &&
                      photovoltaicSystem.piping_unit_price
                        ? (
                            parseFloat(photovoltaicSystem.piping_quantity) *
                            parseFloat(photovoltaicSystem.piping_unit_price)
                          ).toFixed(2)
                        : "0.00"}
                    </td>
                  </tr>

                  {/* Καλωδιώσεις */}
                  <tr className="hover:bg-primary-light/10">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {translations.installation?.wiring || "Καλωδιώσεις"}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={photovoltaicSystem.wiring_quantity}
                        onChange={(e) =>
                          handleInputChange("wiring_quantity", e.target.value)
                        }
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-primary-light"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {translations.units?.meters || "μέτρα"}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={photovoltaicSystem.wiring_unit_price}
                        onChange={(e) =>
                          handleInputChange("wiring_unit_price", e.target.value)
                        }
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-primary-light"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {photovoltaicSystem.wiring_quantity &&
                      photovoltaicSystem.wiring_unit_price
                        ? (
                            parseFloat(photovoltaicSystem.wiring_quantity) *
                            parseFloat(photovoltaicSystem.wiring_unit_price)
                          ).toFixed(2)
                        : "0.00"}
                    </td>
                  </tr>

                  {/* Αντιστροφέας */}
                  <tr className="hover:bg-primary-light/10">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {translations.installation?.inverter || "Αντιστροφέας"}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={photovoltaicSystem.inverter_quantity}
                        onChange={(e) =>
                          handleInputChange("inverter_quantity", e.target.value)
                        }
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-primary-light"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {translations.units?.pieces || "τεμάχια"}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={photovoltaicSystem.inverter_unit_price}
                        onChange={(e) =>
                          handleInputChange(
                            "inverter_unit_price",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-primary-light"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {photovoltaicSystem.inverter_quantity &&
                      photovoltaicSystem.inverter_unit_price
                        ? (
                            parseFloat(photovoltaicSystem.inverter_quantity) *
                            parseFloat(photovoltaicSystem.inverter_unit_price)
                          ).toFixed(2)
                        : "0.00"}
                    </td>
                  </tr>

                  {/* Εγκατάσταση */}
                  <tr className="hover:bg-primary-light/10">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {translations.installation?.installation || "Εγκατάσταση"}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={photovoltaicSystem.installation_quantity}
                        onChange={(e) =>
                          handleInputChange(
                            "installation_quantity",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-primary-light"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {translations.units?.hours || "ώρες"}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={photovoltaicSystem.installation_unit_price}
                        onChange={(e) =>
                          handleInputChange(
                            "installation_unit_price",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-primary-light"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {photovoltaicSystem.installation_quantity &&
                      photovoltaicSystem.installation_unit_price
                        ? (
                            parseFloat(
                              photovoltaicSystem.installation_quantity
                            ) *
                            parseFloat(
                              photovoltaicSystem.installation_unit_price
                            )
                          ).toFixed(2)
                        : "0.00"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </TabPanel>

        {/* Tab 2: Economic Indicators */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            {translations.sections?.economicIndicators || "Οικονομικοί Δείκτες"}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={`${
                  translations.fields?.totalCost || "Συνολικό κόστος (€)"
                } - ${translations.autoCalculated || "Αυτόματος Υπολογισμός"}`}
                type="text"
                value={
                  photovoltaicSystem.total_cost?.toLocaleString("el-GR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || "0.00"
                }
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiInputBase-input": {
                    color: "var(--color-primary)",
                    fontWeight: "bold",
                  },
                  "& .MuiInputLabel-root": {
                    color: "var(--color-primary)",
                    "&.Mui-focused": {
                      color: "var(--color-primary)",
                    },
                  },
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--color-primary)",
                    },
                  },
                }}
                helperText={
                  translations.autoCalculatedCost ||
                  "Υπολογίζεται αυτόματα από το άθροισμα των κοστών εγκατάστασης"
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={`${
                  translations.fields?.unexpectedExpenses ||
                  "Απρόβλεπτα έξοδα (€)"
                } - ${translations.autoCalculated || "Αυτόματος Υπολογισμός"}`}
                type="text"
                value={
                  photovoltaicSystem.unexpected_expenses?.toLocaleString(
                    "el-GR",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  ) || "0.00"
                }
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiInputBase-input": {
                    color: "var(--color-primary)",
                    fontWeight: "bold",
                  },
                  "& .MuiInputLabel-root": {
                    color: "var(--color-primary)",
                    "&.Mui-focused": {
                      color: "var(--color-primary)",
                    },
                  },
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--color-primary)",
                    },
                  },
                }}
                helperText={
                  translations.unexpectedExpensesHelp ||
                  "9% του συνολικού κόστους"
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={`${
                  translations.fields?.valueAfterUnexpected ||
                  "Αξία μετά απρόβλεπτα (€)"
                } - ${translations.autoCalculated || "Αυτόματος Υπολογισμός"}`}
                type="text"
                value={
                  photovoltaicSystem.value_after_unexpected?.toLocaleString(
                    "el-GR",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  ) || "0.00"
                }
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiInputBase-input": {
                    color: "var(--color-primary)",
                    fontWeight: "bold",
                  },
                  "& .MuiInputLabel-root": {
                    color: "var(--color-primary)",
                    "&.Mui-focused": {
                      color: "var(--color-primary)",
                    },
                  },
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--color-primary)",
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={`${translations.fields?.tax24 || "ΦΠΑ 24% (€)"} - ${
                  translations.autoCalculated || "Αυτόματος Υπολογισμός"
                }`}
                type="text"
                value={
                  photovoltaicSystem.tax_24?.toLocaleString("el-GR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || "0.00"
                }
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiInputBase-input": {
                    color: "var(--color-primary)",
                    fontWeight: "bold",
                  },
                  "& .MuiInputLabel-root": {
                    color: "var(--color-primary)",
                    "&.Mui-focused": {
                      color: "var(--color-primary)",
                    },
                  },
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--color-primary)",
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={`${
                  translations.fields?.totalProjectCost ||
                  "Συνολικό κόστος έργου (€)"
                } - ${translations.autoCalculated || "Αυτόματος Υπολογισμός"}`}
                type="text"
                value={
                  photovoltaicSystem.total_project_cost?.toLocaleString(
                    "el-GR",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  ) || "0.00"
                }
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiInputBase-input": {
                    color: "var(--color-primary)",
                    fontWeight: "bold",
                  },
                  "& .MuiInputLabel-root": {
                    color: "var(--color-primary)",
                    "&.Mui-focused": {
                      color: "var(--color-primary)",
                    },
                  },
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--color-primary)",
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 3: Energy Indicators */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            {translations.sections?.energyIndicators || "Ενεργειακοί Δείκτες"}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={
                  translations.fields?.powerPerPanel || "Ισχύς ανά πάνελ (W)"
                }
                type="number"
                value={photovoltaicSystem.power_per_panel || ""}
                onChange={(e) =>
                  handleInputChange("power_per_panel", e.target.value)
                }
                inputProps={{ step: 1, min: 0 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--color-primary)",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    "&.Mui-focused": {
                      color: "var(--color-primary)",
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={
                  translations.fields?.collectorEfficiency ||
                  "Απόδοση συλλέκτη (%)"
                }
                type="number"
                value={photovoltaicSystem.collector_efficiency || ""}
                onChange={(e) =>
                  handleInputChange("collector_efficiency", e.target.value)
                }
                inputProps={{ step: 0.1, min: 0, max: 100 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--color-primary)",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    "&.Mui-focused": {
                      color: "var(--color-primary)",
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={
                  translations.fields?.installationAngle ||
                  "Γωνία εγκατάστασης (°)"
                }
                type="number"
                value={photovoltaicSystem.installation_angle || ""}
                onChange={(e) =>
                  handleInputChange("installation_angle", e.target.value)
                }
                inputProps={{ step: 1, min: 0, max: 90 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--color-primary)",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    "&.Mui-focused": {
                      color: "var(--color-primary)",
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label={translations.fields?.pvUsage || "Χρήση Φ/Β"}
                value={photovoltaicSystem.pv_usage || "electricity"}
                onChange={(e) => handleInputChange("pv_usage", e.target.value)}
                SelectProps={{ native: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--color-primary)",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    "&.Mui-focused": {
                      color: "var(--color-primary)",
                    },
                  },
                }}>
                <option value="electricity">
                  {translations.pvUsage?.electricity || "Ηλεκτρική Ενέργεια"}
                </option>
                <option value="hot_water">
                  {translations.pvUsage?.hotWater || "Ζεστό Νερό"}
                </option>
                <option value="both">
                  {translations.pvUsage?.both || "Και τα δύο"}
                </option>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label={
                  translations.fields?.pvSystemType || "Τύπος συστήματος Φ/Β"
                }
                value={photovoltaicSystem.pv_system_type || "grid_connected"}
                onChange={(e) =>
                  handleInputChange("pv_system_type", e.target.value)
                }
                SelectProps={{ native: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--color-primary)",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    "&.Mui-focused": {
                      color: "var(--color-primary)",
                    },
                  },
                }}>
                <option value="grid_connected">
                  {translations.pvSystemType?.gridConnected || "Διασυνδεδεμένο"}
                </option>
                <option value="standalone">
                  {translations.pvSystemType?.standalone || "Αυτόνομο"}
                </option>
                <option value="hybrid">
                  {translations.pvSystemType?.hybrid || "Υβριδικό"}
                </option>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={
                  translations.fields?.annualEnergyProduction ||
                  "Ετήσια παραγωγή ενέργειας (kWh)"
                }
                type="number"
                value={photovoltaicSystem.annual_energy_production || ""}
                onChange={(e) =>
                  handleInputChange("annual_energy_production", e.target.value)
                }
                inputProps={{ step: 1, min: 0 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--color-primary)",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    "&.Mui-focused": {
                      color: "var(--color-primary)",
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={
                  translations.fields?.carbonFootprintReduction ||
                  "Μείωση αποτυπώματος άνθρακα (kg CO2/έτος)"
                }
                type="number"
                value={photovoltaicSystem.carbon_footprint_reduction || ""}
                onChange={(e) =>
                  handleInputChange(
                    "carbon_footprint_reduction",
                    e.target.value
                  )
                }
                inputProps={{ step: 0.1, min: 0 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--color-primary)",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    "&.Mui-focused": {
                      color: "var(--color-primary)",
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </TabPanel>
      </div>
    </div>
  );
};

export default PhotovoltaicSystemTabContent;
