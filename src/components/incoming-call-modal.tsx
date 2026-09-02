"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { TelehealthSignalingEngine, TelehealthSignal } from "@/lib/telehealth-signaling";

interface IncomingCallModalProps {
  onAcceptCall: (signal: TelehealthSignal) => void;
}

export function IncomingCallModal({ onAcceptCall }: IncomingCallModalProps) {
  const { user } = useAuth();
  const [activeSignal, setActiveSignal] = useState<TelehealthSignal | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ringtoneIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play synthesized gentle medical chime ringtone
  const startRingtone = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const playChime = () => {
        if (!audioContextRef.current || audioContextRef.current.state === "closed") return;
        const now = audioContextRef.current.currentTime;
        
        // High note
        const osc1 = audioContextRef.current.createOscillator();
        const gain1 = audioContextRef.current.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(659.25, now); // E5
        gain1.gain.setValueAtTime(0.08, now);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        osc1.connect(gain1);
        gain1.connect(audioContextRef.current.destination);
        osc1.start(now);
        osc1.stop(now + 0.5);

        // Harmonizing note
        const osc2 = audioContextRef.current.createOscillator();
        const gain2 = audioContextRef.current.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(880.0, now + 0.15); // A5
        gain2.gain.setValueAtTime(0.08, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
        osc2.connect(gain2);
        gain2.connect(audioContextRef.current.destination);
        osc2.start(now + 0.15);
        osc2.stop(now + 0.7);
      };

      playChime();
      ringtoneIntervalRef.current = setInterval(playChime, 2400);
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  const stopRingtone = useCallback(() => {
    if (ringtoneIntervalRef.current) {
      clearInterval(ringtoneIntervalRef.current);
      ringtoneIntervalRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== "PATIENT") return;

    const myPatientId = user.patientId || user.id;

    // Check initial active call from storage
    const existingCall = TelehealthSignalingEngine.getActiveCall(myPatientId);
    if (existingCall && existingCall.type === "CALL_INITIATED") {
      setActiveSignal(existingCall);
      startRingtone();
    }

    // Subscribe to real-time signals (BroadcastChannel + StorageEvent)
    const unsubscribe = TelehealthSignalingEngine.subscribe((signal) => {
      if (signal.patientId === myPatientId) {
        if (signal.type === "CALL_INITIATED") {
          setActiveSignal(signal);
          startRingtone();
        } else if (signal.type === "CALL_ENDED" || signal.type === "CALL_DECLINED") {
          setActiveSignal(null);
          stopRingtone();
        }
      }
    });

    return () => {
      unsubscribe();
      stopRingtone();
    };
  }, [user, startRingtone, stopRingtone]);

  if (!activeSignal || activeSignal.type !== "CALL_INITIATED") return null;

  const handleAccept = () => {
    if (!user) return;
    stopRingtone();
    const myPatientId = user.patientId || user.id;

    TelehealthSignalingEngine.sendSignal({
      type: "CALL_ACCEPTED",
      doctorId: activeSignal.doctorId,
      patientId: myPatientId,
      timestamp: Date.now()
    });

    const accepted = { ...activeSignal };
    setActiveSignal(null);
    onAcceptCall(accepted);
  };

  const handleDecline = () => {
    if (!user) return;
    stopRingtone();
    const myPatientId = user.patientId || user.id;

    TelehealthSignalingEngine.sendSignal({
      type: "CALL_DECLINED",
      doctorId: activeSignal.doctorId,
      patientId: myPatientId,
      reason: "Bệnh nhân bận",
      timestamp: Date.now()
    });

    TelehealthSignalingEngine.clearActiveCall(myPatientId);
    setActiveSignal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl p-7 sm:p-8 shadow-2xl border border-oceanic-100 space-y-6 text-center animate-in zoom-in-95 relative overflow-hidden">
        
        {/* Animated Pulsing Ring */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
          <div className="absolute inset-2 rounded-full bg-emerald-500/30 animate-pulse"></div>
          <div className="relative w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center text-2xl font-black shadow-lg font-heading">
            {activeSignal.doctorName ? activeSignal.doctorName.charAt(0) : "D"}
          </div>
        </div>

        {/* Calling Info */}
        <div className="space-y-1.5">
          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-mono font-bold uppercase tracking-wider border border-emerald-200">
            Cuộc gọi video đến
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-oceanic font-heading pt-1">
            {activeSignal.doctorName || "Bác sĩ chuyên khoa"}
          </h2>
          <p className="text-xs text-dusk-500">
            Bác sĩ đang yêu cầu kết nối phòng hội chẩn Telehealth trực tuyến
          </p>
          {activeSignal.woundTitle && (
            <div className="pt-2">
              <span className="inline-block px-3 py-1 bg-azure-mist text-oceanic text-xs font-bold rounded-xl border border-oceanic-100 font-mono">
                Hồ sơ: {activeSignal.woundTitle}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleDecline}
            className="py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all"
          >
            <span>Từ chối</span>
          </button>

          <button
            type="button"
            onClick={handleAccept}
            className="py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <span>Chấp nhận & Tham gia →</span>
          </button>
        </div>

      </div>
    </div>
  );
}
