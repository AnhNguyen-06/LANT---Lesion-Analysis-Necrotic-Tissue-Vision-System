"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth, RoleType } from "@/context/AuthContext";
import { SEED_USERS_DB } from "@/lib/db-store";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const initialRoleParam = searchParams.get("role")?.toLowerCase();
  const initialRole: RoleType = initialRoleParam === "doctor" ? "doctor" : "patient";

  const [role, setRole] = useState<RoleType>(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const r = searchParams.get("role")?.toLowerCase();
    if (r === "doctor" || r === "patient") {
      setRole(r as RoleType);
    }
  }, [searchParams]);

  const handleSelectDemoUser = (userEmail: string, pass: string) => {
    setEmail(userEmail);
    setPassword(pass);
    setErrorMessage("");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    setTimeout(() => {
      const success = login(email, role, password);
      if (!success) {
        setErrorMessage("Email hoặc vai trò không khớp. Vui lòng kiểm tra lại.");
      }
      setIsLoading(false);
    }, 400);
  };

  const isPatient = role === "patient";
  const demoUsers = SEED_USERS_DB.filter(u => isPatient ? u.role === "PATIENT" : u.role === "CLINICIAN");

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link href="/" className="inline-block group mb-1">
          <span className="text-3xl font-black text-oceanic tracking-tight font-heading">LANT</span>
          <span className="text-[10px] font-bold text-dusk-500 tracking-wider uppercase block font-mono">Vision AI</span>
        </Link>

        <h2 className="text-2xl font-black text-oceanic font-heading tracking-tight">
          Đăng nhập vào hệ thống
        </h2>
        <p className="text-xs text-dusk-500">
          Truy cập đúng phân hệ bảo mật {isPatient ? "bệnh nhân" : "bác sĩ"}
        </p>
      </div>

      {/* Main Login Card - Pure Typography */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-3xl bg-white/95 p-8 shadow-clinical space-y-5 border border-oceanic-100/70">
          
          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setRole("patient");
                setEmail("");
                setPassword("");
                setErrorMessage("");
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                isPatient
                  ? "bg-oceanic text-white shadow-xs"
                  : "text-slate-600 hover:text-oceanic"
              }`}
            >
              <span>Bệnh nhân</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole("doctor");
                setEmail("");
                setPassword("");
                setErrorMessage("");
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                !isPatient
                  ? "bg-indigoContrast text-white shadow-xs"
                  : "text-slate-600 hover:text-indigoContrast"
              }`}
            >
              <span>Bác sĩ / Y tế</span>
            </button>
          </div>

          {/* Quick Demo Credentials Picker */}
          <div className="rounded-2xl bg-azure-mist/70 p-4 border border-oceanic-100 space-y-2">
            <div className="text-xs font-bold text-oceanic-900 font-heading">
              Chọn nhanh tài khoản mẫu:
            </div>
            <div className="flex flex-col gap-1.5">
              {demoUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectDemoUser(u.email, u.passwordHash)}
                  className={`text-left px-3 py-2 rounded-xl text-xs transition-all border ${
                    email === u.email
                      ? "bg-white border-oceanic text-oceanic font-bold shadow-2xs"
                      : "bg-white/80 border-slate-200/80 text-slate-700 hover:bg-white hover:border-oceanic-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{u.fullName}</span>
                    <span className="text-[10px] font-mono text-dusk-500">{u.email}</span>
                  </div>
                  {u.medicalRecordNumber && (
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{u.medicalRecordNumber}</div>
                  )}
                  {u.specialty && (
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{u.specialty}</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-heading">
                Email đăng ký y tế:
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isPatient ? "patient.an@lant.med" : "doctor.duc@lant.med"}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-xs font-medium text-slate-800 focus:border-oceanic focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-heading">
                Mật khẩu:
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-xs font-medium text-slate-800 focus:border-oceanic focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-white text-xs tracking-wide transition-all shadow-md ${
                isPatient
                  ? "bg-oceanic hover:bg-oceanic-800"
                  : "bg-indigoContrast hover:bg-indigo-950"
              } ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
            >
              <span>{isLoading ? "Đang xác thực..." : `Đăng nhập ${isPatient ? "bệnh nhân" : "bác sĩ"}`}</span>
            </button>
          </form>

          {/* Register Link */}
          <div className="pt-2 text-center text-xs text-slate-600">
            <span>Chưa có tài khoản y tế? </span>
            <Link
              href={`/auth/register?role=${role}`}
              className="font-bold text-sapphire hover:underline"
            >
              Đăng ký hồ sơ mới
            </Link>
          </div>

          <div className="text-center pt-1">
            <Link href="/" className="text-[11px] text-dusk-500 hover:text-oceanic font-medium">
              ← Quay lại cổng chọn vai trò
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-slate-500 font-mono">Đang tải biểu mẫu...</div>}>
      <LoginForm />
    </Suspense>
  );
}
