"use client";

import { useState } from "react";
import { updateAvailabilityBlock } from "@/app/actions";
import { Status } from "@prisma/client";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const STATUS_COLORS: Record<Status, string> = {
  AVAILABLE: "bg-emerald-500/20 border-emerald-500 text-emerald-300",
  FOCUS: "bg-indigo-500/20 border-indigo-500 text-indigo-300",
  OFFLINE: "bg-slate-800 border-slate-700 text-slate-500",
};

interface ScheduleGridProps {
  userId: string;
  timezone: string;
  initialBlocks: Record<string, Status>;
}

export default function ScheduleGrid({
  userId,
  timezone,
  initialBlocks,
}: ScheduleGridProps) {
  const [selectedStatus, setSelectedStatus] = useState<Status>("AVAILABLE");
  const [blocks, setBlocks] = useState<Record<string, Status>>(initialBlocks);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const handleBlockChange = async (day: number, hour: number) => {
    const key = `${day}-${hour}`;
    const nextStatus =
      blocks[key] === selectedStatus ? "OFFLINE" : selectedStatus;

    setBlocks((prev) => ({ ...prev, [key]: nextStatus }));
    await updateAvailabilityBlock(userId, timezone, day, hour, nextStatus);
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-900 text-white rounded-xl border border-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Your Standard Week</h2>
          <p className="text-sm text-slate-400">Timezone: {timezone}</p>
        </div>

        {/* Status Mode Selector */}
        <div className="flex gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(["AVAILABLE", "FOCUS", "OFFLINE"] as Status[]).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                selectedStatus === status
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive 24x7 Grid */}
      <div
        className="grid grid-cols-25 gap-1 overflow-x-auto select-none"
        onMouseLeave={() => setIsMouseDown(false)}
        onMouseUp={() => setIsMouseDown(false)}
      >
        <div className="col-span-1"></div>
        {HOURS.map((hour) => (
          <div key={hour} className="text-center text-[10px] text-slate-500">
            {hour.toString().padStart(2, "0")}
          </div>
        ))}

        {DAYS.map((day, dayIdx) => (
          <div key={day} className="contents">
            <div className="text-xs font-medium text-slate-400 self-center">
              {day}
            </div>
            {HOURS.map((hour) => {
              const status = blocks[`${dayIdx}-${hour}`] || "OFFLINE";
              return (
                <button
                  key={hour}
                  onMouseDown={() => {
                    setIsMouseDown(true);
                    handleBlockChange(dayIdx, hour);
                  }}
                  onMouseEnter={() => {
                    if (isMouseDown) handleBlockChange(dayIdx, hour);
                  }}
                  className={`h-8 rounded border transition ${STATUS_COLORS[status]}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
