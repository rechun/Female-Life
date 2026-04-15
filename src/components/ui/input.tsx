import { cn } from "@/lib/cn";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-flo-border bg-[rgba(245,243,236,0.6)] px-3 py-2 text-sm text-flo-text-primary",
        "placeholder:text-[rgba(107,104,96,0.85)]",
        "focus:outline-none focus:ring-2 focus:ring-[rgba(217,119,87,0.30)] focus:border-[rgba(217,119,87,0.55)]",
        className
      )}
      {...props}
    />
  );
}
