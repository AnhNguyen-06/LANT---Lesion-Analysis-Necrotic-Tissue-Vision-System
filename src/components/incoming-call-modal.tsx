"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { DBStore } from "@/lib/db-store";
import { IncomingCallSignal } from "@/types/medical-schema";

interface IncomingCallModalProps {
  onAcceptCall: (signal: IncomingCallSignal) => void;
}

export function IncomingCallModal({ onAcceptCall }: IncomingCallModalProps) {
  const { user } = useAuth();
  const [activeSignal, setActiveSignal] = useState<IncomingCallSignal | null>(null);

  useEffect(() => {
    if (!user || user.role !== "PATIENT") return;

    const checkSignal = () => {
      const sig = DBStore.getCallSignal(user.id);
      if (sig && sig.status === "calling") {
        setActiveSignal(sig);
      } else {
        setActiveSignal(null);
      }
    };

    checkSignal();

    const handleIncomingCall = (e: CustomEvent<IncomingCallSignal>) => {
      if (e.detail.patientId === user.id && e.detail.status === "calling") {
        setActiveSignal(e.detail);
      }
    };

    const handleCallCleared = () => {
      setActiveSignal(null);
    };

    window.addEventListener("LANT_INCOMING_CALL" as any, handleIncomingCall);
    window.addEventListener("LANT_CALL_CLEARED" as any, handleCallCleared);

    const interval = setInterval(checkSignal, 1500);

    return () => {
      window.removeEventListener("LANT_INCOMING_CALL" as any, handleIncomingCall);
      window.removeEventListener("LANT_CALL_CLEARED" as any, handleCallCleared);
      clearInterval(interval);
    };
  }, [user]);

  if (!activeSignal) return null;

  const handleAccept = () => {
    if (!user) return;
    const acceptedSignal: IncomingCallSignal = {
      ...activeSignal,
      status: "accepted"
    };
    DBStore.sendCallSignal(acceptedSignal);
    setActiveSignal(null);
    onAcceptCall(acceptedSignal);
  };

  const handleDecline = () => {
    if (!user) return;
    DBStore.clearCallSignal(user.id);
    setActiveSignal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-oceanic-100 space-y-6 text-center animate-in zoom-in-95">
        
        {/* Calling Header */}
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 bg-oceanic-50 text-oceanic rounded-full text-xs font-bold font-mono uppercase tracking-wider border border-oceanic-200">
            Cuộc gọi Telehealth trực tuyến
          </span>
          
          <h2 className="text-xl font-black text-oceanic font-heading">
            Cuộc gọi video đến
          </h2>
          <p className="text-xs text-dusk-500">
            Bác sĩ đang yêu cầu kết nối phòng hội chẩn trực tuyến
          </p>
        </div>

        {/* Doctor Info Card */}
        <div className="p-4 rounded-2xl bg-azure-mist/60 border border-oceanic-100 space-y-1">
          <p className="text-sm font-bold text-oceanic font-heading">
            {activeSignal.doctorName || "BS. CKI Trần Minh Đức"}
          </p>
          <p className="text-xs text-slate-500">
            Chuyên khoa Chăm sóc Vết thương & Phẫu thuật Chấn thương
          </p>
          {activeSignal.woundTitle && (
            <p className="text-[11px] text-sapphire font-mono font-medium pt-1">
              Hồ sơ: {activeSignal.woundTitle}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleDecline}
            className="py-3 px-4 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200 transition-all"
          >
            <span>Từ chối</span>
          </button>

          <button
            onClick={handleAccept}
            className="py-3 px-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <span>Tham gia hội chẩn →</span>
          </button>
        </div>

      </div>
    </div>
  );
}
