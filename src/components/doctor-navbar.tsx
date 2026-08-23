"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function DoctorNavbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navLinks = [
    { href: "/doctor/dashboard", label: "Phân luồng rủi ro (Triage)" },
    { href: "/doctor/telehealth", label: "Phòng telehealth trực tuyến" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-oceanic-100/60 bg-white/95 text-slate-900 backdrop-blur-md font-sans">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo - Pure Typography */}
        <div className="flex items-center gap-3">
          <Link href="/doctor/dashboard" className="flex items-center gap-2 group">
            <span className="text-2xl font-black tracking-tight text-oceanic font-heading">
              LANT
            </span>
            <span className="rounded-full bg-indigoContrast-50 px-2.5 py-0.5 text-[10px] font-bold text-indigoContrast tracking-wider border border-indigoContrast-200 font-mono">
              Bác sĩ chuyên khoa
            </span>
          </Link>
        </div>

        {/* Dedicated Doctor Navigation Tabs - Pure Typography */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/doctor/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-indigoContrast text-white shadow-xs font-bold"
                    : "text-dusk-700 hover:bg-indigoContrast-50 hover:text-indigoContrast"
                }`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Tools: Doctor Profile & Logout */}
        <div className="flex items-center gap-3">
          
          <div className="hidden lg:flex items-center px-3 py-1.5 rounded-xl bg-azure-mist/60 border border-oceanic-100 text-xs text-oceanic font-medium">
            <span>Ca trực Bác sĩ CKI</span>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-2 px-3 rounded-xl border border-oceanic-100 bg-white hover:bg-oceanic-50 transition-colors text-slate-800"
            >
              <div className="text-left">
                <span className="text-xs font-bold text-oceanic block leading-tight">
                  {user?.fullName || "BS. CKI Trần Minh Đức"}
                </span>
                <span className="text-[10px] text-dusk-500 font-mono">CCHN-2021-8842</span>
              </div>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-oceanic-100 bg-white p-2 shadow-clinical-lg z-50 text-slate-800 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-900 font-heading">{user?.fullName || "BS. CKI Trần Minh Đức"}</p>
                  <p className="text-[10px] text-slate-500">{user?.email || "dr.duc@hospital.med.vn"}</p>
                  <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigoContrast-50 text-indigoContrast font-mono">
                    Bác sĩ chuyên khoa
                  </span>
                </div>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
                >
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
