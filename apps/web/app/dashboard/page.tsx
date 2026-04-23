import { AppShell } from "@/components/app-shell";
import { DashboardOverview } from "@/components/dashboard-overview";

export default async function DashboardPage() {
  return (
    <AppShell currentPath="/dashboard">
      <DashboardOverview />
    </AppShell>
  );
}
