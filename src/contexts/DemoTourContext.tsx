import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { APP_DEMO_STEPS } from "@/lib/demoTour/steps";
import { DEMO_TOUR_STORAGE_KEY, type DemoTourStep } from "@/lib/demoTour/types";

type DemoTourContextValue = {
  active: boolean;
  stepIndex: number;
  step: DemoTourStep;
  totalSteps: number;
  startTour: (fromIndex?: number) => void;
  endTour: () => void;
  next: () => void;
  prev: () => void;
};

const DemoTourContext = createContext<DemoTourContextValue | null>(null);

function isMobileViewport() {
  return typeof window !== "undefined" && window.innerWidth < 768;
}

function shouldSkipStep(step: DemoTourStep) {
  if (step.mobileOnly && !isMobileViewport()) return true;
  return false;
}

function resolveStepIndex(index: number, direction: 1 | -1): number {
  let i = index;
  while (i >= 0 && i < APP_DEMO_STEPS.length) {
    if (!shouldSkipStep(APP_DEMO_STEPS[i])) return i;
    i += direction;
  }
  return Math.max(0, Math.min(APP_DEMO_STEPS.length - 1, i - direction));
}

export function DemoTourProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const step = APP_DEMO_STEPS[stepIndex] ?? APP_DEMO_STEPS[0];

  const navigateToStep = useCallback(
    (index: number) => {
      const target = APP_DEMO_STEPS[index];
      if (!target) return;
      if (location.pathname !== target.route) {
        navigate(target.route);
      }
    },
    [location.pathname, navigate]
  );

  const startTour = useCallback(
    (fromIndex = 0) => {
      const resolved = resolveStepIndex(fromIndex, 1);
      setActive(true);
      setStepIndex(resolved);
      navigateToStep(resolved);
    },
    [navigateToStep]
  );

  const endTour = useCallback(() => {
    setActive(false);
    setStepIndex(0);
    try {
      sessionStorage.removeItem(DEMO_TOUR_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const next = useCallback(() => {
    if (stepIndex >= APP_DEMO_STEPS.length - 1) {
      endTour();
      return;
    }
    const nextIndex = resolveStepIndex(stepIndex + 1, 1);
    setStepIndex(nextIndex);
    navigateToStep(nextIndex);
  }, [endTour, navigateToStep, stepIndex]);

  const prev = useCallback(() => {
    if (stepIndex <= 0) return;
    const prevIndex = resolveStepIndex(stepIndex - 1, -1);
    setStepIndex(prevIndex);
    navigateToStep(prevIndex);
  }, [navigateToStep, stepIndex]);

  const value = useMemo(
    () => ({
      active,
      stepIndex,
      step,
      totalSteps: APP_DEMO_STEPS.length,
      startTour,
      endTour,
      next,
      prev,
    }),
    [active, endTour, next, prev, startTour, step, stepIndex]
  );

  return <DemoTourContext.Provider value={value}>{children}</DemoTourContext.Provider>;
}

export function useDemoTour() {
  const ctx = useContext(DemoTourContext);
  if (!ctx) throw new Error("useDemoTour must be used within DemoTourProvider");
  return ctx;
}

/** Starts the tour after clinic demo login redirect. */
export function DemoTourBootstrap() {
  const { startTour, active } = useDemoTour();
  const { user, loading } = useAuth();
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    if (active || booted || loading || !user) return;
    try {
      if (sessionStorage.getItem(DEMO_TOUR_STORAGE_KEY) !== "1") return;
    } catch {
      return;
    }
    const timer = window.setTimeout(() => {
      setBooted(true);
      startTour(0);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [active, booted, loading, startTour, user]);

  return null;
}
