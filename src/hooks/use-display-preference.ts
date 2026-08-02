import { useSettings, type DisplayPreferences } from "@/contexts/SettingsContext";

export const useDisplayPreference = (section: keyof DisplayPreferences) => {
  const { settings } = useSettings();
  const currentView = settings.displayPreferences[section];

  return {
    currentView,
    isTableView: currentView === "table",
    isCardsView: currentView === "cards",
    isCalendarView: currentView === "calendar",
    isListView: currentView === "list" || currentView === "table" || currentView === "cards",
  };
};
