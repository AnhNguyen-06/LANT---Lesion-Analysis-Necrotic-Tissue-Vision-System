"use client";

import { useState, useEffect } from "react";
import { DBStore } from "@/lib/db-store";
import { Patient, TelehealthSession } from "@/types/medical-schema";
import { useAuth } from "@/context/AuthContext";
import { ChatRoom } from "@/components/chat-room";

export default function PatientTelehealthPage() {
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [telehealthSessions, setTelehealthSessions] = useState<TelehealthSession[]>([]);
  const [requestText, setRequestText] = useState("");
  const [selectedWoundTitle, setSelectedWoundTitle] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [activeTab, setActiveTab] = useState<"appointments" | "chat">("appointments");

  useEffect(() => {
    const activeId = user?.patientId || localStorage.getItem("LANT_ACTIVE_PATIENT_ID") || "PAT-10842";
    const p = DBStore.getPatientById(activeId) || DBStore.getPatients()[0];
    setPatient(p);

    if (p && p.wounds.length > 0) {
      setSelectedWoundTitle(p.wounds[0].title);
    }

    const sessions = DBStore.getAppointments(activeId);
    setTelehealthSessions(sessions);
  }, [user]);

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestText.trim() || !patient) return;

    const newSession: TelehealthSession = {
      id: `TEL-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.fullName,
      woundId: patient.wounds[0]?.id || "WND-001",
      woundTitle: selectedWoundTitle || patient.wounds[0]?.title || "Loét bàn chân đái tháo đường (Wagner II)",
      scheduledTime: new Date(Date.now() + 86400000).toISOString(),
      status: "scheduled",
      doctorName: patient.primaryPhysician || "BS. CKI Trần Minh Đức",
      doctorSpecialty: "Chuyên khoa Chăm sóc Vết thương & Phẫu thuật Chấn thương — BV Chợ Rẫy",
      doctorId: "USR-DOC-01",
      clinicalSummary: `Yêu cầu hội chẩn từ bệnh nhân: ${requestText}`
    };

    DBStore.addAppointment(newSession);
    setTelehealthSessions(prev => [newSession, ...prev]);

    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setRequestText("");
    }, 2500);
  };

  if (!patient) return null;

  const doctorId = user?.assignedDoctorId || "USR-DOC-01";
  const doctorName = patient.primaryPhysician || "BS. CKI Trần Minh Đức";

  return (
    <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
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
            Gửi yêu cầu lịch hẹn, trao đổi tin nhắn 1-on-1 và nhận cuộc gọi video hội chẩn bảo mật
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => setActiveTab("appointments")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "appointments"
                ? "bg-oceanic text-white shadow-xs"
                : "text-slate-600 hover:text-oceanic"
            }`}
          >
            Lịch hẹn & Yêu cầu ({telehealthSessions.length})
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "chat"
                ? "bg-oceanic text-white shadow-xs"
                : "text-slate-600 hover:text-oceanic"
            }`}
          >
            Nhắn tin trực tiếp với Bác sĩ
          </button>
        </div>
      </div>

      {/* Doctor Profile Banner */}
      <div className="rounded-3xl bg-white/95 p-6 sm:p-8 shadow-clinical flex flex-col md:flex-row md:items-center justify-between gap-6 border border-oceanic-100/70">
        <div className="space-y-1.5">
          <span className="rounded-full bg-indigoContrast-50 px-2.5 py-0.5 text-[10px] font-bold text-indigoContrast border border-indigoContrast-200 font-mono">
            Bác sĩ phụ trách chính
          </span>
          <h3 className="text-2xl font-bold text-oceanic font-heading">
            {doctorName}
          </h3>
          <p className="text-xs text-slate-600">
            Chuyên khoa Chăm sóc Vết thương & Phẫu thuật Chấn thương — Bệnh viện Chợ Rẫy
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Sẵn sàng kết nối Telehealth</span>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "appointments" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Upcoming Telehealth Appointments (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-oceanic uppercase tracking-wider font-heading">
              Lịch hẹn hội chẩn <span className="font-editorial italic font-normal text-sapphire">đã đăng ký ({telehealthSessions.length})</span>
            </h3>

            {telehealthSessions.length === 0 ? (
              <div className="rounded-3xl bg-white/95 p-8 text-center text-xs text-slate-500 border border-slate-200">
                Chưa có lịch hẹn telehealth nào. Bạn có thể gửi yêu cầu ở khung bên cạnh.
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
                      <span className="text-emerald-700 font-bold font-mono">
                        Trạng thái: {session.status === "completed" ? "Đã hoàn thành" : "Đã lên lịch hẹn"}
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
                Yêu cầu lịch hẹn hội chẩn mới
              </h3>

              <p className="text-xs text-slate-500 leading-relaxed">
                Nhập mô tả tình trạng vết thương hoặc các dấu hiệu bất thường (đau nhức, sưng tấy, rỉ dịch có mùi). Bác sĩ sẽ xếp lịch và gửi thông báo.
              </p>

              <form onSubmit={handleSendRequest} className="space-y-4">
                {patient.wounds.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 font-heading">
                      Chọn vết thương cần hội chẩn:
                    </label>
                    <select
                      value={selectedWoundTitle}
                      onChange={(e) => setSelectedWoundTitle(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-medium text-slate-800 focus:border-oceanic focus:outline-none"
                    >
                      {patient.wounds.map((w) => (
                        <option key={w.id} value={w.title}>
                          {w.title} ({w.currentAreaCm2} cm²)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-heading">
                    Mô tả triệu chứng & ghi chú:
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={requestText}
                    onChange={(e) => setRequestText(e.target.value)}
                    placeholder="VD: Chào bác sĩ, vết thương ở chân của em hôm nay hơi rỉ dịch hồng và hơi đau khi bước đi..."
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 p-4 text-xs font-medium text-slate-800 focus:border-oceanic focus:bg-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-oceanic text-xs font-bold text-white hover:bg-oceanic-800 shadow-xs transition-all"
                >
                  <span>{isSent ? "Đã gửi yêu cầu thành công!" : "Gửi yêu cầu đặt lịch hẹn"}</span>
                </button>
              </form>
            </div>
          </div>

        </div>
      ) : (
        /* Direct Two-Way Chat Workspace */
        <div className="max-w-3xl mx-auto">
          <ChatRoom
            doctorId={doctorId}
            doctorName={doctorName}
            patientId={patient.id}
            patientName={patient.fullName}
          />
        </div>
      )}

    </main>
  );
}
