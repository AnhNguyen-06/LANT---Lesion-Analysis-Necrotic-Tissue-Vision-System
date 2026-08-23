"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { MockStorageService, SEED_USERS } from "@/lib/mock-storage";
import { Patient, UserAccount } from "@/types/medical-schema";

interface NavbarProps {
  onOpenReminderModal?: () => void;
  onOpenHazardModal?: () => void;
}

export function Navbar({ onOpenReminderModal, onOpenHazardModal }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
    setIsDropdownOpen(false);
    window.dispatchEvent(new CustomEvent("LANT_PATIENT_CHANGED", { detail: p.id }));
  };

  const handleLogout = () => {
    localStorage.removeItem("LANT_AUTH_USER");
    router.push("/");
  };

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
              Vision AI
            </span>
          </Link>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5">
          <Link
            href="/patient/dashboard"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-dusk-700 hover:bg-oceanic-50 hover:text-oceanic"
          >
            Tổng quan bệnh án
          </Link>
          <Link
            href="/patient/scan"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-dusk-700 hover:bg-oceanic-50 hover:text-oceanic"
          >
            Chụp & đo ArUco
          </Link>
          <Link
            href="/patient/archive"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-dusk-700 hover:bg-oceanic-50 hover:text-oceanic"
          >
            Kho ca bệnh đã liền
          </Link>
        </nav>

        {/* Right Tools */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenHazardModal && onOpenHazardModal()}
            className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors"
          >
            Báo động 115
          </button>
        </div>

      </div>
    </header>
  );
}
