import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Divider,
} from "@mui/material";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import AddIcon from "@mui/icons-material/Add";
import ThermalInsulationTabContent from "./ThermalInsulationTabContent";

import { useLanguage } from "../../context/LanguageContext";
import english_text from "../../languages/english.json";
import greek_text from "../../languages/greek.json";

const ScenariosTabContent = ({
  buildingUuid,
  projectUuid,
  buildingData,
  params,
}) => {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const { language } = useLanguage();
  const translations =
    language === "en"
      ? english_text.ScenariosTabContent || {}
      : greek_text.ScenariosTabContent || {};  const scenarioTypes = [
    {
      id: "thermal-insulation",
      title:
        translations.thermalInsulation || "Θερμομόνωση Εξωτερικής Τοιχοποιίας",
      description:
        translations.thermalInsulationDesc ||
        "Ανάλυση και βελτιστοποίηση θερμομόνωσης των εξωτερικών τοίχων",
      icon: <ThermostatIcon className="w-8 h-8" />,
      color: "from-blue-500 to-blue-600",
      disabled: false,
    },
    // Μπορούμε να προσθέσουμε άλλα σενάρια στο μέλλον
  ];  const handleScenarioSelect = (scenarioId) => {
    setSelectedScenario(scenarioId);
  };

  const handleBackToScenarios = () => {
    setSelectedScenario(null);
  };  if (selectedScenario) {
    if (selectedScenario === "thermal-insulation") {
      return (
        <div>
          <div className="mb-4">
            <Button
              variant="contained"
              color="primary"
              onClick={handleBackToScenarios}
              sx={{
                mb: 2,
                backgroundColor: "var(--color-primary)",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "var(--color-primary)",
                  opacity: 0.8,
                },
              }}>
              {translations.backToScenarios || "← Επιστροφή στα Σενάρια"}
            </Button>
          </div>
          <ThermalInsulationTabContent
            buildingUuid={buildingUuid}
            projectUuid={projectUuid}
            buildingData={buildingData}
            params={params}
          />
        </div>
      );
    }
    
    // For future scenarios
    return (
      <div>
        <div className="mb-4">
          <Button
            variant="contained"
            color="primary"
            onClick={handleBackToScenarios}
            sx={{
              mb: 2,
              backgroundColor: "var(--color-primary)",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "var(--color-primary)",
                opacity: 0.8,
              },
            }}>
            {translations.backToScenarios || "← Επιστροφή στα Σενάρια"}
          </Button>
        </div>
        <Typography variant="h6">
          Scenario implementation for {selectedScenario}
        </Typography>
      </div>
    );
  }

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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </span>
          {translations.title || "Σενάρια Ενεργειακής Αναβάθμισης"}
        </h2>
        <Typography variant="body1" className="text-gray-600 mt-2">
          {translations.subtitle ||
            "Επιλέξτε ένα σενάριο για ανάλυση και βελτιστοποίηση"}
        </Typography>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <Grid container spacing={4}>
          {scenarioTypes.map((scenario) => (
            <Grid item xs={12} md={6} lg={4} key={scenario.id}>              <Card
                className="h-full cursor-pointer transform hover:scale-105 hover:shadow-xl transition-transform"
                onClick={() => handleScenarioSelect(scenario.id)}
                sx={{
                  background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)`,
                  color: "white",
                  "&:hover": {
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  },
                }}><CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-white/20 p-3 rounded-full mr-4">
                      {scenario.icon}
                    </div>
                    <Typography variant="h6" className="font-bold">
                      {scenario.title}
                    </Typography>
                  </div>
                  <Typography variant="body2" className="opacity-90">
                    {scenario.description}
                  </Typography>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<AddIcon />}
                      sx={{
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.3)",
                        },
                      }}>
                      {translations.edit || "Επεξεργασία"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  );
};

export default ScenariosTabContent;
