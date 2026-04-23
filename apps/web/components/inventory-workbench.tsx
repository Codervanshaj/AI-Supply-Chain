"use client";

import { useMemo, useState } from "react";
import type { ReorderRecommendation } from "@supplychain/types";
import { Badge, Card, CardDescription, CardTitle } from "@supplychain/ui";

export function InventoryWorkbench({ rows }: { rows: ReorderRecommendation[] }) {
  const [urgency, setUrgency] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [coverageDays, setCoverageDays] = useState(21);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const matchesUrgency = urgency === "all" || row.urgency === urgency;
      const matchesQuery =
        !query ||
        row.productName.toLowerCase().includes(query.toLowerCase()) ||
        row.sku.toLowerCase().includes(query.toLowerCase());
      return matchesUrgency && matchesQuery;
    });
  }, [rows, urgency, query]);

  const selected = filtered[0];
  const suggestedPlan = selected
    ? Math.round(selected.recommendedQuantity * (coverageDays / 21))
    : 0;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Action queue</CardTitle>
            <CardDescription>Filter live reorder candidates by urgency and SKU.</CardDescription>
          </div>
          <Badge variant="warning">{filtered.length} visible</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-cyan-400/20 placeholder:text-slate-500 focus:ring"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search SKU or product"
            value={query}
          />
          <select
            className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-white outline-none"
            onChange={(event) => setUrgency(event.target.value)}
            value={urgency}
          >
            <option value="all">All urgency</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="space-y-3">
          {filtered.map((row) => (
            <div key={row.productId} className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium text-white">{row.productName}</div>
                  <div className="mt-1 text-sm text-slate-400">{row.sku}</div>
                </div>
                <Badge variant={row.urgency === "critical" ? "critical" : row.urgency === "high" ? "warning" : "info"}>
                  {row.urgency}
                </Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">{row.reasoning}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Replenishment planner</CardTitle>
            <CardDescription>Turn optimization outputs into a concrete buy plan.</CardDescription>
          </div>
          <Badge variant="success">Useable</Badge>
        </div>
        {selected ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Selected SKU</div>
                <div className="mt-2 text-xl font-semibold text-white">{selected.sku}</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Recommended</div>
                <div className="mt-2 text-xl font-semibold text-cyan-300">{selected.recommendedQuantity}</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Stockout risk date</div>
                <div className="mt-2 text-xl font-semibold text-white">{selected.projectedStockoutDate}</div>
              </div>
            </div>

            <label className="space-y-3">
              <div className="text-sm font-medium text-white">Coverage target</div>
              <input
                className="w-full accent-cyan-400"
                max={45}
                min={7}
                onChange={(event) => setCoverageDays(Number(event.target.value))}
                type="range"
                value={coverageDays}
              />
              <div className="text-sm text-slate-400">Plan for {coverageDays} days of coverage</div>
            </label>

            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
              <div className="text-sm font-medium text-white">Suggested buy plan</div>
              <div className="mt-2 text-4xl font-semibold text-cyan-300">{suggestedPlan}</div>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                Based on the selected SKU, a {coverageDays}-day target suggests raising the replenishment plan to{" "}
                <strong>{suggestedPlan}</strong> units. Procurement can use this as an actionable starting point
                during vendor negotiations or PO creation.
              </p>
            </div>
          </>
        ) : (
          <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-300">No inventory recommendations match the current filters.</div>
        )}
      </Card>
    </div>
  );
}
