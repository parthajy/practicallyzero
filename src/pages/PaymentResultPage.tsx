import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type Status = "success" | "failed" | "unknown";

export const PaymentResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("unknown");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const raw = params.get("status");

    if (raw === "success") setStatus("success");
    else if (raw === "failed" || raw === "cancelled") setStatus("failed");
    else setStatus("unknown");

    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 5000);

    return () => clearTimeout(timer);
  }, [location.search, navigate]);

  const title =
    status === "success"
      ? "Payment successful 🎉"
      : status === "failed"
      ? "Payment failed 😵"
      : "Payment status";

  const body =
    status === "success"
      ? "You’re now upgraded. Drag your friends here and waste more time."
      : status === "failed"
      ? "Something broke or you closed the checkout. You’ll go back to PracticallyZero to try again."
      : "We couldn’t read the payment status, but we’ll send you back to PracticallyZero.";

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <div className="max-w-sm w-full mx-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 px-8 py-6 shadow-sm text-center">
        <h1 className="text-lg font-semibold mb-2">{title}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
          {body}
        </p>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-500">
          Redirecting to dashboard in 5 seconds…
        </p>
      </div>
    </div>
  );
};
