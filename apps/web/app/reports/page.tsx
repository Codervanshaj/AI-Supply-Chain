import { AppShell } from "@/components/app-shell";
import { getReports } from "@/lib/api";
import { Badge, Card, CardDescription, CardTitle } from "@supplychain/ui";

export default async function ReportsPage() {
  const reports = await getReports();

  return (
    <AppShell currentPath="/reports">
      <div className="space-y-6">
        <Card className="space-y-3">
          <CardTitle>Reports and exports</CardTitle>
          <CardDescription>
            Generated report packs and executive briefs from the backend reporting service.
          </CardDescription>
        </Card>
        <div className="grid gap-4">
          {reports.map((report) => (
            <Card key={report.id} className="flex items-start justify-between gap-6">
              <div className="space-y-2">
                <CardTitle>{report.name}</CardTitle>
                <CardDescription>
                  {report.reportType} report • generated {report.generatedAt}
                </CardDescription>
              </div>
              <Badge variant={report.status === "ready" ? "success" : "warning"}>{report.status}</Badge>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
