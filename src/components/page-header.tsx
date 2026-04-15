import { cn } from "@/lib/cn";
import { Card, CardContent } from "@/components/ui/card";

export function PageHeader({
  title,
  description,
  actions,
  className
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-[240px] flex-1">
          <div className="font-display text-2xl font-semibold tracking-[-0.01em] text-flo-text-primary">{title}</div>
          {description ? <div className="mt-2 max-w-[65ch] text-sm leading-relaxed text-flo-text-secondary">{description}</div> : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </CardContent>
    </Card>
  );
}
