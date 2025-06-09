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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmationDialog from "../dialogs/ConfirmationDialog";
import { useLanguage } from "../../context/LanguageContext";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import EnergyConsumptionModal from "../../modals/building/EnergyConsumptionModal";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const EnergyProfileTabContent = ({
  buildingUuid,
  projectUuid,
  buildingData,
  params,
}) => {
  const [consumptions, setConsumptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cookies = new Cookies(null, { path: "/" });
  const token = cookies.get("token");

  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  console.log("EnergyProfileTabContent: Initial render, open state is:", open);

  const { language } = useLanguage();
  const translations =
    language === "en"
      ? english_text.BuildingProfile.tabs.energyProfileContent
      : greek_text.BuildingProfile.tabs.energyProfileContent;

  const getEnergySourceDisplay = (sourceKey) => {
    if (!sourceKey) return "";

    const energySources =
      language === "en"
        ? english_text.EnergyConsumptionModal
        : greek_text.EnergyConsumptionModal;

    switch (sourceKey.toLowerCase()) {
      case "electricity":
        return energySources.electricity;
      case "natural_gas":
        return energySources.natural_gas;
      case "heating_oil":
        return energySources.heating_oil;
      case "biomass":
        return energySources.biomass;
      default:
        return sourceKey;
    }
  };

  const handleOpen = () => {
    setEditItem(null);
    console.log(
      "EnergyProfileTabContent: handleOpen called, setting open to true"
    );
    setOpen(true);
  };

  const handleClose = () => {
    console.log(
      "EnergyProfileTabContent: handleClose called, setting open to false"
    );
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
      url: `http://127.0.0.1:8000/energy_consumptions/delete/${deletingItem.id}/`,
      method: "DELETE",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      success: (response) => {
        console.log("Energy consumption deleted:", response);
        setDeleteDialogOpen(false);
        setDeletingItem(null);
        fetchConsumptions();
      },
      error: (jqXHR) => {
        console.error("Error deleting energy consumption:", jqXHR);
        setError(jqXHR.responseJSON?.detail || translations.errorDelete);
        setDeleteDialogOpen(false);
      },
    });
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeletingItem(null);
  };

  const fetchConsumptions = useCallback(() => {
    if (!buildingUuid || !token) {
      setError(translations.errorAuth);
      return;
    }
    setLoading(true);
    setError(null);
    $.ajax({
      url: `http://127.0.0.1:8000/energy_consumptions/get_by_building/${buildingUuid}/`,
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
      success: (data) => {
        console.log("Fetched energy consumptions:", data);
        const mappedData = Array.isArray(data)
          ? data.map((item) => ({
              id: item.uuid,
              energy_source: item.energy_source || "",
              quantity: item.quantity || 0,
              unit: item.unit || "",
              start_date: item.start_date || "",
              end_date: item.end_date || "",
              kwh_equivalent: item.kwh_equivalent || 0,
              ...item,
            }))
          : [];

        console.log("Mapped data for DataGrid:", mappedData);
        setConsumptions(mappedData);
        setLoading(false);
      },
      error: (jqXHR) => {
        console.error("Error fetching energy consumptions:", jqXHR);
        setError(jqXHR.responseJSON?.detail || translations.errorFetch);
        setLoading(false);
      },
    });
  }, [buildingUuid, token, translations]);

  useEffect(() => {
    fetchConsumptions();
  }, [fetchConsumptions]);

  const preparePeriodsData = useCallback(() => {
    if (!consumptions.length) return [];

    const periodMap = new Map();

    consumptions.forEach((consumption) => {
      const startDate = new Date(consumption.start_date);
      const endDate = new Date(consumption.end_date);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return;

      const periodKey = `${consumption.start_date}|${consumption.end_date}`;

      const formatDate = (date) => {
        return date.toLocaleDateString(language === "en" ? "en-US" : "el-GR", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        });
      };

      const periodLabel =
        startDate.getTime() === endDate.getTime()
          ? formatDate(startDate)
          : `${formatDate(startDate)} - ${formatDate(endDate)}`;

      if (!periodMap.has(periodKey)) {
        periodMap.set(periodKey, {
          periodKey,
          periodLabel,
          startDate,
          endDate,
          electricity: 0,
          heating_oil: 0,
          natural_gas: 0,
          biomass: 0,
          totalEnergy: 0,
        });
      }

      const periodData = periodMap.get(periodKey);
      switch (consumption.energy_source?.toLowerCase()) {
        case "electricity":
          periodData.electricity += consumption.kwh_equivalent;
          periodData.totalEnergy += consumption.kwh_equivalent;
          break;
        case "heating_oil":
          periodData.heating_oil += consumption.kwh_equivalent;
          periodData.totalEnergy += consumption.kwh_equivalent;
          break;
        case "natural_gas":
          periodData.natural_gas += consumption.kwh_equivalent;
          periodData.totalEnergy += consumption.kwh_equivalent;
          break;
        case "biomass":
          periodData.biomass += consumption.kwh_equivalent;
          periodData.totalEnergy += consumption.kwh_equivalent;
          break;
      }
    });

    return Array.from(periodMap.values()).sort(
      (a, b) => b.startDate - a.startDate
    );
  }, [consumptions, language]);

  const periodsData = preparePeriodsData();

  const preparePieData = (period) => {
    const data = [];

    if (period.electricity > 0) {
      data.push({
        name: getEnergySourceDisplay("electricity"),
        value: period.electricity,
        color: "#8884d8",
      });
    }

    if (period.heating_oil > 0) {
      data.push({
        name: getEnergySourceDisplay("heating_oil"),
        value: period.heating_oil,
        color: "#82ca9d",
      });
    }

    if (period.natural_gas > 0) {
      data.push({
        name: getEnergySourceDisplay("natural_gas"),
        value: period.natural_gas,
        color: "#ffc658",
      });
    }

    if (period.biomass > 0) {
      data.push({
        name: getEnergySourceDisplay("biomass"),
        value: period.biomass,
        color: "#ff8042",
      });
    }

    return data;
  };

  const columns = [
    {
      field: "energy_source",
      headerName: translations.columns.energySource,
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <span>{getEnergySourceDisplay(params.value)}</span>
      ),
    },
    {
      field: "start_date",
      headerName: translations.columns.startDate,
      flex: 0.8,
      minWidth: 110,
    },
    {
      field: "end_date",
      headerName: translations.columns.endDate,
      flex: 0.8,
      minWidth: 110,
    },
    {
      field: "quantity",
      headerName: translations.columns.quantity,
      type: "number",
      flex: 0.7,
      minWidth: 120,
      renderCell: (params) => {
        const value = params.value || 0;
        const unit = params.row.unit || "";
        return (
          <span>
            {parseFloat(value).toFixed(2)} {unit}
          </span>
        );
      },
    },
    {
      field: "unit",
      headerName: translations.columns.unit,
      flex: 0.5,
      minWidth: 80,
    },
    {
      field: "kwh_equivalent",
      headerName: translations.columns.kwhEquivalent || "Ενέργεια(kwh)",
      type: "number",
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => {
        const value = params.value || 0;
        return (
          <span className="font-medium text-green-600">
            {parseFloat(value).toFixed(2)} kWh
          </span>
        );
      },
    },
    {
      field: "actions",
      headerName: translations.columns.actions,
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title={translations.actions.edit}>
            <IconButton
              size="small"
              sx={{ color: "var(--color-primary)" }}
              onClick={() => handleEdit(params.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={translations.actions.delete}>
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

  if (loading) return <p>{translations.loading}</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  console.log("EnergyProfileTabContent: Rendering, open state is:", open);

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="bg-primary/10 p-2 rounded-full mr-3">
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </span>
          {translations.title || "Energy Profile"}
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <Box display="flex" justifyContent="flex-start" gap={2} mb={2}>
          <Button
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: "var(--color-primary)",
              color: "white",
              textTransform: "none",
            }}
            startIcon={<AddIcon />}
            onClick={handleOpen}>
            {translations.addButton}
          </Button>
        </Box>

        <Card variant="outlined" sx={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={consumptions}
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
                sortModel: [{ field: "start_date", sort: "desc" }],
              },
            }}
          />
        </Card>
      </div>

      {/*
      
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'var(--color-primary)', mt: 4, mb: 2 }}>
        {translations.energyConsumptionChart || "Energy Consumption Chart"}
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: 2, 
        mt: 2,
        overflowX: 'auto', 
        pb: 2 
      }}>
        {periodsData.length === 0 ? (
          <Typography variant="body1">No energy consumption data available.</Typography>
        ) : (
          periodsData.map((period) => (
            <Card 
              key={period.periodKey} 
              variant="outlined" 
              sx={{ 
                width: 300, 
                minWidth: 300,
                p: 2, 
                display: 'flex', 
                flexDirection: 'column' 
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                {period.periodLabel}
              </Typography>
              
              <Box sx={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={preparePieData(period)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                    >
                      {preparePieData(period).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value) => `${parseFloat(value).toFixed(2)} kWh`}
                    />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              
              <Typography variant="body1" mt={2} align="center">
                {translations.chartEnergyAxis || "Total Energy"}: <strong>{parseFloat(period.totalEnergy || 0).toFixed(2)} kWh</strong>
              </Typography>
            </Card>
          ))
        )}
      </Box>
      
      */}

      <EnergyConsumptionModal
        open={open}
        handleClose={handleClose}
        projectUuid={projectUuid}
        buildingUuid={buildingUuid}
        onSubmitSuccess={fetchConsumptions}
        editItem={editItem}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title={translations.deleteDialog?.title || "Delete Energy Consumption"}
        message={
          translations.deleteDialog?.message ||
          "Are you sure you want to delete this energy consumption record? This action cannot be undone."
        }
        confirmText={translations.deleteDialog?.confirm || "Delete"}
        cancelText={translations.deleteDialog?.cancel || "Cancel"}
        confirmColor="error"
      />
    </div>
  );
};

export default EnergyProfileTabContent;
