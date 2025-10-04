import React, { useState } from "react";
import EnergyProfileTabContent from "./EnergyProfileTabContent";
import SystemsTabContent from "./SystemsTabContent";
import ThermalZoneTabContent from "./ThermalZoneTabContent";
import ElectricalConsumptionTabContent from "./ElectricalConsumptionTabContent";
import ScenariosTabContent from "./ScenariosTabContent";
import ResultsTabContent from "./ResultsTabContent";
import ImagesTabContent from "./ImagesTabContent";
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
    params.electricalConsumptions,
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
      <div className="relative bg-gray-100 rounded-xl p-1.5 mb-6 shadow-inner">
        <div className="flex relative gap-1">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`flex-1 py-4 px-6 text-sm font-semibold rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 ${
                activeTab === index
                  ? "text-white bg-primary shadow-lg transform scale-[1.02] border-2 border-primary"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/70 bg-transparent"
              }`}
              onClick={() => setActiveTab(index)}>
              <span
                className={`${
                  activeTab === index ? "font-bold" : "font-medium"
                }`}>
                {tab}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 min-h-[400px]">
          {activeTab === 0 && (
            <div className="animate-fadeIn">
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
            </div>
          )}
          {activeTab === 1 && (
            <div className="animate-fadeIn">
              <SystemsTabContent
                buildingUuid={buildingUuid}
                projectUuid={projectUuid}
                buildingData={buildingData}
                params={params}
              />
            </div>
          )}
          {activeTab === 2 && (
            <div className="animate-fadeIn">
              <ThermalZoneTabContent
                buildingUuid={buildingUuid}
                projectUuid={projectUuid}
                buildingData={buildingData}
                params={params}
              />
            </div>
          )}
          {activeTab === 3 && (
            <div className="animate-fadeIn">
              <ElectricalConsumptionTabContent
                buildingUuid={buildingUuid}
                projectUuid={projectUuid}
                buildingData={buildingData}
                params={params}
              />
            </div>
          )}
          {activeTab === 4 && (
            <div className="animate-fadeIn">
              <ScenariosTabContent
                buildingUuid={buildingUuid}
                projectUuid={projectUuid}
                buildingData={buildingData}
                params={params}
              />
            </div>
          )}
          {activeTab === 5 && (
            <div className="animate-fadeIn">
              <ResultsTabContent
                buildingUuid={buildingUuid}
                projectUuid={projectUuid}
                buildingData={buildingData}
                params={params}
              />
            </div>
          )}
          {activeTab === 6 && (
            <div className="animate-fadeIn">
              <ImagesTabContent
                buildingUuid={buildingUuid}
                projectUuid={projectUuid}
                buildingData={buildingData}
                params={params}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuildingTabs;
