export type DemoTourPlacement = "top" | "bottom" | "left" | "right" | "center";

export type DemoTourStep = {
  id: string;
  route: string;
  target?: string;
  titleKey: string;
  bodyKey: string;
  placement?: DemoTourPlacement;
  optional?: boolean;
  mobileOnly?: boolean;
};

export const DEMO_TOUR_STORAGE_KEY = "vetocrm-demo-tour-active";
