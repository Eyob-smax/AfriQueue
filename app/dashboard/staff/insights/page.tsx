import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/actions/auth";
import { getStaffHealthCenter, getStaffClinicInsights } from "@/lib/actions/queue";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MaterialIcon } from "@/components/ui/material-icon";

const HOUR_LABELS = ["08am", "10am", "12pm", "02pm", "04pm", "06pm"];

export default async function StaffInsightsPage() {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");
  if (user.role !== "STAFF") redirect("/dashboard");

  const center = await getStaffHealthCenter();
  const insights = center ? await getStaffClinicInsights(center.health_center_id) : null;

  const data = insights ?? {
    avgWaitMinutes: 0,
    avgWaitTrendPercent: null,
    patientsSeenToday: 0,
    patientsSeenTrendPercent: null,
    peakTrafficByHour: [8, 10, 12, 14, 16, 18].map((hour) => ({ hour, count: 0 })),
  };
  const maxPeak = Math.max(1, ...data.peakTrafficByHour.map((b) => b.count));

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-2xl font-bold text-[#0d1b1a] dark:text-white">
        Insights
      </h1>
      {!center ? (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p>No health center assigned. Clinic analytics will appear here once assigned.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-[#cfe7e5] dark:border-[#1e3a37]">
            <CardHeader className="pb-2">
              <p className="text-sm font-medium text-[#4c9a93]">Avg Wait Time</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
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
            </CardContent>
          </Card>
          <Card className="border-[#cfe7e5] dark:border-[#1e3a37]">
            <CardHeader className="pb-2">
              <p className="text-sm font-medium text-[#4c9a93]">Patients Seen Today</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
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
            </CardContent>
          </Card>
          <Card className="border-[#cfe7e5] dark:border-[#1e3a37] md:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <p className="text-sm font-medium text-[#4c9a93]">Peak Traffic Hours (last 7 days)</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-24 gap-1">
                {data.peakTrafficByHour.map((bar) => {
                  const pct = maxPeak > 0 ? (bar.count / maxPeak) * 100 : 0;
                  const isPeak = bar.count > 0 && bar.count === Math.max(...data.peakTrafficByHour.map((b) => b.count));
                  return (
                    <div key={bar.hour} className="w-full flex flex-col justify-end rounded-t min-h-0" style={{ height: "100%" }} title={`${bar.count} reservations`}>
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
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
