import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/actions/auth";
import { SymptomCheckerChat } from "@/components/dashboard/SymptomCheckerChat";

export default async function SymptomCheckerPage() {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");
  if (user.role !== "CLIENT") redirect("/dashboard");

  return (
    <div className="flex-1 px-4 md:px-8 py-8 flex justify-center">
      <SymptomCheckerChat />
    </div>
  );
}
