"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { MockStorageService } from "@/lib/mock-storage";
import { Patient } from "@/types/medical-schema";

interface PatientNavbarProps {
  onOpenReminderModal?: () => void;
  onOpenHazardModal?: () => void;
}

export function PatientNavbar({ onOpenReminderModal, onOpenHazardModal }: PatientNavbarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const list = MockStorageService.getPatients();
    setPatients(list);
    if (list.length > 0) {
      const storedPatientId = localStorage.getItem("LANT_ACTIVE_PATIENT_ID") || list[0].id;
      const found = list.find(p => p.id === storedPatientId) || list[0];
      setActivePatient(found);
    }
  }, []);

  const handleSelectPatient = (p: Patient) => {
    setActivePatient(p);
    localStorage.setItem("LANT_ACTIVE_PATIENT_ID", p.id);
    setIsPatientDropdownOpen(false);
    window.dispatchEvent(new CustomEvent("LANT_PATIENT_CHANGED", { detail: p.id }));
  };

  const navLinks = [
    { href: "/patient/dashboard", label: "Tổng quan bệnh án" },
    { href: "/patient/scan", label: "Chụp & đo ArUco" },
    { href: "/patient/archive", label: "Kho ca bệnh đã liền" },
    { href: "/patient/telehealth", label: "Cổng bác sĩ & telehealth" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-oceanic-100/60 bg-white/95 backdrop-blur-md font-sans">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo - Pure Typography */}
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

        {/* Exclusive Patient Navigation Tabs - Clean Typography */}
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

        {/* Right Tools & User Switcher - Pure Typography */}
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

          {/* Active Patient Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsPatientDropdownOpen(!isPatientDropdownOpen)}
              className="flex items-center gap-2 rounded-xl border border-oceanic-100 bg-azure-mist/60 px-3 py-1.5 text-xs font-medium text-oceanic-900 hover:bg-oceanic-50 transition-colors"
            >
              <div className="text-left">
                <span className="font-bold text-oceanic block leading-tight">
                  {activePatient?.fullName || "Bệnh nhân"}
                </span>
                <span className="text-[10px] text-dusk-500 font-mono">
                  {activePatient?.medicalRecordNumber || "Hồ sơ"}
                </span>
              </div>
            </button>

            {isPatientDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-oceanic-100 bg-white p-2 shadow-clinical-lg z-50 animate-in fade-in zoom-in-95">
                <div className="px-2 py-1.5 text-[10px] font-bold text-dusk-400 uppercase tracking-wider font-heading">
                  Chuyển đổi hồ sơ bệnh nhân
                </div>
                <div className="space-y-1">
                  {patients.map((p) => {
                    const isSelected = p.id === activePatient?.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSelectPatient(p)}
                        className={`w-full flex items-center justify-between rounded-xl p-2.5 text-left text-xs transition-colors ${
                          isSelected ? "bg-oceanic-50 text-oceanic font-bold" : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{p.fullName}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{p.medicalRecordNumber} • {p.age} tuổi</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User Account / Logout Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-xs font-bold text-slate-700"
            >
              <span>Tài khoản</span>
            </button>

                {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-clinical-lg z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-900 font-heading">{user?.fullName || "Nguyễn Văn An"}</p>
                  <p className="text-[10px] text-slate-500">{user?.email || "an.nguyen62@gmail.com"}</p>
                  <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-oceanic-50 text-oceanic font-mono">
                    Vai trò: Bệnh nhân
                  </span>
                </div>

                <Link
                  href="/patient/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full block px-3 py-2 text-xs font-bold text-oceanic hover:bg-oceanic-50 rounded-xl transition-colors text-left"
                >
                  <span>Hồ sơ cá nhân & Địa chỉ</span>
                </Link>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    window.dispatchEvent(new CustomEvent("LANT_TRIGGER_TOUR"));
                  }}
                  className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left"
                >
                  <span>Xem lại hướng dẫn</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left border-t border-slate-100 mt-1"
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
