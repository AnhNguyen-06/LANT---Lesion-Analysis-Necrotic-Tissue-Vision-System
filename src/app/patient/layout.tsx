"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PatientNavbar } from "@/components/patient-navbar";
import { ReminderModal } from "@/components/reminder-modal";
import { HazardAlertModal } from "@/components/hazard-alert";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [showReminder, setShowReminder] = useState(false);
  const [showHazard, setShowHazard] = useState(false);
  const [activePatientId, setActivePatientId] = useState("PAT-10842");

  useEffect(() => {
    if (!isLoading && user && user.role === "doctor") {
      // Prevent doctor role from accessing patient workspace
      router.push("/doctor/dashboard");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const id = localStorage.getItem("LANT_ACTIVE_PATIENT_ID") || "PAT-10842";
    setActivePatientId(id);

    const handlePatientChange = (e: any) => {
      if (e.detail) setActivePatientId(e.detail);
    };
    window.addEventListener("LANT_PATIENT_CHANGED", handlePatientChange);
    return () => window.removeEventListener("LANT_PATIENT_CHANGED", handlePatientChange);
  }, []);

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans">
      <PatientNavbar
        onOpenReminderModal={() => setShowReminder(true)}
        onOpenHazardModal={() => setShowHazard(true)}
      />

      <div className="flex-1">
        {children}
      </div>

      {/* Global Modals */}
      {showReminder && (
        <ReminderModal
          patientId={activePatientId}
          onClose={() => setShowReminder(false)}
        />
      )}

      {showHazard && (
        <HazardAlertModal
          isOpen={showHazard}
          onClose={() => setShowHazard(false)}
          blackPercent={28}
          yellowPercent={48}
          hazardReasons={[
            "Mô hoại tử đen (Eschar) chiếm 28% vượt ngưỡng an toàn (>10%).",
            "Mô vảy vàng tiết dịch chiếm 48% có nguy cơ nhiễm trùng lan rộng."
          ]}
        />
      )}
    </div>
  );
}
