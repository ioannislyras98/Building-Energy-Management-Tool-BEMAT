import { useProgress } from '../context/ProgressContext';

export const useProgressRefresh = () => {
  const { triggerProgressRefresh } = useProgress();

  const refreshAfterSystemChange = () => {
    triggerProgressRefresh();
  };

  const refreshAfterScenarioChange = () => {
    triggerProgressRefresh();
  };

  return {
    refreshAfterSystemChange,
    refreshAfterScenarioChange,
    triggerProgressRefresh
  };
};
