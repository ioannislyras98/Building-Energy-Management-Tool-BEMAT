import { useLanguage } from "../context/LanguageContext";
import english_text from "../languages/english.json";
import greek_text from "../languages/greek.json";

export const useAdminTranslations = () => {
  const { language } = useLanguage();

  return {
    dashboard:
      language === "en"
        ? english_text.AdminDashboard
        : greek_text.AdminDashboard,
    common:
      language === "en" ? english_text.AdminCommon : greek_text.AdminCommon,
    prefectures:
      language === "en"
        ? english_text.AdminPrefectures
        : greek_text.AdminPrefectures,
    thermalZones:
      language === "en"
        ? english_text.AdminThermalZones
        : greek_text.AdminThermalZones,
    materials:
      language === "en"
        ? english_text.AdminMaterials
        : greek_text.AdminMaterials,
  };
};
