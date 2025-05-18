import React, { useState } from 'react';

const SystemsTabContent = ({ buildingUuid, projectUuid, buildingData, params }) => {
  // Mock state for whether systems have data or not
  const [systems, setSystems] = useState({
    boiler: false,
    cooling: false,
    heating: false,
    hotWater: false,
    solarCollectors: false
  });

  const handleAddSystem = (system) => {
    // This would be replaced with actual functionality to add a system
    console.log(`Adding ${system} system`);
    setSystems(prev => ({ ...prev, [system]: true }));
  };

  const handleEditSystem = (system) => {
    // This would be replaced with actual functionality to edit a system
    console.log(`Editing ${system} system`);
  };

  // Get translations from params or use empty object if not available
  const translations = params?.tabs?.systemsContent || {};

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{translations.title || "Building Systems"}</h2>
      
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{translations.boiler || "Boiler Details"}</h3>
          {systems.boiler ? (
            <button 
              onClick={() => handleEditSystem('boiler')}
              className="text-blue-600 hover:text-blue-800"
            >
              {translations.edit || "Edit"}
            </button>
          ) : null}
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{translations.cooling || "Cooling System"}</h3>
        </div>
        {!systems.cooling && (
          <button 
            onClick={() => handleAddSystem('cooling')}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            {translations.add || "Add"}
          </button>
        )}
      </div>
      
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{translations.heating || "Heating System"}</h3>
        </div>
        {!systems.heating && (
          <button 
            onClick={() => handleAddSystem('heating')}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            {translations.add || "Add"}
          </button>
        )}
      </div>
      
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{translations.hotWater || "Hot Water System (HWS)"}</h3>
        </div>
        {!systems.hotWater && (
          <button 
            onClick={() => handleAddSystem('hotWater')}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            {translations.add || "Add"}
          </button>
        )}
      </div>
      
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{translations.solarCollectors || "Solar Collectors"}</h3>
        </div>
        {!systems.solarCollectors && (
          <button 
            onClick={() => handleAddSystem('solarCollectors')}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            {translations.add || "Add"}
          </button>
        )}
      </div>
    </div>
  );
};

export default SystemsTabContent;
