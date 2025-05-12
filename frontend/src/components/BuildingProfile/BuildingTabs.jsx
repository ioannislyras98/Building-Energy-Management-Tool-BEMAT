import React, { useState } from 'react';

const BuildingTabs = ({ params }) => {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    params.energyProfile,
    params.systems,
    params.thermalZones,
    params.scenarios,
    params.results,
    params.images,
  ];

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
        {/* Placeholder content for tabs */}
        {activeTab === 0 && <div>{params.energyProfileContent}</div>}
        {activeTab === 1 && <div>{params.systemsContent}</div>}
        {activeTab === 2 && <div>{params.thermalZonesContent}</div>}
        {activeTab === 3 && <div>{params.scenariosContent}</div>}
        {activeTab === 4 && <div>{params.resultsContent}</div>}
        {activeTab === 5 && <div>{params.imagesContent}</div>}
      </div>
    </div>
  );
};

export default BuildingTabs;