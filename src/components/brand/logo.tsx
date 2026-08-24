import Image from "next/image";

/**
 * The Evi logo lockup.
 *
 * The mascot artwork is never recoloured, filtered, desaturated, inverted or
 * distorted — a drop-shadow is the only effect allowed on it. Only the
 * wordmark switches, between black on light backgrounds and white on dark
 * ones; both wordmark files hold the identical letterforms cropped from the
 * master logo and differ only in fill.
 */

const MASCOT = {
  src: "/assets/logo-mascot.png",
  width: 877,
  height: 830,
} as const;

const WORDMARK = {
  width: 1001,
  height: 437,
} as const;

export function Mascot({
  className = "",
  priority = false,
  /** Set when the mascot carries meaning on its own rather than decorating text. */
  alt = "",
}: {
  className?: string;
  priority?: boolean;
  alt?: string;
}) {
  return (
    <Image
      src={MASCOT.src}
      width={MASCOT.width}
      height={MASCOT.height}
      alt={alt}
      priority={priority}
      aria-hidden={alt === "" ? true : undefined}
      className={className}
    />
  );
}

export function Logo({
  /** The tone of the surface behind the logo, which decides the wordmark fill. */
  background = "light",
  className = "",
  priority = false,
}: {
  background?: "light" | "dark";
  className?: string;
  priority?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* 34px mascot, 18px wordmark — the navbar proportions from Design.md. */}
      <Mascot className="h-[34px] w-auto" priority={priority} />
      <Image
        src={
          background === "dark"
            ? "/assets/wordmark-white.png"
            : "/assets/wordmark-black.png"
        }
        width={WORDMARK.width}
        height={WORDMARK.height}
        alt="Evi"
        priority={priority}
        className="h-[18px] w-auto"
      />
    </span>
  );
}
