"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth, RoleType } from "@/context/AuthContext";

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

  useEffect(() => {
    const r = searchParams.get("role")?.toLowerCase();
    if (r === "doctor" || r === "patient") {
      setRole(r as RoleType);
    }
  }, [searchParams]);

  const handleQuickDemoFill = (selectedRole: RoleType) => {
    setRole(selectedRole);
    if (selectedRole === "patient") {
      setEmail("an.nguyen62@gmail.com");
      setPassword("patient123");
    } else {
      setEmail("dr.duc@hospital.med.vn");
      setPassword("doctor123");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      login(email, role);
      setIsLoading(false);
    }, 400);
  };

  const isPatient = role === "patient";

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
              onClick={() => setRole("patient")}
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
              onClick={() => setRole("doctor")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                !isPatient
                  ? "bg-indigoContrast text-white shadow-xs"
                  : "text-slate-600 hover:text-indigoContrast"
              }`}
            >
              <span>Bác sĩ / Y tế</span>
            </button>
          </div>

          {/* Quick Demo Credentials Button */}
          <div className="rounded-2xl bg-azure-mist/60 p-3.5 flex items-center justify-between border border-oceanic-100">
            <div className="text-xs font-semibold text-oceanic-900 font-heading">
              Tài khoản mẫu {isPatient ? "bệnh nhân" : "bác sĩ"}
            </div>
            <button
              type="button"
              onClick={() => handleQuickDemoFill(role)}
              className="text-[11px] font-bold text-sapphire bg-white px-3 py-1 rounded-lg border border-oceanic-200 hover:bg-oceanic-50 transition-colors shadow-2xs"
            >
              Điền tự động
            </button>
          </div>

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
                placeholder={isPatient ? "an.nguyen62@gmail.com" : "dr.duc@hospital.med.vn"}
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
              className={`w-full py-3.5 rounded-2xl text-xs font-bold text-white shadow-xs transition-all ${
                isPatient
                  ? "bg-oceanic hover:bg-oceanic-800"
                  : "bg-indigoContrast hover:bg-indigoContrast-900"
              }`}
            >
              {isLoading ? (
                <span>Đang xác thực...</span>
              ) : (
                <span>Vào không gian {isPatient ? "bệnh nhân" : "bác sĩ"} →</span>
              )}
            </button>
          </form>

          {/* Return to Role Gateway */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link
              href="/"
              className="text-slate-500 hover:text-oceanic transition-colors"
            >
              <span>← Đổi vai trò</span>
            </Link>

            <Link
              href={`/auth/register?role=${role}`}
              className="font-bold text-sapphire hover:underline"
            >
              Đăng ký tài khoản mới
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs">Đang tải trang đăng nhập...</div>}>
      <LoginForm />
    </Suspense>
  );
}
