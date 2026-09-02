"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface PatientNavbarProps {
  onOpenReminderModal?: () => void;
  onOpenHazardModal?: () => void;
}

export function PatientNavbar({ onOpenReminderModal, onOpenHazardModal }: PatientNavbarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const navLinks = [
    { href: "/patient/dashboard", label: "Tổng quan bệnh án" },
    { href: "/patient/scan", label: "Chụp & đo ArUco" },
    { href: "/patient/archive", label: "Kho ca bệnh đã liền" },
    { href: "/patient/telehealth", label: "Cổng bác sĩ & telehealth" },
  ];

  const userInitial = user?.fullName ? user.fullName.trim().charAt(0).toUpperCase() : "B";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-oceanic-100/60 bg-white/95 backdrop-blur-md font-sans">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/patient/dashboard" className="flex items-center gap-2 group">
            <span className="text-2xl font-black tracking-tight text-oceanic font-heading">
              LANT
            </span>
            <span className="rounded-full bg-oceanic-50 px-2 py-0.5 text-[10px] font-bold text-oceanic-700 tracking-wider border border-oceanic-200 font-mono">
              Bệnh nhân
            </span>
          </Link>
        </div>

        {/* Exclusive Patient Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/patient/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-2 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-oceanic text-white font-bold shadow-xs"
                    : "text-dusk-700 hover:bg-oceanic-50 hover:text-oceanic"
                }`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Tools & Isolated Authenticated User Badge */}
        <div className="flex items-center gap-2.5">
          
          {/* Emergency 115 Trigger */}
          <button
            onClick={() => onOpenHazardModal && onOpenHazardModal()}
            className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors"
            title="Kích hoạt cảnh báo khẩn cấp 115"
          >
            <span>Báo động 115</span>
          </button>

          {/* Daily Streak & Reminder button */}
          <button
            onClick={() => onOpenReminderModal && onOpenReminderModal()}
            className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-colors font-mono"
            title="Lịch nhắc chụp vết thương & Chuỗi tuân thủ"
          >
            <span>Chuỗi 5 ngày</span>
          </button>

          {/* Strictly Authenticated Single-User Profile Badge */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 rounded-2xl border border-oceanic-100 bg-azure-mist/60 px-3 py-1.5 text-xs font-medium text-oceanic-900 hover:bg-oceanic-50 transition-all shadow-2xs"
            >
              <div className="w-7 h-7 rounded-full bg-oceanic text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                {user?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{userInitial}</span>
                )}
              </div>

              <div className="text-left hidden sm:block">
                <span className="font-bold text-oceanic block leading-tight">
                  {user?.fullName || "Bệnh nhân"}
                </span>
                <span className="text-[10px] text-dusk-500 font-mono">
                  {user?.medicalRecordNumber || user?.phone || "MRN-2024-8841"}
                </span>
              </div>
            </button>

            {/* Authenticated User Actions Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-clinical-lg z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-oceanic font-heading">{user?.fullName || "Bệnh nhân"}</p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{user?.email}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-oceanic-50 text-oceanic font-mono">
                      Vai trò: Bệnh nhân
                    </span>
                    {user?.medicalRecordNumber && (
                      <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                        {user.medicalRecordNumber}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href="/patient/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full block px-3 py-2 text-xs font-bold text-oceanic hover:bg-oceanic-50 rounded-xl transition-colors text-left"
                >
                  <span>Hồ sơ cá nhân & Địa chỉ</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    window.dispatchEvent(new CustomEvent("LANT_TRIGGER_TOUR"));
                  }}
                  className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left"
                >
                  <span>Xem lại hướng dẫn (7 bước)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left border-t border-slate-100 mt-1"
                >
                  <span>Đăng xuất tài khoản</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
