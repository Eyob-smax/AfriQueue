import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/actions/auth";
import { Card, CardContent } from "@/components/ui/card";

export default async function StaffSchedulePage() {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");
  if (user.role !== "STAFF") redirect("/dashboard");

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-2xl font-bold text-[#0d1b1a] dark:text-white">
        Schedule
      </h1>
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p className="font-medium">No schedule data</p>
          <p className="text-sm mt-1">Shifts configured: 0</p>
          <p className="text-sm mt-2">Staff schedule and shifts will appear here when configured.</p>
        </CardContent>
      </Card>
    </div>
  );
}
