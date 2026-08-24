/**
 * Button styling shared by <button>, <a> and next/link, per Design.md.
 *
 * Always pill radius. Hover scales to 1.03–1.04 with a background shift,
 * active presses to 0.98, easing is --ease-standard — no spring or bounce.
 *
 * There is exactly one gradient button per view and it always means the same
 * thing: join the Early Access waitlist.
 *
 * Note: BASE sets `display: inline-flex` unconditionally. A `hidden` utility
 * in `className` will NOT hide the button, because the two compete on equal
 * specificity and Tailwind's layer order decides the winner. To show or hide a
 * button responsively, put the visibility classes on a wrapper element.
 */

export type ButtonVariant =
  | "gradient"
  | "primary"
  | "secondary"
  | "ghost"
  | "onDark"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold " +
  // 44px minimum touch target on every variant, thumb-friendly on mobile.
  "min-h-11 whitespace-nowrap [transition:transform_var(--duration-base)_var(--ease-standard),background_var(--duration-base)_var(--ease-standard),box-shadow_var(--duration-base)_var(--ease-standard),color_var(--duration-base)_var(--ease-standard),border-color_var(--duration-base)_var(--ease-standard)] " +
  "motion-safe:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 " +
  "disabled:motion-safe:hover:scale-100";

const SIZES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-[0.8125rem]",
  md: "px-5 py-3 text-[0.9375rem]",
  lg: "px-7 py-4 text-base sm:text-[1.0625rem]",
};

const VARIANTS: Record<ButtonVariant, string> = {
  /*
    The brand gradient, darkened until white text clears AA along its whole
    length. Carries the glow shadow from Design.md.
  */
  gradient:
    "text-white [background-image:var(--gradient-cta)] [box-shadow:var(--shadow-glow-brand)] " +
    "hover:[background-image:var(--gradient-cta-hover)] motion-safe:hover:scale-[1.04]",
  /* Black surface — Design.md's --color-brand-primary. */
  primary:
    "bg-brand-primary text-white hover:bg-neutral-900 motion-safe:hover:scale-[1.03]",
  secondary:
    "border border-border-strong bg-surface text-text-primary hover:bg-bg-sunken " +
    "motion-safe:hover:scale-[1.03]",
  /* Glass pill — translucent, blurred, per Design.md's ghost treatment. */
  ghost:
    "glass text-text-primary hover:bg-white/60 motion-safe:hover:scale-[1.03]",
  onDark:
    "bg-white text-surface-dark hover:bg-white/90 motion-safe:hover:scale-[1.03] " +
    "shadow-lg",
  danger: "bg-danger text-white hover:bg-danger-700 motion-safe:hover:scale-[1.03]",
};

export function buttonStyles({
  variant = "gradient",
  size = "md",
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return `${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`.trim();
}
