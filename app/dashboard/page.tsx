import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/actions/auth";

export default async function DashboardPage() {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");

  switch (user.role) {
    case "CLIENT":
      redirect("/dashboard/client");
    case "STAFF":
      redirect("/dashboard/staff");
    case "ADMIN":
    case "SUPER_ADMIN":
      redirect("/dashboard/admin");
    default:
      redirect("/dashboard/client");
  }
}
