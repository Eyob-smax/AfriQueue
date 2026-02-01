import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/actions/auth";
import { Card, CardContent } from "@/components/ui/card";

export default async function ClientHistoryPage() {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");
  if (user.role !== "CLIENT") redirect("/dashboard");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0d1b1a] dark:text-white">
        History
      </h1>
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p>Your past visits and queue history will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
