import React, { useState, useEffect } from "react";
import Cookies from "universal-cookie";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  Visibility,
} from "@mui/icons-material";
import Thermostat from "@mui/icons-material/Thermostat";
import SolarPower from "@mui/icons-material/SolarPower";
import Widgets from "@mui/icons-material/Widgets";
import Lightbulb from "@mui/icons-material/Lightbulb";
import AcUnit from "@mui/icons-material/AcUnit";
import WaterDrop from "@mui/icons-material/WaterDrop";
import LocalGasStation from "@mui/icons-material/LocalGasStation";
import ViewComfy from "@mui/icons-material/ViewComfy";
import LightMode from "@mui/icons-material/LightMode";
import Fireplace from "@mui/icons-material/Fireplace";
import { useLanguage } from "../../context/LanguageContext";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";

const ResultsTabContent = ({
  buildingUuid,
  projectUuid,
  buildingData,
  params,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: 'net_present_value',
    direction: 'desc'
  });

  const { language } = useLanguage();
  const translations =
    language === "en"
      ? english_text.ResultsTabContent || {}
      : greek_text.ResultsTabContent || {};

  const cookies = new Cookies();
  const token = cookies.get("token");

  // Function to get scenario name based on language
  const getScenarioName = (key) => {
    const scenarioNames = {
      thermal_insulation: {
        gr: "Θερμομόνωση Εξωτερικής Τοιχοποιίας",
        en: "External Wall Thermal Insulation"
      },
      roof_thermal_insulation: {
        gr: "Θερμομόνωση Οροφής",
        en: "Roof Thermal Insulation"
      },
      photovoltaic_system: {
        gr: "Φωτοβολταϊκά Συστήματα",
        en: "Photovoltaic Systems"
      },
      window_replacement: {
        gr: "Αντικατάσταση Υαλοπινάκων",
        en: "Window Replacement"
      },
      bulb_replacement: {
        gr: "Αντικατάσταση Λαμπτήρων",
        en: "Bulb Replacement"
      },
      air_conditioning_replacement: {
        gr: "Αντικατάσταση Κλιματιστικών",
        en: "Air Conditioning Replacement"
      },
      hot_water_upgrade: {
        gr: "Αναβάθμιση Συστήματος Ζ.Ν.Χ.",
        en: "Hot Water System Upgrade"
      },
      natural_gas_network: {
        gr: "Εγκατάσταση Δικτύου Φυσικού Αερίου",
        en: "Natural Gas Network Installation"
      },
      exterior_blinds: {
        gr: "Εγκατάσταση Εξωτερικών Περσίδων",
        en: "Exterior Blinds Installation"
      },
      automatic_lighting_control: {
        gr: "Αυτόματος Έλεγχος Φωτισμού",
        en: "Automatic Lighting Control"
      },
      boiler_replacement: {
        gr: "Αντικατάσταση Λέβητα",
        en: "Boiler Replacement"
      }
    };
    
    return scenarioNames[key]?.[language === "en" ? "en" : "gr"] || key;
  };

  // Mapping των scenario types σε ελληνικά ονόματα και icons
  const scenarioConfig = {
    thermal_insulation: {
      name: getScenarioName("thermal_insulation"),
      icon: <Thermostat />,
      color: "#2196F3",
      endpoint: "thermal_insulation"
    },
    roof_thermal_insulation: {
      name: getScenarioName("roof_thermal_insulation"), 
      icon: <Thermostat />,
      color: "#4CAF50",
      endpoint: "roof_thermal_insulation"
    },
    photovoltaic_system: {
      name: getScenarioName("photovoltaic_system"),
      icon: <SolarPower />,
      color: "#FF9800",
      endpoint: "photovoltaic_system"
    },
    window_replacement: {
      name: getScenarioName("window_replacement"),
      icon: <Widgets />,
      color: "#9C27B0",
      endpoint: "window_replacement"
    },
    bulb_replacement: {
      name: getScenarioName("bulb_replacement"),
      icon: <Lightbulb />,
      color: "#FFC107",
      endpoint: "bulb_replacement"
    },
    air_conditioning_replacement: {
      name: getScenarioName("air_conditioning_replacement"),
      icon: <AcUnit />,
      color: "#00BCD4",
      endpoint: "air_conditioning_replacement"
    },
    hot_water_upgrade: {
      name: getScenarioName("hot_water_upgrade"),
      icon: <WaterDrop />,
      color: "#F44336",
      endpoint: "hot_water_upgrade"
    },
    natural_gas_network: {
      name: getScenarioName("natural_gas_network"),
      icon: <LocalGasStation />,
      color: "#009688",
      endpoint: "natural_gas_network"
    },
    exterior_blinds: {
      name: getScenarioName("exterior_blinds"),
      icon: <ViewComfy />,
      color: "#673AB7",
      endpoint: "exterior_blinds"
    },
    automatic_lighting_control: {
      name: getScenarioName("automatic_lighting_control"),
      icon: <LightMode />,
      color: "#E91E63",
      endpoint: "automatic_lighting_control"
    },
    boiler_replacement: {
      name: getScenarioName("boiler_replacement"),
      icon: <Fireplace />,
      color: "#FF5722",
      endpoint: "boiler_replacement"
    }
  };

  useEffect(() => {
    console.log("ResultsTabContent mounted with:", { buildingUuid, projectUuid });
    fetchAllScenarios();
  }, [buildingUuid, projectUuid]);

  const fetchAllScenarios = async () => {
    if (!buildingUuid || !projectUuid) return;

    console.log("Fetching scenarios for building:", buildingUuid);
    setLoading(true);
    setError(null);
    
    try {
      const scenarioData = [];
      
      // Fetch data για κάθε σενάριο
      for (const [key, config] of Object.entries(scenarioConfig)) {
        try {
          console.log(`Fetching ${config.name} from: http://127.0.0.1:8000/${config.endpoint}/building/${buildingUuid}/`);
          const response = await fetch(`http://127.0.0.1:8000/${config.endpoint}/building/${buildingUuid}/`, {
            method: "GET",
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`Data found for ${config.name}:`, data);
            scenarioData.push({
              type: key,
              name: config.name,
              icon: config.icon,
              color: config.color,
              ...data,
              // Διασφάλιση ότι όλα τα πεδία είναι αριθμοί
              total_investment_cost: parseFloat(data.total_investment_cost) || 0,
              annual_energy_savings: parseFloat(data.annual_energy_savings) || 0,
              annual_economic_benefit: parseFloat(data.annual_economic_benefit) || 0,
              payback_period: parseFloat(data.payback_period) || 0,
              net_present_value: parseFloat(data.net_present_value) || 0,
              internal_rate_of_return: parseFloat(data.internal_rate_of_return) || 0,
            });
          } else {
            console.log(`No data found for ${config.name} (${response.status})`);
          }
        } catch (error) {
          console.log(`Error fetching ${config.name}:`, error);
        }
      }

      console.log("All scenarios found:", scenarioData);
      setScenarios(scenarioData);
    } catch (error) {
      console.error("Error fetching scenarios:", error);
      setError("Σφάλμα κατά την φόρτωση των δεδομένων σεναρίων");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (property) => {
    const isAsc = sortConfig.key === property && sortConfig.direction === 'asc';
    setSortConfig({
      key: property,
      direction: isAsc ? 'desc' : 'asc'
    });
  };

  const sortedScenarios = React.useMemo(() => {
    if (!scenarios.length) return [];
    
    return [...scenarios].sort((a, b) => {
      const aValue = a[sortConfig.key] || 0;
      const bValue = b[sortConfig.key] || 0;
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [scenarios, sortConfig]);

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return "0 €";
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value, decimals = 1) => {
    if (!value || isNaN(value)) return "0";
    return parseFloat(value).toFixed(decimals);
  };

  const getScenarioStatusChip = (scenario) => {
    const npv = scenario.net_present_value || 0;
    const payback = scenario.payback_period || 0;
    
    if (npv > 0 && payback <= 10) {
      return (
        <Chip
          label={translations.excellent || "Εξαιρετικό"}
          size="small"
          sx={{ 
            backgroundColor: '#4CAF50', 
            color: 'white',
            fontWeight: 'bold'
          }}
        />
      );
    } else if (npv > 0 && payback <= 20) {
      return (
        <Chip
          label={translations.good || "Καλό"}
          size="small"
          sx={{ 
            backgroundColor: '#FF9800', 
            color: 'white',
            fontWeight: 'bold'
          }}
        />
      );
    } else if (npv > 0) {
      return (
        <Chip
          label={translations.acceptable || "Αποδεκτό"}
          size="small"
          sx={{ 
            backgroundColor: '#2196F3', 
            color: 'white',
            fontWeight: 'bold'
          }}
        />
      );
    } else {
      return (
        <Chip
          label={translations.unprofitable || "Μη συμφέρον"}
          size="small"
          sx={{ 
            backgroundColor: '#f44336', 
            color: 'white',
            fontWeight: 'bold'
          }}
        />
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <CircularProgress sx={{ color: "var(--color-primary)", mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            {translations.loading || "Φόρτωση αποτελεσμάτων..."}
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary">
        <div className="flex items-center space-x-3">
          <div className="bg-primary/10 p-3 rounded-full">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {translations.title || "Αποτελέσματα Σεναρίων"}
            </h2>
            <p className="text-gray-600 mt-1">
              {translations.subtitle || "Συγκεντρωτικά αποτελέσματα όλων των σεναρίων ενεργειακής εξοικονόμησης"}
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Results Table */}
      {scenarios.length > 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" className="mb-4 font-semibold">
              {translations.detailedResults || "Αναλυτικά Αποτελέσματα"}
            </Typography>
            
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>{translations.scenario || "Σενάριο"}</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>{translations.status || "Κατάσταση"}</strong>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={sortConfig.key === 'total_investment_cost'}
                        direction={sortConfig.key === 'total_investment_cost' ? sortConfig.direction : 'asc'}
                        onClick={() => handleSort('total_investment_cost')}
                      >
                        <strong>{translations.investmentCost || "Κόστος Επένδυσης"} (€)</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={sortConfig.key === 'annual_energy_savings'}
                        direction={sortConfig.key === 'annual_energy_savings' ? sortConfig.direction : 'asc'}
                        onClick={() => handleSort('annual_energy_savings')}
                      >
                        <strong>{translations.annualEnergySavings || "Ετήσια Εξοικονόμηση"} (€)</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={sortConfig.key === 'payback_period'}
                        direction={sortConfig.key === 'payback_period' ? sortConfig.direction : 'asc'}
                        onClick={() => handleSort('payback_period')}
                      >
                        <strong>{translations.paybackPeriod || "Αποπληρωμή"} ({translations.years || "έτη"})</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={sortConfig.key === 'net_present_value'}
                        direction={sortConfig.key === 'net_present_value' ? sortConfig.direction : 'asc'}
                        onClick={() => handleSort('net_present_value')}
                      >
                        <strong>{translations.npv || "NPV"} (€)</strong>
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">
                      <TableSortLabel
                        active={sortConfig.key === 'internal_rate_of_return'}
                        direction={sortConfig.key === 'internal_rate_of_return' ? sortConfig.direction : 'asc'}
                        onClick={() => handleSort('internal_rate_of_return')}
                      >
                        <strong>{translations.irr || "IRR"} (%)</strong>
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedScenarios.map((scenario, index) => (
                    <TableRow 
                      key={scenario.type}
                      sx={{ 
                        '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                        '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.08)' }
                      }}
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div style={{ color: scenario.color }}>
                            {scenario.icon}
                          </div>
                          <Typography variant="body2" className="font-medium">
                            {scenario.name}
                          </Typography>
                        </div>
                      </TableCell>
                      <TableCell align="center">
                        {getScenarioStatusChip(scenario)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          sx={{ color: 'red', fontWeight: 'bold' }}
                        >
                          {formatCurrency(scenario.total_investment_cost)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          sx={{ color: 'green', fontWeight: 'bold' }}
                        >
                          {formatCurrency(scenario.annual_energy_savings)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" className="font-medium">
                          {formatNumber(scenario.payback_period, 1)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: scenario.net_present_value >= 0 ? 'green' : 'red',
                            fontWeight: 'bold'
                          }}
                        >
                          {scenario.net_present_value >= 0 ? 
                            <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} /> : 
                            <TrendingDown sx={{ fontSize: 16, mr: 0.5 }} />
                          }
                          {formatCurrency(scenario.net_present_value)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" className="font-medium">
                          {formatNumber(scenario.internal_rate_of_return, 2)}%
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Typography variant="h6" color="text.secondary" className="mb-4">
              {translations.noData || "Δεν υπάρχουν συμπληρωμένα σενάρια"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {translations.noDataHelper || "Συμπληρώστε τουλάχιστον ένα σενάριο για να δείτε αποτελέσματα"}
            </Typography>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResultsTabContent;
