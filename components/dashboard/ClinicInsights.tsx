"use client";

import { MaterialIcon } from "@/components/ui/material-icon";

export function ClinicInsights() {
  return (
    <div className="w-80 flex flex-col gap-6 shrink-0">
      <h3 className="text-xl font-bold text-[#0d1b1a] dark:text-white">
        Clinic Insights
      </h3>
      <div className="grid grid-cols-1 gap-4">
        <div className="p-6 bg-white dark:bg-[#152a28] border border-[#cfe7e5] dark:border-[#1e3a37] rounded-xl">
          <p className="text-sm font-medium text-[#4c9a93]">Avg Wait Time</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-[#0d1b1a] dark:text-white">
              14m
            </span>
            <span className="text-xs font-bold text-urgency-low flex items-center">
              <MaterialIcon icon="arrow_downward" size={14} />
              2%
            </span>
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-[#152a28] border border-[#cfe7e5] dark:border-[#1e3a37] rounded-xl">
          <p className="text-sm font-medium text-[#4c9a93]">
            Patients Seen Today
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-[#0d1b1a] dark:text-white">
              42
            </span>
            <span className="text-xs font-bold text-urgency-low flex items-center">
              <MaterialIcon icon="arrow_upward" size={14} />
              12%
            </span>
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-[#152a28] border border-[#cfe7e5] dark:border-[#1e3a37] rounded-xl">
          <p className="text-sm font-medium text-[#4c9a93] mb-4">
            Peak Traffic Hours
          </p>
          <div className="flex items-end justify-between h-24 gap-1">
            <div className="w-full bg-primary/20 rounded-t h-[40%]" />
            <div className="w-full bg-primary/20 rounded-t h-[60%]" />
            <div className="w-full bg-primary rounded-t h-[95%]" />
            <div className="w-full bg-primary/20 rounded-t h-[70%]" />
            <div className="w-full bg-primary/20 rounded-t h-[30%]" />
            <div className="w-full bg-primary/20 rounded-t h-[45%]" />
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-[#4c9a93] font-bold">
            <span>08am</span>
            <span>11am</span>
            <span>02pm</span>
            <span>05pm</span>
          </div>
        </div>
      </div>
      <div className="mt-auto p-4 bg-primary/5 rounded-xl border border-primary/20">
        <div className="flex items-center gap-3 mb-2">
          <MaterialIcon icon="info" size={20} className="text-primary" />
          <p className="text-xs font-bold uppercase tracking-wide text-primary">
            Admin Tip
          </p>
        </div>
        <p className="text-sm text-[#4c9a93] leading-relaxed">
          Queue volume is 15% higher than usual. Consider opening an extra
          consultation desk.
        </p>
      </div>
    </div>
  );
}
