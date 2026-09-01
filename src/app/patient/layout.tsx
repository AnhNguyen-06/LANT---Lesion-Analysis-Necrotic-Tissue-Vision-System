"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PatientNavbar } from "@/components/patient-navbar";
import { ReminderModal } from "@/components/reminder-modal";
import { HazardAlertModal } from "@/components/hazard-alert";
import { IncomingCallModal } from "@/components/incoming-call-modal";
import { TelehealthCallModal } from "@/components/telehealth-call-modal";
import { OnboardingTour } from "@/components/onboarding-tour";
import { DBStore } from "@/lib/db-store";
import { IncomingCallSignal, Patient } from "@/types/medical-schema";

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

  // Telehealth Active Room State
  const [activeCallSignal, setActiveCallSignal] = useState<IncomingCallSignal | null>(null);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (!isLoading && user && user.role === "CLINICIAN") {
      router.push("/doctor/dashboard");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const id = user?.patientId || localStorage.getItem("LANT_ACTIVE_PATIENT_ID") || "PAT-10842";
    setActivePatientId(id);
    const p = DBStore.getPatientById(id) || DBStore.getPatients()[0];
    setActivePatient(p);

    const handlePatientChange = (e: any) => {
      if (e.detail) {
        setActivePatientId(e.detail);
        const updatedP = DBStore.getPatientById(e.detail);
        if (updatedP) setActivePatient(updatedP);
      }
    };

    window.addEventListener("LANT_PATIENT_CHANGED", handlePatientChange);
    return () => window.removeEventListener("LANT_PATIENT_CHANGED", handlePatientChange);
  }, [user]);

  const handleAcceptCall = (signal: IncomingCallSignal) => {
    setActiveCallSignal(signal);
  };

  const handleCloseTelehealthRoom = () => {
    if (activePatient) {
      DBStore.clearCallSignal(activePatient.id);
    }
    setActiveCallSignal(null);
  };

  const firstWound = activePatient?.wounds[0];
  const firstSnapshot = firstWound?.snapshots[firstWound.snapshots.length - 1];

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans">
      <PatientNavbar
        onOpenReminderModal={() => setShowReminder(true)}
        onOpenHazardModal={() => setShowHazard(true)}
      />

      <div className="flex-1">
        {children}
      </div>

      {/* Global Incoming Call Listener Modal */}
      <IncomingCallModal onAcceptCall={handleAcceptCall} />

      {/* Global Telehealth Video Room Modal */}
      {activeCallSignal && activePatient && firstWound && firstSnapshot && (
        <TelehealthCallModal
          isOpen={!!activeCallSignal}
          onClose={handleCloseTelehealthRoom}
          patient={activePatient}
          wound={firstWound}
          activeSnapshot={firstSnapshot}
          onSignSoap={(assessment, plan) => {
            console.log("Telehealth SOAP note noted:", assessment, plan);
          }}
        />
      )}

      {/* Global Onboarding Tour */}
      <OnboardingTour />

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
