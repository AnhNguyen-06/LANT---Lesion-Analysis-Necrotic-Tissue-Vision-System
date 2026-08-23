"use client";

import { useState, useEffect } from "react";
import { MockStorageService } from "@/lib/mock-storage";
import { Patient, TelehealthSession } from "@/types/medical-schema";

export default function PatientTelehealthPage() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [telehealthSessions, setTelehealthSessions] = useState<TelehealthSession[]>([]);
  const [requestText, setRequestText] = useState("");
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    const activeId = localStorage.getItem("LANT_ACTIVE_PATIENT_ID") || "PAT-10842";
    const p = MockStorageService.getPatient(activeId) || MockStorageService.getPatients()[0];
    setPatient(p);

    const sessions = MockStorageService.getTelehealthSessions().filter(s => s.patientId === activeId);
    setTelehealthSessions(sessions);
  }, []);

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestText.trim()) return;
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setRequestText("");
    }, 2000);
  };

  if (!patient) return null;

  return (
    <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-oceanic-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-oceanic-50 px-2.5 py-0.5 text-xs font-bold text-oceanic border border-oceanic-200 font-mono uppercase">
              Cổng bác sĩ & telehealth
            </span>
            <span className="text-xs text-slate-500 font-mono">Bệnh nhân kết nối</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-oceanic font-heading mt-1">
            Liên hệ & hội chẩn <span className="font-editorial italic font-normal text-sapphire">trực tuyến với bác sĩ</span>
          </h1>
          <p className="text-xs sm:text-sm text-dusk-600">
            Đặt lịch hẹn khám từ xa, gửi hình ảnh quét vết thương và nhận đơn thuốc / chỉ định băng gạc
          </p>
        </div>
      </div>

      {/* Primary Doctor Profile Card - Pure Typography */}
      <div className="rounded-3xl bg-white/95 p-8 shadow-clinical flex flex-col md:flex-row md:items-center justify-between gap-6 border border-oceanic-100/70">
        <div className="space-y-1.5">
          <span className="rounded-full bg-indigoContrast-50 px-2.5 py-0.5 text-[10px] font-bold text-indigoContrast border border-indigoContrast-200 font-mono">
            Bác sĩ phụ trách chính
          </span>
          <h3 className="text-2xl font-bold text-oceanic font-heading">
            {patient.primaryPhysician || "BS. CKI Trần Minh Đức"}
          </h3>
          <p className="text-xs text-slate-600">
            Chuyên khoa Chăm sóc Vết thương & Phẫu thuật Chấn thương — BV Chợ Rẫy
          </p>
        </div>

        <div className="flex items-center">
          <div className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono">
            <span>Đang trực tuyến</span>
          </div>
        </div>
      </div>

      {/* Grid: Upcoming Appointments & Direct Message Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Upcoming Telehealth Appointments (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-sm font-bold text-oceanic uppercase tracking-wider font-heading">
            Lịch hẹn hội chẩn <span className="font-editorial italic font-normal text-sapphire">đã lên ({telehealthSessions.length})</span>
          </h3>

          {telehealthSessions.length === 0 ? (
            <div className="rounded-3xl bg-white/95 p-8 text-center text-xs text-slate-500 border border-slate-200">
              Chưa có lịch hẹn telehealth nào. Bạn có thể gửi yêu cầu ở khung bên phải.
            </div>
          ) : (
            <div className="space-y-4">
              {telehealthSessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-3xl bg-white/95 p-6 shadow-clinical space-y-3.5 border border-oceanic-100/70"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-oceanic font-heading text-sm">{session.woundTitle}</span>
                    <span className="rounded-full bg-sapphire-50 text-sapphire-800 px-3 py-0.5 text-xs font-bold font-mono border border-sapphire-200">
                      {new Date(session.scheduledTime).toLocaleDateString("vi-VN")} • {new Date(session.scheduledTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {session.clinicalSummary}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 font-mono">Bác sĩ: <strong>{session.doctorName}</strong></span>
                    <span className="text-emerald-700 font-bold">
                      Phòng khám mã hóa E2EE
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Send Direct Consultation Request (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl bg-white/95 p-7 shadow-clinical space-y-4 border border-oceanic-100/70">
            <h3 className="text-sm font-bold text-oceanic uppercase tracking-wider font-heading">
              Gửi yêu cầu hội chẩn / tin nhắn
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              Nhập mô tả tình trạng vết thương hoặc các dấu hiệu bất thường (đau nhức, sưng tấy, rỉ dịch có mùi). Bác sĩ sẽ phản hồi trong 15 phút.
            </p>

            <form onSubmit={handleSendRequest} className="space-y-4">
              <textarea
                rows={4}
                required
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                placeholder="VD: Chào bác sĩ, vết thương ở chân của em hôm nay hơi rỉ dịch hồng và hơi đau khi bước đi..."
                className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 p-4 text-xs font-medium text-slate-800 focus:border-oceanic focus:bg-white focus:outline-none"
              />

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-oceanic text-xs font-bold text-white hover:bg-oceanic-800 shadow-xs transition-all"
              >
                <span>{isSent ? "Đã gửi yêu cầu thành công!" : "Gửi yêu cầu đến bác sĩ"}</span>
              </button>
            </form>
          </div>
        </div>

      </div>

    </main>
  );
}
