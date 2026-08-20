"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Activity, 
  Camera, 
  Archive, 
  Stethoscope, 
  Bell, 
  ShieldAlert, 
  Flame,
  UserCheck,
  ChevronDown
} from "lucide-react";
import { useState, useEffect } from "react";
import { MockStorageService, SEED_PATIENTS } from "@/lib/mock-storage";
import { Patient } from "@/types/medical-schema";

interface NavbarProps {
  onOpenReminderModal?: () => void;
  onOpenHazardModal?: () => void;
}

export function Navbar({ onOpenReminderModal, onOpenHazardModal }: NavbarProps) {
  const pathname = usePathname();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    setIsDropdownOpen(false);
    // Trigger custom event so page components can react
    window.dispatchEvent(new CustomEvent("LANT_PATIENT_CHANGED", { detail: p.id }));
  };

  const navLinks = [
    { href: "/dashboard", label: "Tổng Quan Bệnh Án", icon: Activity },
    { href: "/scan", label: "Chụp & Phân Tích AI", icon: Camera },
    { href: "/archive", label: "Lưu Trữ Đã Liền", icon: Archive },
    { href: "/clinician", label: "Cổng Bác Sĩ & Telehealth", icon: Stethoscope, badge: "PRO" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-oceanic-100 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-oceanic to-sapphire text-white shadow-md shadow-oceanic/20 transition-transform group-hover:scale-105">
              <Activity className="h-6 w-6 text-azure-mist animate-pulse" />
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-medical-safe border-2 border-white ring-1 ring-medical-safe/30" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-oceanic">LANT</span>
                <span className="rounded bg-oceanic-50 px-1.5 py-0.5 text-[10px] font-bold text-oceanic-700 tracking-wider border border-oceanic-200">
                  VISION AI
                </span>
              </div>
              <p className="text-[10px] font-medium text-dusk-500 tracking-tight leading-none">
                Hệ Thống Giám Sát Vết Thương Y Khoa
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs lg:text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-oceanic text-white shadow-sm shadow-oceanic/30"
                    : "text-dusk-700 hover:bg-oceanic-50 hover:text-oceanic"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-dusk-500"}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    isActive ? "bg-white/20 text-white" : "bg-sapphire-100 text-sapphire-700"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Tools & Patient Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Emergency Alert Hotline Button */}
          <button
            onClick={() => onOpenHazardModal && onOpenHazardModal()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 text-medical-granulation border border-red-200 text-xs font-semibold hover:bg-red-100 transition-colors"
            title="Kích hoạt cảnh báo khẩn cấp / Cắt lọc hoại tử"
          >
            <ShieldAlert className="h-4 w-4 animate-bounce" />
            <span className="hidden xl:inline">Báo Động 115</span>
          </button>

          {/* Daily Streak & Reminder button */}
          <button
            onClick={() => onOpenReminderModal && onOpenReminderModal()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold hover:bg-amber-100 transition-colors"
            title="Lịch nhắc chụp vết thương & Chuỗi tuân thủ"
          >
            <Flame className="h-4 w-4 text-amber-600 fill-amber-500" />
            <span className="font-bold">5 Ngày</span>
          </button>

          {/* Active Patient Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-oceanic-200 bg-azure-mist/60 px-3 py-1.5 text-xs font-medium text-oceanic-900 hover:bg-oceanic-50 transition-colors"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-oceanic text-[11px] font-bold text-white">
                {activePatient ? activePatient.fullName.charAt(0) : "P"}
              </div>
              <div className="text-left hidden sm:block">
                <p className="font-bold text-oceanic leading-tight truncate max-w-[110px]">
                  {activePatient?.fullName || "Chọn bệnh nhân"}
                </p>
                <p className="text-[10px] text-dusk-500 leading-none">
                  {activePatient?.medicalRecordNumber || "Hồ sơ"}
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-dusk-500" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-oceanic-100 bg-white p-2 shadow-clinical-lg z-50 animate-in fade-in zoom-in-95">
                <div className="px-2 py-1.5 text-[11px] font-bold text-dusk-400 uppercase tracking-wider">
                  Chuyển Đổi Hồ Sơ Bệnh Nhân
                </div>
                <div className="space-y-1">
                  {patients.map((p) => {
                    const isSelected = p.id === activePatient?.id;
                    const isCritical = p.riskTier === "high_critical";
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSelectPatient(p)}
                        className={`w-full flex items-center justify-between rounded-lg p-2 text-left text-xs transition-colors ${
                          isSelected ? "bg-oceanic-50 text-oceanic font-bold" : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold">{p.fullName}</span>
                            {isCritical && (
                              <span className="h-2 w-2 rounded-full bg-medical-granulation animate-ping" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500">{p.medicalRecordNumber} • {p.age} tuổi</p>
                        </div>
                        {isSelected && <UserCheck className="h-4 w-4 text-oceanic" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
