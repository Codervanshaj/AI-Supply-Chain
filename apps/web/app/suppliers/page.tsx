import { AppShell } from "@/components/app-shell";
import { SupplierRiskTable } from "@/components/tables";
import { getSupplierRisk } from "@/lib/api";
import { Badge, Card, CardDescription, CardTitle } from "@supplychain/ui";

export default async function SuppliersPage() {
  const suppliers = await getSupplierRisk();

  return (
    <AppShell currentPath="/suppliers">
      <div className="space-y-6">
        <Card className="space-y-3">
          <CardTitle>Supplier intelligence</CardTitle>
          <CardDescription>
            Component-level risk factors and recommendations are now populated from the live backend.
          </CardDescription>
        </Card>
        <SupplierRiskTable rows={suppliers} />
        <div className="grid gap-6 lg:grid-cols-2">
          {suppliers.map((supplier) => (
            <Card key={supplier.supplierId} className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>{supplier.supplierName}</CardTitle>
                  <CardDescription>{supplier.recommendation}</CardDescription>
                </div>
                <Badge variant={supplier.riskLevel === "high" || supplier.riskLevel === "critical" ? "critical" : "info"}>
                  {supplier.riskLevel}
                </Badge>
              </div>
              <div className="space-y-3">
                {supplier.factors.map((factor) => (
                  <div key={factor.name} className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="font-medium text-slate-900">{factor.name}</div>
                      <div className="text-sm font-semibold text-slate-900">{factor.score}</div>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">{factor.explanation}</div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
