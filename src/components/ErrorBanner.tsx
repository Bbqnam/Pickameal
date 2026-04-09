import { XCircle } from "lucide-react";

interface ErrorBannerProps {
  message: string | null;
  onClose: () => void;
}

const ErrorBanner = ({ message, onClose }: ErrorBannerProps) => {
  if (!message) return null;
  return (
    <div className="fixed top-4 left-1/2 z-50 w-[min(95vw,720px)] -translate-x-1/2 rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 via-white to-rose-50 px-6 py-4 shadow-2xl shadow-rose-500/10">
      <div className="flex items-start gap-3">
        <span className="text-rose-500">
          <XCircle className="h-6 w-6" />
        </span>
        <div className="flex-1 text-sm text-rose-900">
          <strong className="block text-base">Something went wrong</strong>
          <p className="mt-1 text-[13px] leading-tight">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-rose-500 transition hover:text-rose-700"
          aria-label="Dismiss error"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ErrorBanner;
