import React, { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type AuthPanelProps = {
  onClose: () => void;
};

export const AuthPanel: React.FC<AuthPanelProps> = ({ onClose }) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      // App will pick up session via onAuthStateChange
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // After Google auth, Supabase will redirect back here
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      // We don't call onClose() here; the page will redirect anyway.
    } catch (err: any) {
      setErrorMsg(err.message ?? "Could not start Google login.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-neutral-900">
            {mode === "login"
              ? "Sign in to PracticallyZero"
              : "Create an account"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 text-xs"
          >
            ✕
          </button>
        </div>

        {/* Email / password form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs text-neutral-700">
            Email
            <input
              type="email"
              className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-neutral-700">
            Password
            <input
              type="password"
              className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {errorMsg && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-2 py-1">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-lg bg-black text-white text-sm py-2 disabled:opacity-50"
          >
            {loading
              ? "Working…"
              : mode === "login"
              ? "Sign in"
              : "Sign up"}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-4 mb-2 flex items-center gap-2">
          <div className="h-px flex-1 bg-neutral-200" />
          <span className="text-[10px] uppercase tracking-wide text-neutral-400">
            or
          </span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        {/* Google button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white py-2 text-sm text-neutral-800 hover:bg-neutral-50 disabled:opacity-50"
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white border border-neutral-300 text-[11px]">
            G
          </span>
          <span>Continue with Google</span>
        </button>

        <div className="mt-3 text-[11px] text-neutral-500">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="underline"
              >
                Sign up
              </button>
              .
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="underline"
              >
                Sign in
              </button>
              .
            </>
          )}
        </div>
      </div>
    </div>
  );
};
