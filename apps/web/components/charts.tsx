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
        <CartesianGrid stroke="rgba(148,163,184,0.15)" strokeDasharray="3 3" />
        <XAxis dataKey="period" stroke="#7e92b2" />
        <YAxis stroke="#7e92b2" />
        <Tooltip />
        <Area type="monotone" dataKey="actual" stroke="#94a3b8" fill="rgba(148,163,184,0.24)" />
        <Area type="monotone" dataKey="forecast" stroke="#22d3ee" fill="rgba(34,211,238,0.28)" />
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
        <CartesianGrid stroke="rgba(148,163,184,0.15)" strokeDasharray="3 3" />
        <XAxis dataKey="name" stroke="#7e92b2" />
        <YAxis stroke="#7e92b2" />
        <Tooltip />
        <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#22d3ee" />
      </BarChart>
    </ResponsiveContainer>
  );
}
