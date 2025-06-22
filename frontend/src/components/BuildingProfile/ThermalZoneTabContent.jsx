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
import ThermalZoneModal from "../../modals/building/ThermalZoneModal";

const ThermalZoneTabContent = ({
  buildingUuid,
  projectUuid,
  buildingData,
  params,
}) => {
  const [thermalZones, setThermalZones] = useState([]);
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
      ? english_text.ThermalZoneTabContent || {}
      : greek_text.ThermalZoneTabContent || {};

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
      url: `http://127.0.0.1:8000/thermal_zones/delete/${deletingItem.uuid}/`,
      method: "DELETE",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      success: (response) => {
        console.log("Thermal zone deleted:", response);
        setDeleteDialogOpen(false);
        setDeletingItem(null);
        fetchThermalZones();
      },
      error: (jqXHR) => {
        console.error("Error deleting thermal zone:", jqXHR);
        setError(
          jqXHR.responseJSON?.detail ||
            translations.errorDelete ||
            "Error deleting thermal zone"
        );
        setDeleteDialogOpen(false);
      },
    });
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeletingItem(null);
  };

  const fetchThermalZones = useCallback(() => {
    if (!buildingUuid || !token) {
      setError(translations.errorAuth || "Authentication required");
      return;
    }
    setLoading(true);
    setError(null);

    $.ajax({
      url: `http://127.0.0.1:8000/thermal_zones/building/${buildingUuid}/`,
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
      },
      success: (data) => {
        console.log("Fetched thermal zones:", data);
        const mappedData = Array.isArray(data.data)
          ? data.data.map((item) => ({
              id: item.uuid,
              uuid: item.uuid,
              thermal_zone_usage: item.thermal_zone_usage || "",
              description: item.description || "",
              space_condition: item.space_condition || "",
              floor: item.floor || "",
              total_thermal_zone_area: item.total_thermal_zone_area || 0,
              created_at: item.created_at || "",
              ...item,
            }))
          : [];

        console.log("Mapped data for DataGrid:", mappedData);
        setThermalZones(mappedData);
        setLoading(false);
      },
      error: (jqXHR) => {
        console.error("Error fetching thermal zones:", jqXHR);
        setError(
          jqXHR.responseJSON?.detail ||
            translations.errorFetch ||
            "Error fetching thermal zones"
        );
        setLoading(false);
      },
    });
  }, [buildingUuid, token, translations]);

  useEffect(() => {
    fetchThermalZones();
  }, [fetchThermalZones]);

  const columns = [
    {
      field: "thermal_zone_usage",
      headerName:
        translations.columns?.thermalZoneUsage || "Χρήση θερμικής ζώνης",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "floor",
      headerName: translations.columns?.floor || "Όροφος",
      flex: 0.7,
      minWidth: 100,
    },
    {
      field: "space_condition",
      headerName: translations.columns?.spaceCondition || "Κατάσταση χώρου",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "total_thermal_zone_area",
      headerName: translations.columns?.totalArea || "Επιφάνεια (m²)",
      type: "number",
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => {
        const value = params.value || 0;
        return (
          <span className="font-medium text-panel-primary">
            {parseFloat(value).toFixed(2)} m²
          </span>
        );
      },
    },
    {
      field: "description",
      headerName: translations.columns?.description || "Περιγραφή",
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <span title={params.value}>
          {params.value && params.value.length > 50
            ? `${params.value.substring(0, 50)}...`
            : params.value || "-"}
        </span>
      ),
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
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </span>
          {translations.title || "Θερμικές Ζώνες"}
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
            {translations.addButton || "Προσθήκη Θερμικής Ζώνης"}
          </Button>
        </Box>

        <Card variant="outlined" sx={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={thermalZones}
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
      </div>

      <ThermalZoneModal
        open={open}
        handleClose={handleClose}
        projectUuid={projectUuid}
        buildingUuid={buildingUuid}
        onSubmitSuccess={fetchThermalZones}
        editItem={editItem}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title={translations.deleteDialog?.title || "Διαγραφή Θερμικής Ζώνης"}
        message={
          translations.deleteDialog?.message ||
          "Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτή τη θερμική ζώνη; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί."
        }
        confirmText={translations.deleteDialog?.confirm || "Διαγραφή"}
        cancelText={translations.deleteDialog?.cancel || "Ακύρωση"}
        confirmColor="error"
      />
    </div>
  );
};

export default ThermalZoneTabContent;
