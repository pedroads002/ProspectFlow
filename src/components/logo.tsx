import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-heading text-lg font-semibold tracking-tight",
        className,
      )}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-strong text-xs font-bold text-primary-foreground">
        P
      </span>
      ProspectFlow
    </span>
  );
}
