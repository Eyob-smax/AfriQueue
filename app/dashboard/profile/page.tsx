import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/drizzle";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MaterialIcon } from "@/components/ui/material-icon";

export default async function ProfilePage() {
  const user = await getCurrentUserRole();
  if (!user) redirect("/auth/login");

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/auth/login");

  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id));

  if (!row) redirect("/auth/login");

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-black text-[#0d1b1a] dark:text-white tracking-tight">
        Your Profile
      </h1>
      <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-[#e7f3f2] dark:border-[#1e3a38]">
          <h2 className="text-xl font-bold text-[#0d1b1a] dark:text-white flex items-center gap-2">
            <MaterialIcon icon="account_circle" size={24} className="text-primary" />
            Account
          </h2>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <p className="text-sm text-[#4c9a93] dark:text-gray-400 font-medium mb-1">
              Full name
            </p>
            <p className="font-semibold text-[#0d1b1a] dark:text-white text-lg">
              {row.full_name}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#4c9a93] dark:text-gray-400 font-medium mb-1">
              Email
            </p>
            <p className="font-semibold text-[#0d1b1a] dark:text-white text-lg">
              {row.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#4c9a93] dark:text-gray-400 font-medium mb-1">
              Phone
            </p>
            <p className="font-semibold text-[#0d1b1a] dark:text-white text-lg">
              {row.phone}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#4c9a93] dark:text-gray-400 font-medium mb-1">
              Role
            </p>
            <Badge
              variant="secondary"
              className="mt-1 rounded-lg bg-primary/10 text-primary border border-primary/20"
            >
              {row.role}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-[#4c9a93] dark:text-gray-400 font-medium mb-1">
              Location
            </p>
            <p className="font-semibold text-[#0d1b1a] dark:text-white text-lg">
              {row.city && row.country
                ? `${row.city}, ${row.country}`
                : "Not set"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
