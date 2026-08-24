import type { ReactNode } from "react";

/**
 * Page gutter and max line length. Design.md defines two widths:
 * 1200px for full sections, 760px for narrow reading columns.
 */
export function Container({
  children,
  width = "page",
  className = "",
}: {
  children: ReactNode;
  width?: "page" | "narrow";
  className?: string;
}) {
  const max = width === "narrow" ? "max-w-[760px]" : "max-w-[1200px]";
  return (
    <div className={`mx-auto w-full ${max} px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}
