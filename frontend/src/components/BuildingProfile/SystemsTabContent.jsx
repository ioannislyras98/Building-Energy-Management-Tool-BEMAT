import React, { useState, useEffect } from "react";
import { useProgress } from "../../context/ProgressContext";
import BoilerDetailModal from "../../modals/systems/BoilerDetailModal";
import CoolingSystemModal from "../../modals/systems/CoolingSystemModal";
import HeatingSystemModal from "../../modals/systems/HeatingSystemModal";
import HotWaterSystemModal from "../../modals/systems/HotWaterSystemModal";
import SolarCollectorsModal from "../../modals/systems/SolarCollectorsModal";
import ConfirmationDialog from "../dialogs/ConfirmationDialog";
import {
  getBoilerDetailsByBuilding,
  getCoolingSystemByBuilding,
  getHeatingSystemByBuilding,
  getHotWaterSystemByBuilding,
  getSolarCollectorsByBuilding,
  deleteBoilerDetail,
  deleteCoolingSystem,
  deleteHeatingSystem,
  deleteHotWaterSystem,
  deleteSolarCollectors,
} from "../../../services/ApiService";

const SystemsTabContent = ({
  buildingUuid,
  projectUuid,
  buildingData,
  params,
}) => {
  const { triggerProgressRefresh } = useProgress();

  const [systems, setSystems] = useState({
    boiler: null,
    cooling: null,
    heating: null,
    hotWater: null,
    solarCollectors: null,
  });

  const [modals, setModals] = useState({
    boiler: { open: false, editItem: null },
    cooling: { open: false, editItem: null },
    heating: { open: false, editItem: null },
    hotWater: { open: false, editItem: null },
    solarCollectors: { open: false, editItem: null },
  });

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    systemType: null,
    systemData: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (buildingUuid) {
      fetchSystemsData();
    }
  }, [buildingUuid]);

  const fetchSystemsData = async () => {
    setLoading(true);
    try {
      const promises = [
        fetchBoilerData(),
        fetchCoolingData(),
        fetchHeatingData(),
        fetchHotWaterData(),
        fetchSolarCollectorsData(),
      ];

      await Promise.all(promises);
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  const fetchBoilerData = async () => {
    try {
      const response = await getBoilerDetailsByBuilding(buildingUuid);
      const boilerData =
        response.data && response.data.length > 0 ? response.data[0] : null;
      setSystems((prev) => ({ ...prev, boiler: boilerData }));
    } catch (error) {
      setSystems((prev) => ({ ...prev, boiler: null }));
    }
  };

  const fetchCoolingData = async () => {
    try {
      const response = await getCoolingSystemByBuilding(buildingUuid);
      const coolingData =
        response.data && response.data.length > 0 ? response.data[0] : null;
      setSystems((prev) => ({ ...prev, cooling: coolingData }));
    } catch (error) {
      setSystems((prev) => ({ ...prev, cooling: null }));
    }
  };

  const fetchHeatingData = async () => {
    try {
      const response = await getHeatingSystemByBuilding(buildingUuid);
      const heatingData =
        response.data && response.data.length > 0 ? response.data[0] : null;
      setSystems((prev) => ({ ...prev, heating: heatingData }));
    } catch (error) {
      setSystems((prev) => ({ ...prev, heating: null }));
    }
  };

  const fetchHotWaterData = async () => {
    try {
      const response = await getHotWaterSystemByBuilding(buildingUuid);
      const hotWaterData =
        response.data && response.data.length > 0 ? response.data[0] : null;
      setSystems((prev) => ({ ...prev, hotWater: hotWaterData }));
    } catch (error) {
      setSystems((prev) => ({ ...prev, hotWater: null }));
    }
  };

  const fetchSolarCollectorsData = async () => {
    try {
      const response = await getSolarCollectorsByBuilding(buildingUuid);
      const solarData =
        response.data && response.data.length > 0 ? response.data[0] : null;
      setSystems((prev) => ({ ...prev, solarCollectors: solarData }));
    } catch (error) {
      setSystems((prev) => ({ ...prev, solarCollectors: null }));
    }
  };

  const handleOpenModal = (systemType, editItem = null) => {
    setModals((prev) => ({
      ...prev,
      [systemType]: { open: true, editItem },
    }));
  };

  const handleCloseModal = (systemType) => {
    setModals((prev) => ({
      ...prev,
      [systemType]: { open: false, editItem: null },
    }));
  };

  const handleModalSuccess = (systemType) => {
    handleCloseModal(systemType);
    fetchSystemsData(); // Refresh data after successful operation
    triggerProgressRefresh(); // Trigger progress refresh in all components
  };

  const handleDeleteSystem = (systemType, systemData) => {
    setDeleteDialog({
      open: true,
      systemType,
      systemData,
    });
  };

  const confirmDelete = async () => {
    const { systemType, systemData } = deleteDialog;
    if (!systemData) return;

    const deleteFunctions = {
      boiler: deleteBoilerDetail,
      cooling: deleteCoolingSystem,
      heating: deleteHeatingSystem,
      hotWater: deleteHotWaterSystem,
      solarCollectors: deleteSolarCollectors,
    };

    try {
      await deleteFunctions[systemType](systemData.uuid);
      setSystems((prev) => ({ ...prev, [systemType]: null }));
      setDeleteDialog({ open: false, systemType: null, systemData: null });
      triggerProgressRefresh();
    } catch (error) {
      setDeleteDialog({ open: false, systemType: null, systemData: null });
    }
  };

  const translations = params?.systemsContent || {};

  const renderSystemCard = (systemType, title, systemData) => {
    const hasData = !!systemData;

    return (
      <div
        key={systemType}
        className="bg-white shadow-lg rounded-xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <div className="flex space-x-3">
            {hasData ? (
              <>
                <button
                  onClick={() => handleOpenModal(systemType, systemData)}
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2">
                  {translations.edit || "Edit"}
                </button>
                <button
                  onClick={() => handleDeleteSystem(systemType, systemData)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                  {translations.delete || "Delete"}
                </button>
              </>
            ) : (
              <button
                onClick={() => handleOpenModal(systemType)}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2">
                {translations.add || "Add"}
              </button>
            )}
          </div>
        </div>

        {hasData ? (
          <div className="space-y-3 bg-gray-50 rounded-lg p-4">
            {renderSystemDetails(systemType, systemData)}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-500 italic text-lg">
              {translations.noData || "No system data available"}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderSystemDetails = (systemType, data) => {
    const labels = translations.labels || {};

    switch (systemType) {
      case "boiler":
        return (
          <>
            {data.nominal_power && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-gray-600 font-medium">
                  {labels.nominalPowerLabel || "Ονομαστική Ισχύς:"}
                </span>
                <span className="font-semibold text-gray-900 bg-green-100 px-3 py-1 rounded-full text-sm">
                  {data.nominal_power} kW
                </span>
              </div>
            )}
            {data.internal_efficiency && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-gray-600 font-medium">
                  {labels.efficiencyLabel || "Βαθμός Απόδοσης:"}
                </span>
                <span className="font-semibold text-gray-900 bg-green-100 px-3 py-1 rounded-full text-sm">
                  {data.internal_efficiency}%
                </span>
              </div>
            )}
            {data.fuel_type && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-gray-600 font-medium">
                  {labels.fuelTypeLabel || "Είδος Καυσίμου:"}
                </span>
                <span className="font-semibold text-gray-900 bg-green-100 px-3 py-1 rounded-full text-sm">
                  {data.fuel_type}
                </span>
              </div>
            )}
            {data.manufacturing_year && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-gray-600 font-medium">
                  {labels.manufacturingYearLabel || "Έτος Κατασκευής:"}
                </span>
                <span className="font-semibold text-gray-900 bg-green-100 px-3 py-1 rounded-full text-sm">
                  {data.manufacturing_year}
                </span>
              </div>
            )}
          </>
        );

      case "cooling":
        return (
          <>
            {data.cooling_system_type && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-gray-600 font-medium">
                  {labels.systemTypeLabel || "Τύπος Συστήματος:"}
                </span>
                <span className="font-semibold text-gray-900 bg-green-100 px-3 py-1 rounded-full text-sm">
                  {data.cooling_system_type_display || data.cooling_system_type}
                </span>
              </div>
            )}
            {data.power_kw && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-gray-600 font-medium">
                  {labels.powerLabel || "Ισχύς:"}
                </span>
                <span className="font-semibold text-gray-900 bg-green-100 px-3 py-1 rounded-full text-sm">
                  {data.power_kw} kW
                </span>
              </div>
            )}
            {data.energy_efficiency_ratio && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-gray-600 font-medium">
                  {labels.eerLabel || "EER:"}
                </span>
                <span className="font-semibold text-gray-900 bg-green-100 px-3 py-1 rounded-full text-sm">
                  {data.energy_efficiency_ratio}
                </span>
              </div>
            )}
            {data.construction_year && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-gray-600 font-medium">
                  {labels.constructionYearLabel || "Έτος Κατασκευής:"}
                </span>
                <span className="font-semibold text-gray-900 bg-green-100 px-3 py-1 rounded-full text-sm">
                  {data.construction_year}
                </span>
              </div>
            )}
          </>
        );

      case "heating":
        return (
          <>
            {data.heating_system_type && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-gray-600 font-medium">
                  {labels.systemTypeLabel || "Τύπος Συστήματος:"}
                </span>
                <span className="font-semibold text-gray-900 bg-green-100 px-3 py-1 rounded-full text-sm">
                  {data.heating_system_type}
                </span>
              </div>
            )}
            {data.power_kw && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-gray-600 font-medium">
                  {labels.powerLabel || "Ισχύς:"}
                </span>
                <span className="font-semibold text-gray-900 bg-green-100 px-3 py-1 rounded-full text-sm">
                  {data.power_kw} kW
                </span>
              </div>
            )}
            {data.cop && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-gray-600 font-medium">
                  {labels.copLabel || "COP:"}
                </span>
                <span className="font-semibold text-gray-900 bg-green-100 px-3 py-1 rounded-full text-sm">
                  {data.cop}
                </span>
              </div>
            )}
            {data.construction_year && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-gray-600 font-medium">
                  {labels.constructionYearLabel || "Έτος Κατασκευής:"}
                </span>
                <span className="font-semibold text-gray-900 bg-green-100 px-3 py-1 rounded-full text-sm">
                  {data.construction_year}
                </span>
              </div>
            )}
          </>
        );

      case "hotWater":
        return (
          <>
            {data.heating_system_type && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-gray-600 font-medium">
                  {labels.systemTypeLabel || "Τύπος Συστήματος:"}
                </span>
                <span className="font-semibold text-gray-900 bg-green-100 px-3 py-1 rounded-full text-sm">
                  {data.heating_system_type}
                </span>
              </div>
            )}
            {data.power_kw && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-gray-600 font-medium">
                  {labels.powerLabel || "Ισχύς:"}
                </span>
                <span className="font-semibold text-gray-900 bg-green-100 px-3 py-1 rounded-full text-sm">
                  {data.power_kw} kW
                </span>
              </div>
            )}
            {data.thermal_efficiency && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-gray-600 font-medium">
                  {labels.thermalEfficiencyLabel || "Θερμικός Βαθμός Απόδοσης:"}
                </span>
                <span className="font-semibold text-gray-900 bg-green-100 px-3 py-1 rounded-full text-sm">
                  {data.thermal_efficiency}%
                </span>
              </div>
            )}
            {data.boiler_type && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-gray-600 font-medium">
                  {labels.boilerTypeLabel || "Τύπος Λέβητα:"}
                </span>
                <span className="font-semibold text-gray-900 bg-green-100 px-3 py-1 rounded-full text-sm">
                  {data.boiler_type}
                </span>
              </div>
            )}
          </>
        );

      case "solarCollectors":
        return (
          <>
            {data.solar_collector_usage && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-gray-600 font-medium">
                  {labels.usageLabel || "Χρήση:"}
                </span>
                <span className="font-semibold text-gray-900 bg-green-100 px-3 py-1 rounded-full text-sm">
                  {data.solar_collector_usage}
                </span>
              </div>
            )}
            {data.solar_collector_type && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-gray-600 font-medium">
                  {labels.typeLabel || "Τύπος:"}
                </span>
                <span className="font-semibold text-gray-900 bg-green-100 px-3 py-1 rounded-full text-sm">
                  {data.solar_collector_type}
                </span>
              </div>
            )}
            {data.collector_surface_area && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-gray-600 font-medium">
                  {labels.surfaceAreaLabel || "Επιφάνεια:"}
                </span>
                <span className="font-semibold text-gray-900 bg-green-100 px-3 py-1 rounded-full text-sm">
                  {data.collector_surface_area} m²
                </span>
              </div>
            )}
            {data.hot_water_storage_capacity && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-gray-600 font-medium">
                  {labels.storageCapacityLabel || "Χωρητικότητα Ζ.Ν.Χ.:"}
                </span>
                <span className="font-semibold text-gray-900 bg-green-100 px-3 py-1 rounded-full text-sm">
                  {data.hot_water_storage_capacity} L
                </span>
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg text-gray-600">Loading systems data...</div>
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </span>
          {translations.title || "Building Systems"}
        </h2>
      </div>

      {renderSystemCard(
        "boiler",
        translations.boiler || "Boiler Details",
        systems.boiler
      )}
      {renderSystemCard(
        "cooling",
        translations.cooling || "Cooling System",
        systems.cooling
      )}
      {renderSystemCard(
        "heating",
        translations.heating || "Heating System",
        systems.heating
      )}
      {renderSystemCard(
        "hotWater",
        translations.hotWater || "Hot Water System (HWS)",
        systems.hotWater
      )}
      {renderSystemCard(
        "solarCollectors",
        translations.solarCollectors || "Solar Collectors",
        systems.solarCollectors
      )}

      <BoilerDetailModal
        open={modals.boiler.open}
        onClose={() => handleCloseModal("boiler")}
        projectUuid={projectUuid}
        buildingUuid={buildingUuid}
        onSubmitSuccess={() => handleModalSuccess("boiler")}
        editItem={modals.boiler.editItem}
      />

      <CoolingSystemModal
        open={modals.cooling.open}
        onClose={() => handleCloseModal("cooling")}
        projectUuid={projectUuid}
        buildingUuid={buildingUuid}
        onSubmitSuccess={() => handleModalSuccess("cooling")}
        editItem={modals.cooling.editItem}
      />

      <HeatingSystemModal
        open={modals.heating.open}
        onClose={() => handleCloseModal("heating")}
        projectUuid={projectUuid}
        buildingUuid={buildingUuid}
        onSubmitSuccess={() => handleModalSuccess("heating")}
        editItem={modals.heating.editItem}
      />

      <HotWaterSystemModal
        open={modals.hotWater.open}
        onClose={() => handleCloseModal("hotWater")}
        projectUuid={projectUuid}
        buildingUuid={buildingUuid}
        onSubmitSuccess={() => handleModalSuccess("hotWater")}
        editItem={modals.hotWater.editItem}
      />

      <SolarCollectorsModal
        open={modals.solarCollectors.open}
        onClose={() => handleCloseModal("solarCollectors")}
        projectUuid={projectUuid}
        buildingUuid={buildingUuid}
        onSubmitSuccess={() => handleModalSuccess("solarCollectors")}
        editItem={modals.solarCollectors.editItem}
      />

      <ConfirmationDialog
        open={deleteDialog.open}
        onClose={() =>
          setDeleteDialog({ open: false, systemType: null, systemData: null })
        }
        onConfirm={confirmDelete}
        title={translations.deleteTitle || "Delete System"}
        message={
          translations.deleteMessage ||
          "Are you sure you want to delete this system? This action cannot be undone."
        }
        confirmText={translations.delete || "Delete"}
        cancelText={translations.cancel || "Cancel"}
      />
    </div>
  );
};

export default SystemsTabContent;
