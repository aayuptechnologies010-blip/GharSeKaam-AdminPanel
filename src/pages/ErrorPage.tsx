import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ErrorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState<string>(
    "Something went wrong — we couldn't complete that action."
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // If a route passed an error message via location.state, prefer it
    if (location && (location.state as any)?.error) {
      setErrorMessage((location.state as any).error as string);
    }
  }, [location]);

  const handleHome = () => navigate("/");
  const handleBack = () => navigate(-1);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(errorMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // ignore
    }
  };

  const mailto = `mailto:support@yourcompany.com?subject=App%20Error&body=${encodeURIComponent(
    errorMessage
  )}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-5xl w-full bg-white dark:bg-slate-900 shadow-lg rounded-2xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1 flex items-center justify-center">
          <svg
            width="320"
            height="260"
            viewBox="0 0 320 260"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="max-w-full h-auto"
            aria-hidden
          >
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0" stopColor="#7c3aed" />
                <stop offset="1" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <rect x="12" y="28" width="296" height="196" rx="16" fill="#eef2ff" />
            <rect x="28" y="48" width="260" height="156" rx="12" fill="url(#g)" opacity="0.12" />
            <g transform="translate(48,72)">
              <circle cx="64" cy="18" r="14" fill="#fff" opacity="0.9" />
              <rect x="0" y="46" width="192" height="10" rx="5" fill="#fff" opacity="0.9" />
              <rect x="0" y="66" width="140" height="10" rx="5" fill="#fff" opacity="0.85" />
              <rect x="0" y="86" width="100" height="10" rx="5" fill="#fff" opacity="0.8" />
            </g>
            <path d="M40 210 C80 170, 240 170, 280 210" stroke="url(#g)" strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.9" />
          </svg>
        </div>

        <div className="flex-1">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
            Oops — something broke
          </h1>
          <p className="mt-4 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            We encountered an issue while processing your request. Please check the details below.
          </p>

          <div className="mt-6 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg p-4 text-sm text-slate-700 dark:text-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <strong className="block text-xs text-slate-500 dark:text-slate-400">Error details</strong>
                <pre className="whitespace-pre-wrap break-words mt-1 text-sm leading-relaxed">{errorMessage}</pre>
              </div>
              <div className="flex-shrink-0 flex flex-col items-end gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-sm"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <a href={mailto} className="text-xs text-slate-500 hover:underline">
                  Report
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleHome}
              className="inline-flex items-center justify-center rounded-md px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-medium shadow hover:opacity-95"
            >
              Go to Home
            </button>

            <button
              onClick={handleBack}
              className="inline-flex items-center justify-center rounded-md px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-transparent hover:bg-slate-50"
            >
              Go Back
            </button>

            <a
              href={mailto}
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm text-slate-700 dark:text-slate-200 bg-transparent border border-dashed border-slate-200 dark:border-slate-700 hover:bg-slate-50"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
