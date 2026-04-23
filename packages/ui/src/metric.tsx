import { Badge } from "./badge";
import { Card, CardDescription, CardTitle } from "./card";

export function MetricCard(props: {
  title: string;
  value: string;
  delta: string;
  tone?: "neutral" | "info" | "warning" | "critical" | "success";
  description: string;
}) {
  return (
    <Card className="space-y-4 overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle>{props.title}</CardTitle>
          <CardDescription>{props.description}</CardDescription>
        </div>
        <Badge variant={props.tone ?? "neutral"}>{props.delta}</Badge>
      </div>
      <div className="text-3xl font-semibold tracking-tight text-[var(--text-main)]">{props.value}</div>
    </Card>
  );
}
