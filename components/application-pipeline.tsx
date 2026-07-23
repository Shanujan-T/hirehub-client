"use client";

import { cn } from "@/lib/utils";
import type { Application } from "@/types";

type StepState = "complete" | "current" | "upcoming";

interface PipelineStep {
  label: string;
  state: StepState;
}

function buildPipelineSteps(application: Application): PipelineStep[] {
  const { status, interview } = application;

  let interviewLabel = "Interview";
  let currentIndex = 0;

  if (status === "pending") {
    currentIndex = 1;
  } else if (status === "shortlisted") {
    if (interview?.status === "proposed") {
      currentIndex = 3;
      interviewLabel = "Interview proposed";
    } else if (interview?.status === "confirmed") {
      currentIndex = 3;
      interviewLabel = "Interview scheduled";
    } else {
      currentIndex = 2;
    }
  } else if (status === "accepted") {
    currentIndex = 4;
  } else if (status === "rejected") {
    currentIndex = 4;
  } else if (status === "withdrawn") {
    currentIndex = 1;
  }

  const outcomeLabel =
    status === "accepted"
      ? "Offer"
      : status === "rejected"
        ? "Rejected"
        : status === "withdrawn"
          ? "Withdrawn"
          : "Offer / Rejected";

  const labels = [
    "Applied",
    "Under review",
    "Shortlisted",
    interviewLabel,
    outcomeLabel,
  ];

  return labels.map((label, index) => ({
    label,
    state:
      index < currentIndex
        ? "complete"
        : index === currentIndex
          ? "current"
          : "upcoming",
  }));
}

interface ApplicationPipelineProps {
  application: Application;
  compact?: boolean;
  className?: string;
}

export function ApplicationPipeline({
  application,
  compact = false,
  className,
}: ApplicationPipelineProps) {
  const steps = buildPipelineSteps(application);

  return (
    <div
      className={cn(
        compact ? "flex flex-wrap items-center gap-1" : "flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-0",
        className,
      )}
      aria-label="Application pipeline"
    >
      {steps.map((step, index) => (
        <div
          key={`${step.label}-${index}`}
          className={cn(
            compact
              ? "flex items-center gap-1"
              : "flex flex-1 flex-col items-start sm:items-center sm:text-center",
          )}
        >
          <div className={cn("flex items-center", compact ? "gap-1" : "w-full sm:flex-col sm:gap-2")}>
            <span
              className={cn(
                "inline-flex shrink-0 items-center justify-center rounded-full border-2 font-semibold",
                compact ? "size-5 text-[10px]" : "size-7 text-xs",
                step.state === "complete" &&
                  "border-[var(--brand-blue)] bg-[var(--brand-blue)] text-white",
                step.state === "current" &&
                  "border-[var(--brand-blue)] bg-surface-card text-[var(--brand-blue)] ring-2 ring-[var(--brand-blue)]/20",
                step.state === "upcoming" &&
                  "border-default bg-surface-muted text-subtle",
              )}
            >
              {step.state === "complete" ? "✓" : index + 1}
            </span>
            {!compact && index < steps.length - 1 ? (
              <span className="mx-2 hidden h-0.5 flex-1 bg-default sm:block" />
            ) : null}
            {compact && index < steps.length - 1 ? (
              <span className="text-subtle text-[10px]">→</span>
            ) : null}
          </div>
          <p
            className={cn(
              "font-medium",
              compact ? "text-[10px]" : "mt-2 text-xs",
              step.state === "current" ? "text-heading" : "text-subtle",
              step.state === "complete" && "text-heading",
            )}
          >
            {step.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export default ApplicationPipeline;
