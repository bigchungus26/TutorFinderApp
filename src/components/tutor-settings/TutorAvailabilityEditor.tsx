import { Clock3, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type AvailabilityEditorSlot = {
  key: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function createDraftSlot(day: number): AvailabilityEditorSlot {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${day}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    key: random,
    day_of_week: day,
    start_time: "09:00",
    end_time: "12:00",
  };
}

interface TutorAvailabilityEditorProps {
  value: AvailabilityEditorSlot[];
  onChange: (next: AvailabilityEditorSlot[]) => void;
  disabled?: boolean;
}

export function TutorAvailabilityEditor({
  value,
  onChange,
  disabled,
}: TutorAvailabilityEditorProps) {
  const updateSlot = (key: string, patch: Partial<AvailabilityEditorSlot>) => {
    onChange(value.map((slot) => (slot.key === key ? { ...slot, ...patch } : slot)));
  };

  const removeSlot = (key: string) => {
    onChange(value.filter((slot) => slot.key !== key));
  };

  const addSlot = (day: number) => {
    onChange([...value, createDraftSlot(day)]);
  };

  return (
    <div className="space-y-3">
      {DAYS.map((dayLabel, dayIndex) => {
        const daySlots = value.filter((slot) => slot.day_of_week === dayIndex);

        return (
          <div key={dayLabel} className="rounded-2xl border border-border bg-background/70 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{dayLabel}</p>
                <p className="text-xs text-muted-foreground">
                  {daySlots.length === 0 ? "Unavailable" : `${daySlots.length} time ${daySlots.length === 1 ? "window" : "windows"}`}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addSlot(dayIndex)}
                disabled={disabled}
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            {daySlots.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                No availability set for {dayLabel.toLowerCase()}.
              </div>
            ) : (
              <div className="space-y-3">
                {daySlots.map((slot, slotIndex) => (
                  <div
                    key={slot.key}
                    className="rounded-xl border border-border bg-card px-3 py-3"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        <Clock3 className="h-3.5 w-3.5" />
                        Slot {slotIndex + 1}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSlot(slot.key)}
                        disabled={disabled}
                        className="h-8 px-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor={`${slot.key}-start`}>Start time</Label>
                        <Input
                          id={`${slot.key}-start`}
                          type="time"
                          value={slot.start_time}
                          onChange={(event) => updateSlot(slot.key, { start_time: event.target.value })}
                          disabled={disabled}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`${slot.key}-end`}>End time</Label>
                        <Input
                          id={`${slot.key}-end`}
                          type="time"
                          value={slot.end_time}
                          onChange={(event) => updateSlot(slot.key, { end_time: event.target.value })}
                          disabled={disabled}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
