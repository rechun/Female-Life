import { cn } from "@/lib/cn";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-flo-border bg-[rgba(245,243,236,0.7)] px-2.5 py-1 text-xs text-flo-text-secondary",
        className
      )}
      {...props}
    />
  );
}
