import React, { useState, useEffect, useCallback } from "react";
import $ from "jquery";
import Cookies from "universal-cookie";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  Card,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import ConfirmationDialog from "../dialogs/ConfirmationDialog";
import { useLanguage } from "../../context/LanguageContext";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import ElectricalConsumptionModal from "../../modals/building/ElectricalConsumptionModal";
import API_BASE_URL from "../../config/api.js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const ElectricalConsumptionTabContent = ({
  buildingUuid,
  projectUuid,
  buildingData,
  params,
}) => {
  const [electricalConsumptions, setElectricalConsumptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cookies = new Cookies(null, { path: "/" });
  const token = cookies.get("token");

  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  const { language } = useLanguage();
  const translations =
    language === "en"
      ? english_text.ElectricalConsumptionTabContent || {}
      : greek_text.ElectricalConsumptionTabContent || {};

  const getConsumptionTypeDisplay = (type) => {
    const types = {
      lighting: translations.lighting || "Φωτισμός",
      air_conditioning: translations.air_conditioning || "Κλιματισμός",
      other_electrical_devices:
        translations.other_electrical_devices || "Άλλες ηλεκτρικές συσκευές",
    };
    return types[type] || type;
  };
  const getLoadTypeDisplay = (type) => {
    const types = {
      continuous: translations.continuous || "Συνεχής",
      intermittent: translations.intermittent || "Διαλείπων",
      peak: translations.peak || "Αιχμής",
      base: translations.base || "Βάσης",
    };
    return types[type] || type;
  };
  const prepareChartData = () => {
    if (!electricalConsumptions.length) return [];

    const groupedData = {};

    electricalConsumptions.forEach((item) => {
      const energyData = item.energy_consumption_data;
      let periodKey;
      let periodLabel;

      if (energyData && energyData.start_date && energyData.end_date) {
        const fromText = language === "en" ? "From" : "Από";
        const toText = language === "en" ? "to" : "έως";
        periodKey = `${energyData.start_date}_${energyData.end_date}`;
        periodLabel = `${fromText} ${energyData.start_date} ${toText} ${energyData.end_date}`;
      } else {
        periodKey = "no_period";
        periodLabel = translations.noPeriod || "Χωρίς Περίοδο";
      }

      const consumptionType = item.consumption_type;

      if (!groupedData[periodKey]) {
        groupedData[periodKey] = {
          name: periodLabel,
          lighting: 0,
          air_conditioning: 0,
          other_electrical_devices: 0,
        };
      }

      const annualConsumption = parseFloat(item.annual_energy_consumption) || 0;

      if (consumptionType === "lighting") {
        groupedData[periodKey].lighting += annualConsumption;
      } else if (consumptionType === "air_conditioning") {
        groupedData[periodKey].air_conditioning += annualConsumption;
      } else if (consumptionType === "other_electrical_devices") {
        groupedData[periodKey].other_electrical_devices += annualConsumption;
      }
    });

    return Object.values(groupedData);
  };

  const prepareLoadTypeChartData = () => {
    if (!electricalConsumptions.length) return { chartData: [], availableLoadTypes: [] };

    const groupedData = {};
    const availableLoadTypes = new Set();

    electricalConsumptions.forEach((item) => {
      const energyData = item.energy_consumption_data;
      let periodKey;
      let periodLabel;

      if (energyData && energyData.start_date && energyData.end_date) {
        const fromText = language === "en" ? "From" : "Από";
        const toText = language === "en" ? "to" : "έως";
        periodKey = `${energyData.start_date}_${energyData.end_date}`;
        periodLabel = `${fromText} ${energyData.start_date} ${toText} ${energyData.end_date}`;
      } else {
        periodKey = "no_period";
        periodLabel = translations.noPeriod || "Χωρίς Περίοδο";
      }

      const loadType = item.load_type;

      if (loadType) {
        availableLoadTypes.add(loadType);

        if (!groupedData[periodKey]) {
          groupedData[periodKey] = {
            name: periodLabel,
          };
        }

        const annualConsumption = parseFloat(item.annual_energy_consumption) || 0;

        // Initialize the load type if it doesn't exist
        if (!groupedData[periodKey][loadType]) {
          groupedData[periodKey][loadType] = 0;
        }

        groupedData[periodKey][loadType] += annualConsumption;
      }
    });

    return {
      chartData: Object.values(groupedData),
      availableLoadTypes: Array.from(availableLoadTypes)
    };
  };

  const chartData = prepareChartData();
  const { chartData: loadTypeChartData, availableLoadTypes } = prepareLoadTypeChartData();

  // Define colors for load types
  const loadTypeColors = {
    continuous: "#FF6B35",
    intermittent: "#4ECDC4", 
    peak: "#FFD93D",
    base: "#6BCF7F"
  };

  const handleOpen = () => {
    setEditItem(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditItem(null);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setOpen(true);
  };

  const handleDeleteClick = (item) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!deletingItem || !token) return;

    $.ajax({
      url: `${API_BASE_URL}/electrical_consumptions/delete/${deletingItem.uuid}/`,
      method: "DELETE",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      success: (response) => {
        setDeleteDialogOpen(false);
        setDeletingItem(null);
        fetchElectricalConsumptions();
      },
      error: (jqXHR) => {
        setError(
          jqXHR.responseJSON?.detail ||
            translations.errorDelete ||
            "Error deleting electrical consumption"
        );
        setDeleteDialogOpen(false);
      },
    });
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeletingItem(null);
  };

  const fetchElectricalConsumptions = useCallback(() => {
    if (!buildingUuid || !token) {
      setError(translations.errorAuth || "Authentication required");
      return;
    }
    setLoading(true);
    setError(null);

    $.ajax({
      url: `${API_BASE_URL}/electrical_consumptions/building/${buildingUuid}/`,
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
      success: (data) => {
        const mappedData = Array.isArray(data.data)
          ? data.data.map((item) => ({
              id: item.uuid,
              uuid: item.uuid,
              consumption_type: item.consumption_type || "",
              consumption_type_display: item.consumption_type_display || "",
              thermal_zone: item.thermal_zone || "",
              thermal_zone_usage:
                item.thermal_zone_data?.thermal_zone_usage || "",
              energy_consumption: item.energy_consumption || "",
              energy_consumption_data: item.energy_consumption_data || null,
              load_type: item.load_type || "",
              load_type_display: item.load_type_display || "",
              load_power: item.load_power || 0,
              quantity: item.quantity || 0,
              operating_hours_per_year: item.operating_hours_per_year || 0,
              annual_energy_consumption: item.annual_energy_consumption || 0,
              created_at: item.created_at || "",
              ...item,
            }))
          : [];

        setElectricalConsumptions(mappedData);
        setLoading(false);
      },
      error: (jqXHR) => {
        setError(
          jqXHR.responseJSON?.detail ||
            translations.errorFetch ||
            "Error fetching electrical consumptions"
        );
        setLoading(false);
      },
    });
  }, [buildingUuid, token, translations]);

  useEffect(() => {
    fetchElectricalConsumptions();
  }, [fetchElectricalConsumptions]);

  const columns = [
    {
      field: "consumption_type",
      headerName: translations.columns?.consumptionType || "Τύπος κατανάλωσης",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Chip
          label={getConsumptionTypeDisplay(params.value)}
          size="small"
          variant="filled"
          sx={{
            backgroundColor: "var(--color-primary)",
            color: "white",
            "&:hover": {
              backgroundColor: "var(--color-primary)",
              opacity: 0.8,
            },
          }}
        />
      ),
    },
    {
      field: "thermal_zone_usage",
      headerName: translations.columns?.thermalZone || "Θερμική ζώνη",
      flex: 1,
      minWidth: 180,
      renderCell: (params) => <span>{params.value || "-"}</span>,
    },
    {
      field: "load_type",
      headerName: translations.columns?.loadType || "Τύπος φορτίου",
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => <span>{getLoadTypeDisplay(params.value)}</span>,
    },
    {
      field: "load_power",
      headerName: translations.columns?.loadPower || "Ισχύς (W)",
      type: "number",
      flex: 0.7,
      minWidth: 100,
      renderCell: (params) => {
        const value = params.value || 0;
        return (
          <span className="font-medium text-primary">
            {parseFloat(value).toFixed(2)} W
          </span>
        );
      },
    },
    {
      field: "quantity",
      headerName: translations.columns?.quantity || "Πλήθος",
      type: "number",
      flex: 0.6,
      minWidth: 80,
      renderCell: (params) => (
        <span className="font-medium">{params.value || 0}</span>
      ),
    },
    {
      field: "operating_hours_per_year",
      headerName: translations.columns?.operatingHours || "Ώρες/έτος",
      type: "number",
      flex: 0.8,
      minWidth: 110,
      renderCell: (params) => {
        const value = params.value || 0;
        return (
          <span className="font-medium text-primary">
            {parseFloat(value).toFixed(2)} h
          </span>
        );
      },
    },
    {
      field: "annual_energy_consumption",
      headerName:
        translations.columns?.annualConsumption || "Ετήσια κατανάλωση",
      type: "number",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        const value = params.value || 0;
        return (
          <span className="font-bold text-panel-primary">
            {parseFloat(value).toFixed(2)} kWh/year
          </span>
        );
      },
    },
    {
      field: "energy_consumption",
      headerName:
        translations.columns?.energyConsumptionReference ||
        "Αναφορά Ενεργειακής Κατανάλωσης",
      flex: 1.2,
      minWidth: 200,
      renderCell: (params) => {
        const energyData = params.row.energy_consumption_data;
        if (energyData) {
          const fromText = language === "en" ? "From" : "Από";
          const toText = language === "en" ? "to" : "έως";
          const energySourceDisplay =
            language === "en"
              ? {
                  electricity: "Electricity",
                  natural_gas: "Natural Gas",
                  heating_oil: "Heating Oil",
                  biomass: "Biomass",
                }[energyData.energy_source] || energyData.energy_source
              : {
                  electricity: "Ηλεκτρική Ενέργεια",
                  natural_gas: "Φυσικό Αέριο",
                  heating_oil: "Πετρέλαιο Θέρμανσης",
                  biomass: "Βιομάζα",
                }[energyData.energy_source] || energyData.energy_source;

          return (
            <span className="text-sm">
              {fromText} {energyData.start_date} {toText} {energyData.end_date}
              <br />
              <span className="text-xs text-gray-600">
                ({energySourceDisplay})
              </span>
            </span>
          );
        }
        return <span className="text-gray-400">-</span>;
      },
    },
    {
      field: "actions",
      headerName: translations.columns?.actions || "Ενέργειες",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title={translations.actions?.edit || "Επεξεργασία"}>
            <IconButton
              size="small"
              sx={{ color: "var(--color-primary)" }}
              onClick={() => handleEdit(params.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={translations.actions?.delete || "Διαγραφή"}>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(params.row)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (loading) return <p>{translations.loading || "Φόρτωση..."}</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="bg-primary/10 p-2 rounded-full mr-3">
            <ElectricBoltIcon className="w-6 h-6 text-primary" />
          </span>
          {translations.title || "Ηλεκτρικές Καταναλώσεις"}
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        {" "}
        <Box display="flex" justifyContent="flex-start" gap={2} mb={2}>
          <Button
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: "var(--color-primary)",
              color: "white",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "var(--color-primary)",
                opacity: 0.8,
              },
            }}
            startIcon={<AddIcon />}
            onClick={handleOpen}>
            {translations.addButton || "Προσθήκη Ηλεκτρικής Κατανάλωσης"}
          </Button>
        </Box>
        <Card variant="outlined" sx={{ height: 500, width: "100%" }}>
          <DataGrid
            rows={electricalConsumptions}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 25]}
            checkboxSelection
            disableSelectionOnClick
            loading={loading}
            getRowId={(row) => row.id}
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#e0e0e0",
                borderBottom: "2px solid #e0e0e0",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid #e0e0e0",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#e0e0e0",
              },
            }}
            initialState={{
              sorting: {
                sortModel: [{ field: "created_at", sort: "desc" }],
              },
            }}
          />
        </Card>
        {chartData.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              {translations.chartTitle ||
                "Ηλεκτρικές καταναλώσεις ανά περίοδους - Όλες οι θερμικές ζώνες"}
            </h3>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 50, left: 100, bottom: 120 }}
                barCategoryGap="20%"
                barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  interval={0}
                  tick={{ fontSize: 13, fontWeight: 500, fill: "#333" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#333" }}
                  label={{
                    value: translations.chartYAxis || "Κατανάλωση (kWh)",
                    angle: -90,
                    position: "insideLeft",
                    offset: -10,
                    style: {
                      fontSize: "14px",
                      fontWeight: "bold",
                      fill: "#333",
                      textAnchor: "middle",
                    },
                  }}
                />
                <RechartsTooltip
                  formatter={(value) => `${parseFloat(value).toFixed(2)} kWh`}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.98)",
                    border: "2px solid #ccc",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                  }}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: "30px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                  iconType="rect"
                  iconSize={16}
                />
                <Bar
                  dataKey="lighting"
                  name={getConsumptionTypeDisplay("lighting")}
                  fill="#FFA500"
                  stackId="a"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="air_conditioning"
                  name={getConsumptionTypeDisplay("air_conditioning")}
                  fill="#0066FF"
                  stackId="a"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="other_electrical_devices"
                  name={getConsumptionTypeDisplay("other_electrical_devices")}
                  fill="#90EE90"
                  stackId="a"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {loadTypeChartData.length > 0 && availableLoadTypes.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
              {translations.loadTypeChartTitle ||
                "Ηλεκτρικές καταναλώσεις ανά τύπο φορτίου - Όλες οι θερμικές ζώνες"}
            </h3>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart
                data={loadTypeChartData}
                margin={{ top: 20, right: 50, left: 100, bottom: 120 }}
                barCategoryGap="20%"
                barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  interval={0}
                  tick={{ fontSize: 13, fontWeight: 500, fill: "#333" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#333" }}
                  label={{
                    value: translations.chartYAxis || "Κατανάλωση (kWh)",
                    angle: -90,
                    position: "insideLeft",
                    offset: -10,
                    style: {
                      fontSize: "14px",
                      fontWeight: "bold",
                      fill: "#333",
                      textAnchor: "middle",
                    },
                  }}
                />
                <RechartsTooltip
                  formatter={(value) => `${parseFloat(value).toFixed(2)} kWh`}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.98)",
                    border: "2px solid #ccc",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                  }}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: "30px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                  iconType="rect"
                  iconSize={16}
                />
                {availableLoadTypes.map((loadType, index) => {
                  const isLast = index === availableLoadTypes.length - 1;
                  return (
                    <Bar
                      key={loadType}
                      dataKey={loadType}
                      name={getLoadTypeDisplay(loadType)}
                      fill={loadTypeColors[loadType] || "#999999"}
                      stackId="b"
                      radius={isLast ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    />
                  );
                })}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <ElectricalConsumptionModal
        open={open}
        handleClose={handleClose}
        projectUuid={projectUuid}
        buildingUuid={buildingUuid}
        onSubmitSuccess={fetchElectricalConsumptions}
        editItem={editItem}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title={
          translations.deleteDialog?.title || "Διαγραφή Ηλεκτρικής Κατανάλωσης"
        }
        message={
          translations.deleteDialog?.message ||
          "Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτή την ηλεκτρική κατανάλωση; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί."
        }
        confirmText={translations.deleteDialog?.confirm || "Διαγραφή"}
        cancelText={translations.deleteDialog?.cancel || "Ακύρωση"}
        confirmColor="error"
      />
    </div>
  );
};

export default ElectricalConsumptionTabContent;
