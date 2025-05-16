import React, { useState, useEffect, useCallback } from 'react';
import $ from 'jquery';
import Cookies from 'universal-cookie';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Card, Typography, Box, IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useLanguage } from "../../context/LanguageContext";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";
import EnergyConsumptionModal from '../../modals/EnergyConsumptionModal';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const EnergyProfileTabContent = ({ buildingUuid, projectUuid, buildingData, params }) => {
  const [consumptions, setConsumptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cookies = new Cookies(null, { path: '/' });
  const token = cookies.get('token');
  
  // Modal states
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  console.log("EnergyProfileTabContent: Initial render, open state is:", open);

  const { language } = useLanguage(); // Get language object
  const translations = language === 'en' 
    ? english_text.BuildingProfile.tabs.energyProfileContent 
    : greek_text.BuildingProfile.tabs.energyProfileContent;

  // Function to translate energy source names based on language
  const getEnergySourceDisplay = (sourceKey) => {
    if (!sourceKey) return '';
    
    const energySources = language === 'en' 
      ? english_text.EnergyConsumptionModal
      : greek_text.EnergyConsumptionModal;
    
    switch(sourceKey.toLowerCase()) {
      case 'electricity':
        return energySources.electricity;
      case 'natural_gas':
        return energySources.natural_gas;
      case 'heating_oil':
        return energySources.heating_oil;
      case 'biomass':
        return energySources.biomass;
      default:
        return sourceKey; // Return original if no match
    }
  };

  // Handle modal actions
  const handleOpen = () => {
    setEditItem(null); // Reset edit item for add mode
    console.log("EnergyProfileTabContent: handleOpen called, setting open to true");
    setOpen(true);
  };
  
  const handleClose = () => {
    console.log("EnergyProfileTabContent: handleClose called, setting open to false");
    setOpen(false);
    setEditItem(null); // Clear edit item when modal closes
  };
  
  // Handle edit button click
  const handleEdit = (item) => {
    setEditItem(item);
    setOpen(true);
  };
  
  // Handle delete button click
  const handleDeleteClick = (item) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };
  
  // Confirm delete action
  const confirmDelete = () => {
    if (!deletingItem || !token) return;
    
    $.ajax({
      url: `http://127.0.0.1:8000/energy_consumptions/delete/${deletingItem.id}/`,
      method: "DELETE",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      success: (response) => {
        console.log("Energy consumption deleted:", response);
        setDeleteDialogOpen(false);
        setDeletingItem(null);
        fetchConsumptions(); // Refresh data
      },
      error: (jqXHR) => {
        console.error("Error deleting energy consumption:", jqXHR);
        setError(jqXHR.responseJSON?.detail || translations.errorDelete);
        setDeleteDialogOpen(false);
      }
    });
  };
  
  // Cancel delete action
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
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
      },
      success: (data) => {
        console.log("Fetched energy consumptions:", data);
        // Transform data to ensure correct field mapping
        const mappedData = Array.isArray(data) ? data.map(item => ({
          id: item.uuid,
          energy_source: item.energy_source || '',
          quantity: item.quantity || 0,
          unit: item.unit || '',
          start_date: item.start_date || '',
          end_date: item.end_date || '',
          kwh_equivalent: item.kwh_equivalent || 0,
          // Keep original data for reference
          ...item
        })) : [];
        
        console.log("Mapped data for DataGrid:", mappedData);
        setConsumptions(mappedData);
        setLoading(false);
      },
      error: (jqXHR) => {
        console.error("Error fetching energy consumptions:", jqXHR);
        setError(jqXHR.responseJSON?.detail || translations.errorFetch);
        setLoading(false);
      }
    });
  }, [buildingUuid, token, translations]);

  useEffect(() => {
    fetchConsumptions();
  }, [fetchConsumptions]);

  // Function to prepare data by consumption period
  const preparePeriodsData = useCallback(() => {
    if (!consumptions.length) return [];
    
    // Group consumptions by their exact date ranges
    const periodMap = new Map();
    
    // Process each consumption entry
    consumptions.forEach(consumption => {
      const startDate = new Date(consumption.start_date);
      const endDate = new Date(consumption.end_date);
      
      // Skip invalid dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return;
      
      // Create a unique key for this period
      const periodKey = `${consumption.start_date}|${consumption.end_date}`;
      
      // Format dates for display
      const formatDate = (date) => {
        return date.toLocaleDateString(language === 'en' ? 'en-US' : 'el-GR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        });
      };
      
      // Create period label
      const periodLabel = startDate.getTime() === endDate.getTime() 
        ? formatDate(startDate) 
        : `${formatDate(startDate)} - ${formatDate(endDate)}`;
      
      // Initialize period if not exists
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
          totalEnergy: 0
        });
      }
      
      // Add this consumption to the right energy source in this period
      const periodData = periodMap.get(periodKey);
      switch(consumption.energy_source?.toLowerCase()) {
        case 'electricity':
          periodData.electricity += consumption.kwh_equivalent;
          periodData.totalEnergy += consumption.kwh_equivalent;
          break;
        case 'heating_oil':
          periodData.heating_oil += consumption.kwh_equivalent;
          periodData.totalEnergy += consumption.kwh_equivalent;
          break;
        case 'natural_gas':
          periodData.natural_gas += consumption.kwh_equivalent;
          periodData.totalEnergy += consumption.kwh_equivalent;
          break;
        case 'biomass':
          periodData.biomass += consumption.kwh_equivalent;
          periodData.totalEnergy += consumption.kwh_equivalent;
          break;
      }
    });
    
    // Convert to array and sort by start date
    return Array.from(periodMap.values())
      .sort((a, b) => b.startDate - a.startDate); // newest first
    
  }, [consumptions, language]);

  const periodsData = preparePeriodsData();

  // Function to prepare data for pie charts
  const preparePieData = (period) => {
    const data = [];
    
    if (period.electricity > 0) {
      data.push({
        name: getEnergySourceDisplay("electricity"),
        value: period.electricity,
        color: "#8884d8"
      });
    }
    
    if (period.heating_oil > 0) {
      data.push({
        name: getEnergySourceDisplay("heating_oil"),
        value: period.heating_oil,
        color: "#82ca9d"
      });
    }
    
    if (period.natural_gas > 0) {
      data.push({
        name: getEnergySourceDisplay("natural_gas"),
        value: period.natural_gas,
        color: "#ffc658"
      });
    }
    
    if (period.biomass > 0) {
      data.push({
        name: getEnergySourceDisplay("biomass"),
        value: period.biomass,
        color: "#ff8042"
      });
    }
    
    return data;
  };

  // Define columns for the data grid
  const columns = [
    { 
      field: 'energy_source', 
      headerName: translations.columns.energySource, 
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <span>{getEnergySourceDisplay(params.value)}</span>
      ),
    },
    { 
      field: 'start_date', 
      headerName: translations.columns.startDate,
      flex: 0.8,
      minWidth: 110,
    },
    { 
      field: 'end_date', 
      headerName: translations.columns.endDate,
      flex: 0.8,
      minWidth: 110,
    },
    { 
      field: 'quantity', 
      headerName: translations.columns.quantity,
      type: 'number',
      flex: 0.7,
      minWidth: 100,
    },
    { 
      field: 'unit', 
      headerName: translations.columns.unit,
      flex: 0.5,
      minWidth: 80 
    },
    { 
      field: 'kwh_equivalent', 
      headerName: translations.columns.kwhEquivalent || 'Ενέργεια(kwh)',
      type: 'number',
      flex: 0.8,
      minWidth: 120,
    },
    {
      field: 'actions',
      headerName: translations.columns.actions,
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title={translations.actions.edit}>
            <IconButton 
              size="small" 
              sx={{ color: 'var(--color-primary)' }}
              onClick={() => handleEdit(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={translations.actions.delete}>
            <IconButton 
              size="small" 
              color="error"
              onClick={() => handleDeleteClick(params.row)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    }
  ];

  if (loading) return <p>{translations.loading}</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  console.log("EnergyProfileTabContent: Rendering, open state is:", open);

  return (
    <div>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'var(--color-primary)', mb: 2 }}>
        {translations.title}
      </Typography>
      
      <Box display="flex" justifyContent="flex-start" gap={2} mb={2}>
        <Button 
          variant="contained" 
          color="green" 
          sx={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          {translations.addButton}
        </Button>
      </Box>
      
      <Card variant="outlined" sx={{ height: 400, width: '100%' }}>
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
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#e0e0e0',
              borderBottom: '2px solid #e0e0e0',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #e0e0e0',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#e0e0e0',
            },
          }}
          initialState={{
            sorting: {
              sortModel: [{ field: 'start_date', sort: 'desc' }],
            },
          }}
        />
      </Card>
      
      {/* Commenting out Energy Consumption Charts section for now
      
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
      
      {/* Energy Consumption Modal */}
      <EnergyConsumptionModal
        open={open}
        handleClose={handleClose}
        projectUuid={projectUuid}
        buildingUuid={buildingUuid}
        onSubmitSuccess={fetchConsumptions}
        editItem={editItem}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
      >
        <DialogTitle>{translations.deleteDialog?.title || "Delete Energy Consumption"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {translations.deleteDialog?.message || "Are you sure you want to delete this energy consumption record? This action cannot be undone."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            {translations.deleteDialog?.cancel || "Cancel"}
          </Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            {translations.deleteDialog?.confirm || "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EnergyProfileTabContent;