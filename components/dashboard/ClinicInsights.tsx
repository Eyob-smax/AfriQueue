"use client";

import { MaterialIcon } from "@/components/ui/material-icon";
import type { StaffClinicInsights } from "@/lib/actions/queue";

const DEFAULT_INSIGHTS: StaffClinicInsights = {
  avgWaitMinutes: 0,
  avgWaitTrendPercent: null,
  patientsSeenToday: 0,
  patientsSeenTrendPercent: null,
  peakTrafficByHour: [8, 10, 12, 14, 16, 18].map((hour) => ({ hour, count: 0 })),
};

const HOUR_LABELS = ["08am", "10am", "12pm", "02pm", "04pm", "06pm"];

export function ClinicInsights({ insights = null }: { insights?: StaffClinicInsights | null }) {
  const data = insights ?? DEFAULT_INSIGHTS;
  const maxPeak = Math.max(1, ...data.peakTrafficByHour.map((b) => b.count));

  return (
    <div className="w-80 min-w-[280px] flex-1 max-w-md flex flex-col gap-6 shrink-0">
      <h3 className="text-xl font-bold text-[#0d1b1a] dark:text-white">
        Clinic Insights
      </h3>
      <div className="grid grid-cols-1 gap-4">
        <div className="p-6 bg-white dark:bg-[#152a28] border border-[#cfe7e5] dark:border-[#1e3a37] rounded-xl">
          <p className="text-sm font-medium text-[#4c9a93]">Avg Wait Time</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-[#0d1b1a] dark:text-white">
              {data.avgWaitMinutes === 0 ? "0" : `${Math.round(data.avgWaitMinutes)}m`}
            </span>
            {data.avgWaitTrendPercent != null && (
              <span className={`text-xs font-bold flex items-center ${data.avgWaitTrendPercent <= 0 ? "text-urgency-low" : "text-urgency-medium"}`}>
                <MaterialIcon icon={data.avgWaitTrendPercent <= 0 ? "arrow_downward" : "arrow_upward"} size={14} />
                {Math.abs(data.avgWaitTrendPercent)}%
              </span>
            )}
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-[#152a28] border border-[#cfe7e5] dark:border-[#1e3a37] rounded-xl">
          <p className="text-sm font-medium text-[#4c9a93]">
            Patients Seen Today
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-[#0d1b1a] dark:text-white">
              {data.patientsSeenToday}
            </span>
            {data.patientsSeenTrendPercent != null && (
              <span className={`text-xs font-bold flex items-center ${data.patientsSeenTrendPercent >= 0 ? "text-urgency-low" : "text-urgency-medium"}`}>
                <MaterialIcon icon={data.patientsSeenTrendPercent >= 0 ? "arrow_upward" : "arrow_downward"} size={14} />
                {Math.abs(data.patientsSeenTrendPercent)}%
              </span>
            )}
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-[#152a28] border border-[#cfe7e5] dark:border-[#1e3a37] rounded-xl">
          <p className="text-sm font-medium text-[#4c9a93] mb-4">
            Peak Traffic Hours
          </p>
          <div className="flex items-end justify-between h-24 gap-1">
            {data.peakTrafficByHour.map((bar) => {
              const pct = maxPeak > 0 ? (bar.count / maxPeak) * 100 : 0;
              const isPeak = bar.count > 0 && bar.count === Math.max(...data.peakTrafficByHour.map((b) => b.count));
              return (
                <div
                  key={bar.hour}
                  className="w-full flex flex-col justify-end rounded-t transition-all min-h-0"
                  style={{ height: "100%" }}
                  title={`${bar.count} reservations`}
                >
                  <div
                    className={`w-full rounded-t transition-all ${isPeak ? "bg-primary" : "bg-primary/20"}`}
                    style={{ height: `${pct}%`, minHeight: bar.count > 0 ? "4px" : "0" }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-[#4c9a93] font-bold">
            {HOUR_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      </div>
      {(data.patientsSeenTrendPercent != null && data.patientsSeenTrendPercent !== 0) && (
        <div className="mt-auto p-4 bg-primary/5 rounded-xl border border-primary/20">
          <div className="flex items-center gap-3 mb-2">
            <MaterialIcon icon="info" size={20} className="text-primary" />
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              Admin Tip
            </p>
          </div>
          <p className="text-sm text-[#4c9a93] leading-relaxed">
            {data.patientsSeenTrendPercent > 0
              ? `Queue volume is ${data.patientsSeenTrendPercent}% higher than yesterday. Consider opening an extra consultation desk.`
              : `Queue volume is ${Math.abs(data.patientsSeenTrendPercent)}% lower than yesterday.`}
          </p>
        </div>
      )}
    </div>
  );
}
