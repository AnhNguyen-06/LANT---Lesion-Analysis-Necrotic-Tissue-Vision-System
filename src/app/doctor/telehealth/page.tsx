"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MockStorageService } from "@/lib/mock-storage";
import { TelehealthSession } from "@/types/medical-schema";

export default function DoctorTelehealthListPage() {
  const [sessions, setSessions] = useState<TelehealthSession[]>([]);

  useEffect(() => {
    const list = MockStorageService.getTelehealthSessions();
    setSessions(list);
  }, []);

  return (
    <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-oceanic-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigoContrast-50 px-2.5 py-0.5 text-xs font-bold text-indigoContrast border border-indigoContrast-200 font-mono uppercase">
              Phòng hội chẩn tự động
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-oceanic font-heading mt-1">
            Danh sách cuộc hẹn telehealth <span className="font-editorial italic font-normal text-sapphire">trực tuyến</span>
          </h1>
          <p className="text-xs sm:text-sm text-dusk-600">
            Quản lý và bắt đầu các phiên hội chẩn từ xa được lên lịch cùng bệnh nhân
          </p>
        </div>
      </div>

      {/* Grid of Sessions - Pure Typography */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="rounded-3xl bg-white/95 p-7 shadow-clinical space-y-4 hover:shadow-clinical-lg transition-all border border-oceanic-100/70"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-oceanic font-heading">{session.patientName}</h3>
                <span className="text-xs text-dusk-500 font-mono">{session.patientId}</span>
              </div>

              <span className="rounded-full bg-sapphire-50 text-sapphire-800 px-3 py-1 text-xs font-bold font-mono border border-sapphire-200">
                {new Date(session.scheduledTime).toLocaleDateString("vi-VN")} • {new Date(session.scheduledTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            <div className="rounded-2xl bg-azure-mist/40 p-4 space-y-1 border border-oceanic-100/50">
              <span className="text-[10px] font-bold text-oceanic uppercase tracking-wider block font-heading">Vấn đề hội chẩn</span>
              <p className="text-xs font-semibold text-slate-800">{session.woundTitle}</p>
              <p className="text-xs text-dusk-600 leading-relaxed">{session.clinicalSummary}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-emerald-700 font-medium">
                Mã hóa WebRTC E2EE
              </span>

              <Link
                href={`/doctor/patient/${session.patientId}`}
                className="px-5 py-2.5 rounded-xl bg-indigoContrast hover:bg-indigoContrast-900 text-xs font-bold text-white shadow-xs transition-all"
              >
                <span>Vào phòng khám & ký SOAP →</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

    </main>
  );
}
