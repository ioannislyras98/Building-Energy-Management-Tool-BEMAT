import React, { useState } from "react";
import EnergyProfileTabContent from "./EnergyProfileTabContent";
import SystemsTabContent from "./SystemsTabContent";
import ThermalZoneTabContent from "./ThermalZoneTabContent";
import ElectricalConsumptionTabContent from "./ElectricalConsumptionTabContent";
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
              <div className="flex items-center justify-center h-32 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="text-center">
                  <svg
                    className="mx-auto h-8 w-8 text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <p className="text-sm font-medium">
                    {params?.scenariosContent ||
                      "Scenarios content not available."}
                  </p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 5 && (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-center h-32 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="text-center">
                  <svg
                    className="mx-auto h-8 w-8 text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm font-medium">
                    {params?.resultsContent || "Results content not available."}
                  </p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 6 && (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-center h-32 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="text-center">
                  <svg
                    className="mx-auto h-8 w-8 text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm font-medium">
                    {params?.imagesContent || "Images content not available."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuildingTabs;
