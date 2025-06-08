import React, { useState } from "react";
import EnergyProfileTabContent from "./EnergyProfileTabContent";
import SystemsTabContent from "./SystemsTabContent";
import { AdminContext, ResourceContextProvider, Resource } from "react-admin";
import { defaultTheme } from "../../utils/theme";
const dataProvider = {
  getList: (resource, params) => {
    return Promise.resolve({
      data: [],
      total: 0,
    });
  },
  getOne: () => Promise.resolve({ data: {} }),
  getMany: () => Promise.resolve({ data: [] }),
  getManyReference: () => Promise.resolve({ data: [], total: 0 }),
  create: () => Promise.resolve({ data: {} }),
  update: () => Promise.resolve({ data: {} }),
  updateMany: () => Promise.resolve({ data: [] }),
  delete: () => Promise.resolve({ data: {} }),
  deleteMany: () => Promise.resolve({ data: [] }),
};

const BuildingTabs = ({ params, buildingUuid, projectUuid, buildingData }) => {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    params.energyProfile,
    params.systems,
    params.thermalZones,
    params.scenarios,
    params.results,
    params.images,
  ];
  const energyProfileParams = {
    content: params?.energyProfileContent,
    addConsumptionBtn:
      params?.addEnergyConsumptionButton || "Add Energy Consumption",
  };

  return (
    <div className="w-full">
      <div className="flex border-b">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`py-2 px-4 font-medium ${
              activeTab === index
                ? "border-b-2 border-primary text-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab(index)}>
            {tab}
          </button>
        ))}
      </div>
      <div className="p-4">
        {activeTab === 0 && (
          <AdminContext dataProvider={dataProvider} theme={defaultTheme}>
            <ResourceContextProvider value="energy_consumptions">
              <EnergyProfileTabContent
                buildingUuid={buildingUuid}
                projectUuid={projectUuid}
                buildingData={buildingData}
                params={energyProfileParams}
              />
            </ResourceContextProvider>
          </AdminContext>
        )}
        {activeTab === 1 && (
          <SystemsTabContent
            buildingUuid={buildingUuid}
            projectUuid={projectUuid}
            buildingData={buildingData}
            params={params}
          />
        )}
        {activeTab === 2 && (
          <div>
            {params?.thermalZonesContent ||
              "Thermal zones content not available."}
          </div>
        )}
        {activeTab === 3 && (
          <div>
            {params?.scenariosContent || "Scenarios content not available."}
          </div>
        )}
        {activeTab === 4 && (
          <div>
            {params?.resultsContent || "Results content not available."}
          </div>
        )}
        {activeTab === 5 && (
          <div>{params?.imagesContent || "Images content not available."}</div>
        )}
      </div>
    </div>
  );
};

export default BuildingTabs;
