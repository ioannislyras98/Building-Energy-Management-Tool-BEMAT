// Simple test component
import React from "react";

const ThermalInsulationTabContent = ({
  buildingUuid,
  projectUuid,
  buildingData,
  params,
}) => {
  return (
    <div>
      <h2>Thermal Insulation Tab Content</h2>
      <p>Building UUID: {buildingUuid}</p>
      <p>This is a test component to verify export works correctly.</p>
    </div>
  );
};

export default ThermalInsulationTabContent;
