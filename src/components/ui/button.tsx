import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

export function Button({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-heading text-sm font-medium transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(217,119,87,0.35)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg-base)]",
        "disabled:pointer-events-none disabled:opacity-50",
        size === "sm" ? "px-3 py-1.5" : "px-4 py-2",
        variant === "primary"
          ? "bg-flo-accent-orange text-white shadow-[0_10px_30px_rgba(217,119,87,0.18)] hover:brightness-[0.98]"
          : variant === "danger"
            ? "bg-flo-error text-white hover:brightness-[0.98]"
            : variant === "ghost"
              ? "text-flo-text-secondary hover:bg-flo-bg-raised hover:text-flo-text-primary"
              : "border border-flo-border bg-flo-bg-raised text-flo-text-primary hover:brightness-[0.99]",
        className
      )}
      {...props}
    />
  );
}
