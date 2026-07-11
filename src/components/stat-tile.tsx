import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/** A single daily-counter KPI tile (Painel do Dia, WORKFLOW.md §4) — value first,
 * label second, no delta/trend (no historical baseline exists yet to compare against). */
export function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl leading-none font-semibold">{value}</span>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
      </CardContent>
    </Card>
  );
}
