// app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Lock, User, Mail, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Form States
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (res?.error) {
      setError("Invalid username or password.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong. Please try again.");
      return;
    }
    setMessage("If that email is registered, a reset link has been sent. Check your inbox.");
  };

  return (
    <div className="min-h-screen flex bg-[#f4f6f8]">
      {/* Left Panel: The Creative Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#5f2299] relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center text-center px-12">
          <div className="w-24 h-24 bg-white p-2 rounded-2xl shadow-2xl mb-8 flex items-center justify-center">
            <div className="relative w-full h-full">
              <Image src="/logo/logo.png" alt="Logo" fill className="object-contain" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4">AB Campaigns</h1>
          <p className="text-purple-200 text-lg font-medium max-w-md">
            The intelligent notification manager built exclusively for the AttireBulk ecosystem.
          </p>
        </div>
      </div>

      {/* Right Panel: The Interactive Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 relative">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">

          <div className="mb-10 lg:hidden flex items-center gap-3">
            <div className="w-10 h-10 relative bg-[#5f2299] rounded-xl p-1 shadow-md">
              <Image src="/logo/logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <span className="text-2xl font-bold text-slate-800">AB Campaigns</span>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            {isForgotMode ? "Reset Password" : "Welcome Back"}
          </h2>
          <p className="text-slate-500 mb-8">
            {isForgotMode ? "Enter your email to receive a secure reset link." : "Enter your credentials to access the dashboard."}
          </p>

          {error && <div className="p-4 mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">{error}</div>}
          {message && <div className="p-4 mb-6 text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl">{message}</div>}

          {/* Form Content */}
          {!isForgotMode ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5f2299]/20 focus:border-[#5f2299] outline-none transition-all shadow-sm"
                    placeholder="admin_devshook"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-slate-700">Password</label>
                  <button type="button" onClick={() => setIsForgotMode(true)} className="text-xs font-bold text-[#5f2299] hover:text-[#762ec2]">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5f2299]/20 focus:border-[#5f2299] outline-none transition-all shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button disabled={loading} className="w-full flex items-center justify-center py-3.5 px-4 bg-[#5f2299] hover:bg-[#762ec2] text-white font-bold rounded-xl shadow-lg shadow-[#5f2299]/30 transition-all hover:-translate-y-0.5 mt-4 disabled:opacity-70 disabled:transform-none">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5f2299]/20 focus:border-[#5f2299] outline-none transition-all shadow-sm"
                    placeholder="admin@devshook.com"
                  />
                </div>
              </div>

              <button disabled={loading} className="w-full flex items-center justify-center py-3.5 px-4 bg-[#5f2299] hover:bg-[#762ec2] text-white font-bold rounded-xl shadow-lg shadow-[#5f2299]/30 transition-all mt-4">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
              </button>

              <button type="button" onClick={() => setIsForgotMode(false)} className="w-full py-3 px-4 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors mt-2">
                Back to Login
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}