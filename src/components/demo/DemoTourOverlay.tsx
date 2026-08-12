import { APP_DEMO_STEPS } from "@/lib/demoTour/steps";
import { useDemoTour } from "@/contexts/DemoTourContext";
import { SpotlightTour } from "@/components/demo/SpotlightTour";

export function DemoTourOverlay() {
  const { active, stepIndex, next, prev, endTour } = useDemoTour();

  return (
    <SpotlightTour
      active={active}
      stepIndex={stepIndex}
      steps={APP_DEMO_STEPS}
      onNext={next}
      onPrev={prev}
      onEnd={endTour}
    />
  );
}
