"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";

export function DemandChart({
  data,
}: {
  data: { period: string; forecast: number; actual: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data}>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis dataKey="period" stroke="#64748b" />
        <YAxis stroke="#64748b" />
        <Tooltip />
        <Area type="monotone" dataKey="actual" stroke="#0f172a" fill="#cbd5e1" />
        <Area type="monotone" dataKey="forecast" stroke="#0284c7" fill="#7dd3fc" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RiskBreakdownChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis dataKey="name" stroke="#64748b" />
        <YAxis stroke="#64748b" />
        <Tooltip />
        <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#0ea5e9" />
      </BarChart>
    </ResponsiveContainer>
  );
}

