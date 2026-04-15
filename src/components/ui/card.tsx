import { cn } from "@/lib/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-card border border-flo-border bg-flo-bg-raised shadow-card", className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pt-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("font-display text-xl font-semibold tracking-[-0.01em] text-flo-text-primary", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-2 max-w-[65ch] text-sm leading-relaxed text-flo-text-secondary", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pb-6 pt-5", className)} {...props} />;
}
