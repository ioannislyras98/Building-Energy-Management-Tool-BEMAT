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
import SolarPowerIcon from "@mui/icons-material/SolarPower";
import WindowIcon from "@mui/icons-material/Window";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import ViewComfyIcon from "@mui/icons-material/ViewComfy";
import LightModeIcon from "@mui/icons-material/LightMode";
import FireplaceIcon from "@mui/icons-material/Fireplace";
import ThermalInsulationTabContent from "./ThermalInsulationTabContent";
import RoofThermalInsulationTabContent from "./RoofThermalInsulationTabContent";
import PhotovoltaicSystemTabContent from "./PhotovoltaicSystemTabContent";
import WindowReplacementTabContent from "./WindowReplacementTabContent";
import BulbReplacementTabContent from "./BulbReplacementTabContent";
import AirConditioningReplacementTabContent from "./AirConditioningReplacementTabContent";
import HotWaterUpgradeTabContent from "./HotWaterUpgradeTabContent";
import NaturalGasNetworkTabContent from "./NaturalGasNetworkTabContent";
import ExteriorBlindsTabContent from "./ExteriorBlindsTabContent";
import AutomaticLightingControlTabContent from "./AutomaticLightingControlTabContent";
import BoilerReplacementTabContent from "./BoilerReplacementTabContent";

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
      : greek_text.ScenariosTabContent || {};
  const scenarioTypes = [
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
    {
      id: "roof-thermal-insulation",
      title: translations.roofThermalInsulation || "Θερμομόνωση Οροφής",
      description:
        translations.roofThermalInsulationDesc ||
        "Ανάλυση και βελτιστοποίηση θερμομόνωσης της οροφής",
      icon: <ThermostatIcon className="w-8 h-8" />,
      color: "from-green-500 to-green-600",
      disabled: false,
    },
    {
      id: "photovoltaic-systems",
      title: translations.photovoltaicSystems || "Φωτοβολταϊκά Συστήματα",
      description:
        translations.photovoltaicSystemsDesc ||
        "Ανάλυση και σχεδιασμός φωτοβολταϊκών συστημάτων για ενεργειακή αυτονομία",
      icon: <SolarPowerIcon className="w-8 h-8" />,
      color: "from-yellow-500 to-orange-600",
      disabled: false,
    },
    {
      id: "window-replacement",
      title:
        translations.windowReplacement || "Αντικατάσταση παλαιών υαλοπινάκων",
      description:
        translations.windowReplacementDesc ||
        "Ανάλυση και υπολογισμός οφελών από την αντικατάσταση παλαιών υαλοπινάκων",
      icon: <WindowIcon className="w-8 h-8" />,
      color: "from-indigo-500 to-purple-600",
      disabled: false,
    },
    {
      id: "bulb-replacement",
      title:
        translations.bulbReplacement || "Αντικατάσταση λαμπτήρων πυράκτωσης",
      description:
        translations.bulbReplacementDesc ||
        "Ανάλυση και υπολογισμός οφελών από την αντικατάσταση λαμπτήρων πυράκτωσης με LED",
      icon: <LightbulbIcon className="w-8 h-8" />,
      color: "from-amber-500 to-yellow-600",
      disabled: false,
    },
    {
      id: "air-conditioning-replacement",
      title:
        translations.airConditioningReplacement ||
        "Αντικατάσταση κλιματιστικών",
      description:
        translations.airConditioningReplacementDesc ||
        "Ανάλυση και υπολογισμός οφελών από την αντικατάσταση παλαιών κλιματιστικών",
      icon: <AcUnitIcon className="w-8 h-8" />,
      color: "from-cyan-500 to-blue-600",
      disabled: false,
    },
    {
      id: "hot-water-upgrade",
      title:
        translations.hotWaterUpgrade ||
        "Αναβάθμιση συστήματος παραγωγής Ζ.Ν.Χ.",
      description:
        translations.hotWaterUpgradeDesc ||
        "Ανάλυση και υπολογισμός οφελών από την αναβάθμιση του συστήματος ζεστού νερού χρήσης",
      icon: <WaterDropIcon className="w-8 h-8" />,
      color: "from-orange-500 to-red-600",
      disabled: false,
    },
    {
      id: "natural-gas-network",
      title:
        translations.naturalGasNetwork ||
        "Εγκατάσταση δικτύου φυσικού αερίου",
      description:
        translations.naturalGasNetworkDesc ||
        "Ανάλυση και υπολογισμός οφελών από την εγκατάσταση δικτύου φυσικού αερίου",
      icon: <LocalGasStationIcon className="w-8 h-8" />,
      color: "from-emerald-500 to-teal-600",
      disabled: false,
    },
    {
      id: "exterior-blinds",
      title:
        translations.exteriorBlinds ||
        "Εγκατάσταση εξωτερικών περσίδων",
      description:
        translations.exteriorBlindsDesc ||
        "Ανάλυση και υπολογισμός οφελών από την εγκατάσταση εξωτερικών περσίδων",
      icon: <ViewComfyIcon className="w-8 h-8" />,
      color: "from-purple-500 to-indigo-600",
      disabled: false,
    },
    {
      id: "automatic-lighting-control",
      title:
        translations.automaticLightingControl ||
        "Εγκατάσταση συστήματος αυτόματου ελέγχου τεχνητού φωτισμού",
      description:
        translations.automaticLightingControlDesc ||
        "Ανάλυση και υπολογισμός οφελών από την εγκατάσταση συστήματος αυτόματου ελέγχου φωτισμού",
      icon: <LightModeIcon className="w-8 h-8" />,
      color: "from-pink-500 to-rose-600",
      disabled: false,
    },
    {
      id: "boiler-replacement",
      title:
        translations.boilerReplacement ||
        "Αντικατάσταση λέβητα",
      description:
        translations.boilerReplacementDesc ||
        "Ανάλυση και υπολογισμός οφελών από την αντικατάσταση λέβητα",
      icon: <FireplaceIcon className="w-8 h-8" />,
      color: "from-red-500 to-orange-600",
      disabled: false,
    },
    // Μπορούμε να προσθέσουμε άλλα σενάρια στο μέλλον
  ];
  const handleScenarioSelect = (scenarioId) => {
    setSelectedScenario(scenarioId);
  };

  const handleBackToScenarios = () => {
    setSelectedScenario(null);
  };
  if (selectedScenario) {
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

    if (selectedScenario === "roof-thermal-insulation") {
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
          <RoofThermalInsulationTabContent
            buildingUuid={buildingUuid}
            projectUuid={projectUuid}
            buildingData={buildingData}
            params={params}
          />
        </div>
      );
    }

    if (selectedScenario === "photovoltaic-systems") {
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
          <PhotovoltaicSystemTabContent
            buildingUuid={buildingUuid}
            projectUuid={projectUuid}
            buildingData={buildingData}
            params={params}
          />
        </div>
      );
    }

    if (selectedScenario === "window-replacement") {
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
          <WindowReplacementTabContent
            buildingUuid={buildingUuid}
            projectUuid={projectUuid}
            buildingData={buildingData}
            params={params}
          />
        </div>
      );
    }

    if (selectedScenario === "bulb-replacement") {
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
          <BulbReplacementTabContent
            buildingUuid={buildingUuid}
            projectUuid={projectUuid}
            buildingData={buildingData}
            params={params}
          />
        </div>
      );
    }

    if (selectedScenario === "air-conditioning-replacement") {
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
          <AirConditioningReplacementTabContent
            buildingUuid={buildingUuid}
            projectUuid={projectUuid}
            buildingData={buildingData}
            params={params}
          />
        </div>
      );
    }

    if (selectedScenario === "hot-water-upgrade") {
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
          <HotWaterUpgradeTabContent
            buildingUuid={buildingUuid}
            projectUuid={projectUuid}
            buildingData={buildingData}
            params={params}
          />
        </div>
      );
    }

    if (selectedScenario === "natural-gas-network") {
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
          <NaturalGasNetworkTabContent
            buildingUuid={buildingUuid}
            projectUuid={projectUuid}
            buildingData={buildingData}
            params={params}
          />
        </div>
      );
    }

    if (selectedScenario === "exterior-blinds") {
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
          <ExteriorBlindsTabContent
            buildingUuid={buildingUuid}
            projectUuid={projectUuid}
            buildingData={buildingData}
            params={params}
          />
        </div>
      );
    }

    if (selectedScenario === "automatic-lighting-control") {
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
          <AutomaticLightingControlTabContent
            buildingUuid={buildingUuid}
            projectUuid={projectUuid}
            buildingData={buildingData}
            params={params}
          />
        </div>
      );
    }

    if (selectedScenario === "boiler-replacement") {
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
          <BoilerReplacementTabContent
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
            <Grid item xs={12} md={6} lg={4} key={scenario.id}>
              {" "}
              <Card
                className="h-full cursor-pointer transform hover:scale-105 hover:shadow-xl transition-transform"
                onClick={() => handleScenarioSelect(scenario.id)}
                sx={{
                  background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)`,
                  color: "white",
                  "&:hover": {
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  },
                }}>
                <CardContent className="p-6">
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
