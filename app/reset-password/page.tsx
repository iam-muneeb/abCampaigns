// app/reset-password/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Lock, Loader2, CheckCircle2, XCircle } from "lucide-react";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Derived validation
    const mismatch = confirm.length > 0 && password !== confirm;
    const tooShort = password.length > 0 && password.length < 8;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        setError("");
        setLoading(true);

        const res = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password }),
        });
        const data = await res.json();

        if (!res.ok) {
            setError(data.error || "Failed to reset password.");
            setLoading(false);
            return;
        }

        setSuccess(true);
        setTimeout(() => router.push("/login"), 2500);
    };

    if (!token) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Invalid Link</h2>
                <p className="text-slate-500 mb-6">This password reset link is missing a token. Please request a new one.</p>
                <button
                    onClick={() => router.push("/login")}
                    className="px-6 py-3 bg-[#5f2299] text-white font-bold rounded-xl hover:bg-[#762ec2] transition-colors"
                >
                    Back to Login
                </button>
            </div>
        );
    }

    if (success) {
        return (
            <div className="text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Password Updated!</h2>
                <p className="text-slate-500">Your password has been changed successfully. Redirecting you to login…</p>
            </div>
        );
    }

    return (
        <>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Set New Password</h2>
                <p className="text-slate-500">Choose a strong password for your account. Must be at least 8 characters.</p>
            </div>

            {error && (
                <div className="p-4 mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full pl-12 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-[#5f2299]/20 focus:border-[#5f2299] outline-none transition-all shadow-sm ${tooShort ? "border-red-300" : "border-slate-200"
                                }`}
                            placeholder="Minimum 8 characters"
                        />
                    </div>
                    {tooShort && <p className="text-xs text-red-500 mt-1.5 ml-1">Must be at least 8 characters.</p>}
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                        <input
                            type="password"
                            required
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className={`w-full pl-12 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-[#5f2299]/20 focus:border-[#5f2299] outline-none transition-all shadow-sm ${mismatch ? "border-red-300" : "border-slate-200"
                                }`}
                            placeholder="Repeat your password"
                        />
                    </div>
                    {mismatch && <p className="text-xs text-red-500 mt-1.5 ml-1">Passwords do not match.</p>}
                </div>

                <button
                    type="submit"
                    disabled={loading || mismatch || tooShort}
                    className="w-full flex items-center justify-center py-3.5 px-4 bg-[#5f2299] hover:bg-[#762ec2] text-white font-bold rounded-xl shadow-lg shadow-[#5f2299]/30 transition-all hover:-translate-y-0.5 mt-4 disabled:opacity-60 disabled:transform-none"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
                </button>

                <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="w-full py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                    Back to Login
                </button>
            </form>
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex bg-[#f4f6f8]">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#5f2299] relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="relative z-10 flex flex-col items-center text-center px-12">
                    <div className="w-24 h-24 bg-white p-2 rounded-2xl shadow-2xl mb-8 flex items-center justify-center">
                        <div className="relative w-full h-full">
                            <Image src="/logo/logo.png" alt="Logo" fill className="object-contain" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4">Secure Reset</h1>
                    <p className="text-purple-200 text-lg font-medium max-w-md">
                        Protect your AB Campaigns account with a strong, unique password.
                    </p>
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24">
                <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {/* Mobile logo */}
                    <div className="mb-10 lg:hidden flex items-center gap-3">
                        <div className="w-10 h-10 relative bg-[#5f2299] rounded-xl p-1 shadow-md">
                            <Image src="/logo/logo.png" alt="Logo" fill className="object-contain" />
                        </div>
                        <span className="text-2xl font-bold text-slate-800">AB Campaigns</span>
                    </div>

                    <Suspense fallback={<div className="text-slate-400">Loading…</div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
