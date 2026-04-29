import { AppShell } from "@/components/app-shell";
import { AdminConsole } from "@/components/admin-console";
import { getSystemStatus } from "@/lib/api";
import { Badge, Card, CardDescription, CardTitle } from "@supplychain/ui";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const status = await getSystemStatus();

  return (
    <AppShell currentPath="/admin">
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="space-y-3">
            <CardTitle>System status</CardTitle>
            <CardDescription>
              Live deployment status for the API and its critical integrations.
            </CardDescription>
            <div className="space-y-3 pt-2">
              {[
                ["API", status.apiStatus === "ok"],
                ["Database", status.databaseConfigured],
                ["Redis", status.redisConfigured],
                ["Gemini", status.geminiConfigured],
                ["OpenAI", status.openaiConfigured],
                ["Clerk", status.clerkConfigured],
              ].map(([label, enabled]) => (
                <div key={String(label)} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <div className="font-medium text-slate-900">{label}</div>
                  <Badge variant={enabled ? "success" : "warning"}>{enabled ? "Configured" : "Missing"}</Badge>
                </div>
              ))}
            </div>
          </Card>
          <Card className="space-y-3">
            <CardTitle>Deployment details</CardTitle>
            <CardDescription>
              Quick visibility into the live environment behind the deployed app.
            </CardDescription>
            <div className="space-y-3 pt-2 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="font-medium text-slate-900">Environment</div>
                <div className="mt-1">{status.environment}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="font-medium text-slate-900">Frontend to API</div>
                <div className="mt-1">Use the controls below to verify the platform can do work, not just display cards.</div>
              </div>
            </div>
          </Card>
        </div>
        <AdminConsole />
      </div>
    </AppShell>
  );
}
