import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { DemoTourStep } from "@/lib/demoTour/types";

type Rect = { top: number; left: number; width: number; height: number };

const PADDING = 10;

function measureTarget(selector?: string): Rect | null {
  if (!selector) return null;
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function tooltipStyle(
  rect: Rect | null,
  placement: string,
  centered: boolean
): React.CSSProperties {
  if (centered || !rect) {
    return {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      maxWidth: "min(480px, calc(100vw - 2rem))",
    };
  }

  const gap = 14;
  const maxW = Math.min(440, window.innerWidth - 24);
  const style: React.CSSProperties = {
    position: "fixed",
    maxWidth: maxW,
    zIndex: 10001,
  };

  if (placement === "top") {
    style.left = Math.min(
      Math.max(12, rect.left + rect.width / 2 - maxW / 2),
      window.innerWidth - maxW - 12
    );
    style.bottom = Math.max(12, window.innerHeight - rect.top + gap);
  } else {
    style.left = Math.min(
      Math.max(12, rect.left + rect.width / 2 - maxW / 2),
      window.innerWidth - maxW - 12
    );
    style.top = Math.min(rect.top + rect.height + gap + PADDING, window.innerHeight - 200);
  }

  return style;
}

type Props = {
  active: boolean;
  stepIndex: number;
  steps: DemoTourStep[];
  onNext: () => void;
  onPrev: () => void;
  onEnd: () => void;
};

export function SpotlightTour({ active, stepIndex, steps, onNext, onPrev, onEnd }: Props) {
  const { t } = useTranslation("demo");
  const step = steps[stepIndex] ?? steps[0];
  const [rect, setRect] = useState<Rect | null>(null);
  const [ready, setReady] = useState(false);

  const centered = !step.target || step.placement === "center";
  const isLast = stepIndex >= steps.length - 1;

  const refresh = useCallback(() => {
    if (centered) {
      setRect(null);
      setReady(true);
      return;
    }
    const el = step.target ? document.querySelector(step.target) : null;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }
    window.setTimeout(() => {
      setRect(measureTarget(step.target));
      setReady(true);
    }, 400);
  }, [centered, step.target]);

  useEffect(() => {
    if (!active || centered || !step.optional || !step.target) return;
    const timer = window.setTimeout(() => {
      if (!document.querySelector(step.target!)) {
        onNext();
      }
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [active, centered, onNext, step.id, step.optional, step.target]);

  useLayoutEffect(() => {
    if (!active) return;
    setReady(false);
    refresh();
  }, [active, step.id, step.target, refresh]);

  useEffect(() => {
    if (!active) return;
    const onUpdate = () => {
      if (!centered) setRect(measureTarget(step.target));
    };
    window.addEventListener("resize", onUpdate);
    window.addEventListener("scroll", onUpdate, true);
    return () => {
      window.removeEventListener("resize", onUpdate);
      window.removeEventListener("scroll", onUpdate, true);
    };
  }, [active, centered, step.target]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEnd();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, onEnd]);

  if (!active || !ready) return null;

  const progress = ((stepIndex + 1) / steps.length) * 100;
  const highlight = rect
    ? {
        top: rect.top - PADDING,
        left: rect.left - PADDING,
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
      }
    : null;

  return createPortal(
    <div className="demo-tour-root" role="dialog" aria-modal="true" aria-labelledby="demo-tour-title">
      <div className="demo-tour-blocker" aria-hidden="true" />

      {!centered && highlight ? (
        <div
          className="demo-tour-spotlight"
          style={{
            top: highlight.top,
            left: highlight.left,
            width: highlight.width,
            height: highlight.height,
          }}
        />
      ) : (
        <div className="demo-tour-backdrop demo-tour-backdrop--full" aria-hidden="true" />
      )}

      <div
        className={cn("demo-tour-card", centered && "demo-tour-card--center")}
        style={tooltipStyle(rect, step.placement ?? "bottom", centered)}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-primary font-semibold mb-1">
              {t("tourLabel", { current: stepIndex + 1, total: steps.length })}
            </p>
            <h2 id="demo-tour-title" className="text-lg font-bold leading-snug">
              {t(step.titleKey)}
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 h-8 w-8"
            onClick={onEnd}
            aria-label={t("quit")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4 whitespace-pre-line max-h-[40vh] overflow-y-auto">
          {t(step.bodyKey)}
        </p>

        <Progress value={progress} className="h-1.5 mb-4" />

        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="outline" size="sm" disabled={stepIndex === 0} onClick={onPrev}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("prev")}
          </Button>
          <Button type="button" size="sm" onClick={isLast ? onEnd : onNext}>
            {isLast ? t("finish") : t("next")}
            {!isLast ? <ArrowRight className="h-4 w-4 ml-1" /> : null}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
