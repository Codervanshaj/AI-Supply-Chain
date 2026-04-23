import { Badge, Card, CardDescription, CardTitle } from "@supplychain/ui";
import type {
  ReorderRecommendation,
  SupplierRiskScore,
  ShipmentDelayPrediction,
  AssetFailurePrediction,
} from "@supplychain/types";

function riskVariant(level: string) {
  if (level === "critical") return "critical";
  if (level === "high") return "warning";
  return "info";
}

export function InventoryTable({ rows }: { rows: ReorderRecommendation[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="mb-4 space-y-1">
        <CardTitle>Recommended reorder queue</CardTitle>
        <CardDescription>Prioritized actions driven by forecast-adjusted stockout risk.</CardDescription>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="pb-3">SKU</th>
              <th className="pb-3">Product</th>
              <th className="pb-3">Urgency</th>
              <th className="pb-3">Quantity</th>
              <th className="pb-3">Stockout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {rows.map((row) => (
              <tr key={row.productId}>
                <td className="py-3 font-medium text-white">{row.sku}</td>
                <td className="py-3 text-slate-300">{row.productName}</td>
                <td className="py-3">
                  <Badge variant={riskVariant(row.urgency)}>{row.urgency}</Badge>
                </td>
                <td className="py-3 text-slate-300">{row.recommendedQuantity}</td>
                <td className="py-3 text-slate-300">{row.projectedStockoutDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function SupplierRiskTable({ rows }: { rows: SupplierRiskScore[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="mb-4 space-y-1">
        <CardTitle>Supplier risk</CardTitle>
        <CardDescription>Composite score across delays, defects, fill-rate, and dependency concentration.</CardDescription>
      </div>
      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.supplierId} className="rounded-2xl border border-white/8 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-white">{row.supplierName}</div>
                <div className="mt-1 text-sm text-slate-400">{row.recommendation}</div>
              </div>
              <Badge variant={riskVariant(row.riskLevel)}>{row.riskScore.toFixed(0)}</Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function PredictionStack({
  title,
  description,
  rows,
}: {
  title: string;
  description: string;
  rows: ShipmentDelayPrediction[] | AssetFailurePrediction[];
}) {
  return (
    <Card>
      <div className="mb-4 space-y-1">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
      <div className="space-y-4">
        {rows.map((row) => (
          <div key={"shipmentId" in row ? row.shipmentId : row.assetId} className="rounded-2xl border border-white/8 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="font-medium text-white">
                {"shipmentNumber" in row ? row.shipmentNumber : row.assetName}
              </div>
              <Badge variant={riskVariant(row.riskLevel)}>{row.riskLevel}</Badge>
            </div>
            <p className="mt-2 text-sm text-slate-300">
              {"reasoning" in row ? row.reasoning : row.explanation}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
              {"recommendation" in row ? row.recommendation : row.nextAction}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
