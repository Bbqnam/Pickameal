import type { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  /** Extra classes on the outer wrapper (e.g. custom bg) */
  className?: string;
  /** If true, the page handles its own padding (e.g. Index hero that bleeds edge-to-edge) */
  noPadding?: boolean;
}

/**
 * Consistent page wrapper used by every route.
 * - Fills viewport height, reserves space for the bottom nav.
 * - Responsive horizontal padding that scales with screen size.
 * - Centered max-width on larger screens.
 */
const PageShell = ({ children, className = "", noPadding = false }: PageShellProps) => (
  <div
    className={`min-h-[100dvh] pb-[env(safe-area-inset-bottom,0px)] ${className}`}
  >
    <div
      className={`mx-auto w-full max-w-2xl lg:max-w-4xl ${
        noPadding ? "" : "px-4 sm:px-6 lg:px-8"
      } pb-24`}
    >
      {children}
    </div>
  </div>
);

export default PageShell;
