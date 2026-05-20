const baseClasses =
  "inline-flex min-h-12 items-center justify-center border px-6 py-3 text-xs font-medium uppercase tracking-[0.22em] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary:
    "border-[var(--accent-gold)] bg-[var(--accent-gold)] text-black hover:border-[var(--accent-soft)] hover:bg-[var(--accent-soft)] hover:shadow-[0_0_30px_rgba(198,164,108,0.18)]",
  outline:
    "border-[var(--accent-gold)] bg-transparent text-[var(--accent-gold)] hover:bg-[var(--accent-gold)] hover:text-black hover:shadow-[0_0_30px_rgba(198,164,108,0.14)]",
  ghost:
    "border-white/10 bg-white/[0.03] text-white hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]",
};

export default function Button({
  as: Component = "button",
  variant = "outline",
  className = "",
  children,
  ...props
}) {
  return (
    <Component
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
