"use client";

import { useState } from "react";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/form";
import applicationsService from "@/services/applications";
import { getApiErrorMessage } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { Application, Interview } from "@/types";

function toLocalDatetimeValue(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function localDatetimeToIso(value: string): string {
  return new Date(value).toISOString();
}

interface ScheduleInterviewFormProps {
  application: Application;
  onScheduled: (application: Application) => void;
}

export function ScheduleInterviewForm({
  application,
  onScheduled,
}: ScheduleInterviewFormProps) {
  const [open, setOpen] = useState(false);
  const [slots, setSlots] = useState(["", ""]);
  const [submitting, setSubmitting] = useState(false);

  const updateSlot = (index: number, value: string) => {
    setSlots((prev) => prev.map((slot, i) => (i === index ? value : slot)));
  };

  const addSlot = () => {
    if (slots.length < 4) setSlots((prev) => [...prev, ""]);
  };

  const removeSlot = (index: number) => {
    if (slots.length <= 2) return;
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async () => {
    const isoSlots = slots.filter(Boolean).map(localDatetimeToIso);
    if (isoSlots.length < 2) {
      toast.error("Provide at least 2 time slots.");
      return;
    }
    setSubmitting(true);
    try {
      const interview = await applicationsService.proposeInterview(
        application.id,
        isoSlots,
      );
      onScheduled({ ...application, interview });
      toast.success("Interview slots sent to candidate.");
      setOpen(false);
      setSlots(["", ""]);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (application.interview?.status === "confirmed") {
    return (
      <div className="rounded-lg border border-[var(--brand-blue)]/30 bg-[color-mix(in_srgb,var(--brand-blue)_8%,var(--surface-card))] p-3 text-sm">
        <p className="font-semibold text-heading">Interview scheduled</p>
        <p className="text-subtle mt-1">
          {formatDate(application.interview.selected_slot)}
        </p>
      </div>
    );
  }

  if (application.interview?.status === "proposed") {
    return (
      <div className="rounded-lg border border-default bg-surface-muted p-3 text-sm">
        <p className="font-semibold text-heading">Interview proposed</p>
        <p className="text-subtle mt-1">Awaiting candidate to pick a slot.</p>
      </div>
    );
  }

  if (application.status !== "shortlisted") return null;

  if (!open) {
    return (
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Calendar className="h-3.5 w-3.5" />
        Schedule interview
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-default bg-surface-muted p-3">
      <p className="text-sm font-semibold text-heading">Propose interview slots</p>
      {slots.map((slot, index) => (
        <div key={index} className="flex items-end gap-2">
          <div className="flex-1">
            <Label htmlFor={`slot-${application.id}-${index}`}>Slot {index + 1}</Label>
            <Input
              id={`slot-${application.id}-${index}`}
              type="datetime-local"
              value={slot}
              onChange={(e) => updateSlot(index, e.target.value)}
            />
          </div>
          {slots.length > 2 ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => removeSlot(index)}
              aria-label={`Remove slot ${index + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        {slots.length < 4 ? (
          <Button type="button" size="sm" variant="ghost" onClick={addSlot}>
            <Plus className="h-3.5 w-3.5" />
            Add slot
          </Button>
        ) : null}
        <Button type="button" size="sm" loading={submitting} onClick={submit}>
          Send slots
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

interface InterviewSlotPickerProps {
  application: Application;
  onConfirmed: (application: Application) => void;
}

export function InterviewSlotPicker({
  application,
  onConfirmed,
}: InterviewSlotPickerProps) {
  const interview = application.interview;
  const [selected, setSelected] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!interview || interview.status !== "proposed") {
    if (interview?.status === "confirmed" && interview.selected_slot) {
      return (
        <div className="rounded-lg border border-[var(--brand-blue)]/30 bg-[color-mix(in_srgb,var(--brand-blue)_8%,var(--surface-card))] p-4">
          <p className="text-sm font-semibold text-heading">Interview scheduled</p>
          <p className="text-heading mt-1 text-lg font-bold">
            {formatDate(interview.selected_slot)}
          </p>
        </div>
      );
    }
    return null;
  }

  const confirm = async () => {
    if (!selected) {
      toast.error("Select a time slot.");
      return;
    }
    setSubmitting(true);
    try {
      const updatedInterview = await applicationsService.selectInterviewSlot(
        interview.id,
        selected,
      );
      onConfirmed({ ...application, interview: updatedInterview });
      toast.success("Interview time confirmed.");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-default bg-surface-muted p-4">
      <p className="text-sm font-semibold text-heading">Choose an interview time</p>
      <div className="space-y-2">
        {interview.slots.map((slot) => (
          <label
            key={slot}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-default bg-surface-card px-3 py-2"
          >
            <input
              type="radio"
              name={`interview-slot-${application.id}`}
              value={slot}
              checked={selected === slot}
              onChange={() => setSelected(slot)}
            />
            <span className="text-sm text-heading">{formatDate(slot)}</span>
          </label>
        ))}
      </div>
      <Button type="button" loading={submitting} onClick={confirm}>
        Confirm interview time
      </Button>
    </div>
  );
}

export { toLocalDatetimeValue, localDatetimeToIso };
