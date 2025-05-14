import React, { useState } from 'react';
import EnergyProfileTabContent from './EnergyProfileTabContent';
import { ThemeProvider, createTheme } from '@mui/material/styles';
// Replace Admin with core providers
import { AdminContext, ResourceContextProvider, Resource } from 'react-admin';

// Create a simple data provider that will just pass through our data
const dataProvider = {
  // This method returns a list of resources with pagination
  getList: (resource, params) => {
    return Promise.resolve({
      data: [], // This will be replaced in EnergyProfileTabContent
      total: 0
    });
  },
  // These are required methods for react-admin
  getOne: () => Promise.resolve({ data: {} }),
  getMany: () => Promise.resolve({ data: [] }),
  getManyReference: () => Promise.resolve({ data: [], total: 0 }),
  create: () => Promise.resolve({ data: {} }),
  update: () => Promise.resolve({ data: {} }),
  updateMany: () => Promise.resolve({ data: [] }),
  delete: () => Promise.resolve({ data: {} }),
  deleteMany: () => Promise.resolve({ data: [] }),
};

const defaultTheme = createTheme();

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

  // Ensure params and its properties are defined before trying to access them
  const energyProfileParams = {
    content: params?.energyProfileContent,
    addConsumptionBtn: params?.addEnergyConsumptionButton || "Add Energy Consumption",
    // Add other necessary translations from params if needed by EnergyProfileTabContent
  };

  return (
    <div className="w-full">
      <div className="flex border-b">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`py-2 px-4 font-medium ${activeTab === index ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab(index)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="p-4">
        {activeTab === 0 && (
          // Replace Admin with AdminContext which doesn't set up routing
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
        {activeTab === 1 && <div>{params?.systemsContent || 'Systems content not available.'}</div>}
        {activeTab === 2 && <div>{params?.thermalZonesContent || 'Thermal zones content not available.'}</div>}
        {activeTab === 3 && <div>{params?.scenariosContent || 'Scenarios content not available.'}</div>}
        {activeTab === 4 && <div>{params?.resultsContent || 'Results content not available.'}</div>}
        {activeTab === 5 && <div>{params?.imagesContent || 'Images content not available.'}</div>}
      </div>
    </div>
  );
};

export default BuildingTabs;