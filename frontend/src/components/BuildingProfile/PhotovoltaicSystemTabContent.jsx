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
import API_BASE_URL from "../../config/api.js";

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

  const [currentPhotovoltaicSystem, setCurrentPhotovoltaicSystem] =
    useState(null);
  const [hasBackendData, setHasBackendData] = useState(false);
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
    estimated_cost: "",
    total_cost: "",
    unexpected_expenses: "",
    value_after_unexpected: "",
    tax_burden: "",
    total_project_cost: "",
    subsidy_amount: "",
    net_cost: "",
    net_present_value: "",
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

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSystem, setDeletingSystem] = useState(null);

  useEffect(() => {
    if (buildingUuid) {
      fetchOrCreatePhotovoltaicSystem();
    } else {
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
        estimated_cost: "",
        total_cost: "",
        unexpected_expenses: "",
        value_after_unexpected: "",
        tax_burden: "",
        total_project_cost: "",
        subsidy_amount: "",
        net_cost: "",
        net_present_value: "",
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
    }
  }, [buildingUuid, projectUuid]);

  const fetchOrCreatePhotovoltaicSystem = () => {
    if (!buildingUuid || !token) {return;
    }

    setLoading(true);

    $.ajax({
      url: `${API_BASE_URL}/photovoltaic_systems/building/${buildingUuid}/`,
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
      success: (data) => {

        if (data && data.length > 0) {
          const existing = data[0];

          setCurrentPhotovoltaicSystem(existing);
          setPhotovoltaicSystem(existing);
          setHasBackendData(true); // Mark that we have backend data
        } else {// No existing system found - set up for creating a new one
          setCurrentPhotovoltaicSystem(null);
          setHasBackendData(false); // No backend data for new system
          setPhotovoltaicSystem({
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
            estimated_cost: "",
            total_cost: "",
            unexpected_expenses: "",
            value_after_unexpected: "",
            tax_burden: "",
            total_project_cost: "",
            subsidy_amount: "",
            net_cost: "",
            net_present_value: "",
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
        }
        setLoading(false);
      },
      error: (jqXHR) => {

        // On error, set up for creating a new system
        setCurrentPhotovoltaicSystem(null);
        setHasBackendData(false); // No backend data on error
        setPhotovoltaicSystem({
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
          estimated_cost: "",
          total_cost: "",
          unexpected_expenses: "",
          value_after_unexpected: "",
          tax_burden: "",
          total_project_cost: "",
          subsidy_amount: "",
          net_cost: "",
          net_present_value: "",
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

    // Reset backend data flag when user manually changes input
    // This allows frontend calculations to take effect again
    if (hasBackendData) {
      setHasBackendData(false);
    }
  };

  const handleSave = () => {
    if (!token) {

      setError(
        translations.errorSave ||
          "Δεν είναι δυνατή η αποθήκευση - λείπει το token πιστοποίησης"
      );
      return;
    }

    setLoading(true);

    const updatedPhotovoltaicSystem = {
      ...photovoltaicSystem,
      ...calculateEconomicIndicators(),
      building: buildingUuid || photovoltaicSystem.building,
      project: projectUuid || photovoltaicSystem.project,
    };

    // Determine if this is CREATE or UPDATE
    const isUpdate =
      currentPhotovoltaicSystem && currentPhotovoltaicSystem.uuid;
    const method = isUpdate ? "PUT" : "POST";
    const url = isUpdate
      ? `${API_BASE_URL}/photovoltaic_systems/${currentPhotovoltaicSystem.uuid}/`
      : `${API_BASE_URL}/photovoltaic_systems/`;$.ajax({
      url: url,
      method: method,
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify(updatedPhotovoltaicSystem),
      success: (data) => {// Backend now returns full data with calculated fields, no need for additional GET requestsetPhotovoltaicSystem(data);
        setCurrentPhotovoltaicSystem(data);
        setHasBackendData(true); // Mark that we have backend data

        setSuccess(
          isUpdate
            ? translations.successSave ||
                "Το φωτοβολταϊκό σύστημα ενημερώθηκε επιτυχώς!"
            : translations.successSave ||
                "Το φωτοβολταϊκό σύστημα δημιουργήθηκε επιτυχώς!"
        );
        setLoading(false);
      },
      error: (jqXHR) => {
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
    // Calculate individual costs
    const pvPanelsCost =
      (parseFloat(photovoltaicSystem.pv_panels_quantity) || 0) *
      (parseFloat(photovoltaicSystem.pv_panels_unit_price) || 0);
    const metalBasesCost =
      (parseFloat(photovoltaicSystem.metal_bases_quantity) || 0) *
      (parseFloat(photovoltaicSystem.metal_bases_unit_price) || 0);
    const pipingCost =
      (parseFloat(photovoltaicSystem.piping_quantity) || 0) *
      (parseFloat(photovoltaicSystem.piping_unit_price) || 0);
    const wiringCost =
      (parseFloat(photovoltaicSystem.wiring_quantity) || 0) *
      (parseFloat(photovoltaicSystem.wiring_unit_price) || 0);
    const inverterCost =
      (parseFloat(photovoltaicSystem.inverter_quantity) || 0) *
      (parseFloat(photovoltaicSystem.inverter_unit_price) || 0);
    const installationCost =
      (parseFloat(photovoltaicSystem.installation_quantity) || 0) *
      (parseFloat(photovoltaicSystem.installation_unit_price) || 0);

    // Calculate total cost from installation data
    const totalCost =
      pvPanelsCost +
      metalBasesCost +
      pipingCost +
      wiringCost +
      inverterCost +
      installationCost;

    // Calculate unexpected expenses (9% of total cost)
    const unexpectedExpenses = totalCost * 0.09;

    // Calculate value after unexpected expenses
    const valueAfterUnexpected = totalCost + unexpectedExpenses;

    // Calculate tax (24% of value after unexpected expenses)
    const taxBurden = valueAfterUnexpected * 0.24;

    // Calculate total project cost
    const totalProjectCost = valueAfterUnexpected + taxBurden;

    return {
      // Individual equipment costs
      pv_panels_cost: pvPanelsCost,
      metal_bases_cost: metalBasesCost,
      piping_cost: pipingCost,
      wiring_cost: wiringCost,
      inverter_cost: inverterCost,
      installation_cost: installationCost,
      // Economic indicators
      estimated_cost: totalCost, // Αυτό είναι το αρχικό κόστος εξοπλισμού
      unexpected_expenses: unexpectedExpenses,
      value_after_unexpected: valueAfterUnexpected,
      tax_burden: taxBurden,
      total_cost: totalProjectCost, // Αυτό είναι το συνολικό κόστος με ΦΠΑ
    };
  };

  // Update economic indicators when installation data changes
  useEffect(() => {
    // Only recalculate if we don't have backend-calculated data
    if (!hasBackendData) {
      const economicData = calculateEconomicIndicators();
      setPhotovoltaicSystem((prev) => ({
        ...prev,
        ...economicData,
      }));
    }
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
    hasBackendData, // Include hasBackendData to re-evaluate when it changes
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
                {translations.subtitle ||
                  "Ανάλυση και υπολογισμός οφελών από την εγκατάσταση φωτοβολταϊκού συστήματος"}
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
            label={translations.energyIndicatorsTab || "Ενεργειακοί Δείκτες"}
          />
          <Tab
            label={translations.economicIndicatorsTab || "Οικονομικοί Δείκτες"}
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

        {/* Tab 3: Economic Indicators */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            {translations.sections?.economicIndicators || "Οικονομικοί Δείκτες"}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={`${
                  translations.fields?.estimatedCost || "Κόστος εξοπλισμού (€)"
                } - ${translations.autoCalculated || "Αυτόματος Υπολογισμός"}`}
                type="text"
                value={
                  photovoltaicSystem.estimated_cost?.toLocaleString("el-GR", {
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
                  translations.autoCalculatedUnexpected ||
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
                label={`${translations.fields?.taxBurden || "ΦΠΑ 24% (€)"} - ${
                  translations.autoCalculated || "Αυτόματος Υπολογισμός"
                }`}
                type="text"
                value={
                  photovoltaicSystem.tax_burden?.toLocaleString("el-GR", {
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
                  translations.fields?.totalCost || "Συνολικό κόστος έργου (€)"
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
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={`${
                  translations.fields?.subsidyAmount || "Ποσό επιδότησης (€)"
                }`}
                type="number"
                value={photovoltaicSystem.subsidy_amount || ""}
                onChange={(e) =>
                  handleInputChange("subsidy_amount", e.target.value)
                }
                inputProps={{ step: 0.01, min: 0 }}
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
                label={translations.fields?.netCost || "Καθαρό κόστος (€)"}
                type="number"
                value={photovoltaicSystem.net_cost || 0}
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiInputBase-input": {
                    color: "var(--color-primary)",
                    fontWeight: "bold",
                  },
                  "& .MuiInputLabel-root": {
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
                label={
                  translations.fields?.netPresentValue ||
                  "Καθαρή παρούσα αξία (€)"
                }
                type="number"
                value={photovoltaicSystem.net_present_value || 0}
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiInputBase-input": {
                    color:
                      photovoltaicSystem.net_present_value >= 0
                        ? "green"
                        : "red",
                    fontWeight: "bold",
                  },
                  "& .MuiInputLabel-root": {
                    "&.Mui-focused": {
                      color: "var(--color-primary) !important",
                    },
                  },
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--color-primary) !important",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "var(--color-primary) !important",
                    },
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={
                  translations.fields?.paybackPeriod ||
                  "Περίοδος απόσβεσης (έτη)"
                }
                type="number"
                value={photovoltaicSystem.payback_period || 0}
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiInputBase-input": {
                    color: "var(--color-primary)",
                    fontWeight: "bold",
                  },
                  "& .MuiInputLabel-root": {
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
                label={
                  translations.fields?.annualSavings ||
                  "Ετήσια εξοικονόμηση (€)"
                }
                type="number"
                value={photovoltaicSystem.annual_savings || 0}
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiInputBase-input": {
                    color: "var(--color-primary)",
                    fontWeight: "bold",
                  },
                  "& .MuiInputLabel-root": {
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
                label={
                  translations.fields?.investmentReturn ||
                  "Απόδοση επένδυσης (%)"
                }
                type="number"
                value={photovoltaicSystem.investment_return || 0}
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiInputBase-input": {
                    color: "var(--color-primary)",
                    fontWeight: "bold",
                  },
                  "& .MuiInputLabel-root": {
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

        {/* Tab 2: Energy Indicators */}
        <TabPanel value={tabValue} index={1}>
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
                  {translations.pvUsageOptions?.electricity ||
                    "Ηλεκτρική Ενέργεια"}
                </option>
                <option value="hot_water">
                  {translations.pvUsageOptions?.hotWater || "Ζεστό Νερό"}
                </option>
                <option value="both">
                  {translations.pvUsageOptions?.both || "Και τα δύο"}
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
                  {translations.pvSystemTypeOptions?.gridConnected ||
                    "Διασυνδεδεμένο"}
                </option>
                <option value="standalone">
                  {translations.pvSystemTypeOptions?.standalone || "Αυτόνομο"}
                </option>
                <option value="hybrid">
                  {translations.pvSystemTypeOptions?.hybrid || "Υβριδικό"}
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
