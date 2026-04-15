import { cn } from "@/lib/cn";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full appearance-none rounded-xl border border-flo-border bg-[rgba(245,243,236,0.6)] px-3 py-2 pr-9 text-sm text-flo-text-primary",
        "focus:outline-none focus:ring-2 focus:ring-[rgba(217,119,87,0.30)] focus:border-[rgba(217,119,87,0.55)]",
        className
      )}
      {...props}
    />
  );
}
