import { Badge } from "@/components/ui/badge";
import { MOMENTUM_LABELS } from "@/lib/domain-labels";
import type { Momentum } from "@/generated/prisma/enums";

/** Momentum is the urgency signal (VISION.md's Status vs. Momentum), so it's the
 * one field that gets color-coded — Status stays neutral/informational. */
const MOMENTUM_BADGE_CLASS: Record<Momentum, string> = {
  RISING: "border-transparent bg-primary-strong text-primary-foreground",
  STEADY: "border-transparent bg-secondary text-secondary-foreground",
  COOLING:
    "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950 dark:text-amber-400",
  STALLED: "border-transparent bg-destructive/15 text-destructive",
};

export function MomentumBadge({ momentum }: { momentum: Momentum }) {
  return (
    <Badge variant="outline" className={MOMENTUM_BADGE_CLASS[momentum]}>
      {MOMENTUM_LABELS[momentum]}
    </Badge>
  );
}
