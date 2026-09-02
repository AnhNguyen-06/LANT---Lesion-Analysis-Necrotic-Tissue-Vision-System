"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DBStore } from "@/lib/db-store";
import { TelehealthSignalingEngine } from "@/lib/telehealth-signaling";
import { TelehealthSession, Patient } from "@/types/medical-schema";
import { useAuth } from "@/context/AuthContext";
import { ChatRoom } from "@/components/chat-room";
import { TelehealthCallModal } from "@/components/telehealth-call-modal";

export default function DoctorTelehealthListPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<TelehealthSession[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeTab, setActiveTab] = useState<"appointments" | "chat">("appointments");
  const [selectedPatientIdForChat, setSelectedPatientIdForChat] = useState<string>("PAT-10842");

  // New Appointment Schedule Form State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("14:30");
  const [sessionNotes, setSessionNotes] = useState("");

  // Calling Modal
  const [callingPatient, setCallingPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const list = DBStore.getAppointments();
    setSessions(list);
    const pList = DBStore.getPatients();
    setPatients(pList);
    if (pList.length > 0) {
      setSelectedPatientId(pList[0].id);
      setSelectedPatientIdForChat(pList[0].id);
    }
  }, []);

  const handleStartCall = (session: TelehealthSession) => {
    const matchedPatient = patients.find(p => p.id === session.patientId);
    if (!matchedPatient || matchedPatient.wounds.length === 0) return;

    TelehealthSignalingEngine.sendSignal({
      type: "CALL_INITIATED",
      doctorId: user?.id || "USR-DOC-01",
      doctorName: user?.fullName || "BS. CKI Trần Minh Đức",
      patientId: session.patientId,
      woundTitle: session.woundTitle,
      timestamp: Date.now()
    });

    setCallingPatient(matchedPatient);
  };

  const handleScheduleAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const p = patients.find(p => p.id === selectedPatientId);
    if (!p) return;

    const combinedDateTime = scheduledDate ? `${scheduledDate}T${scheduledTime}:00Z` : new Date(Date.now() + 86400000).toISOString();

    const newSession: TelehealthSession = {
      id: `TEL-${Date.now()}`,
      patientId: p.id,
      patientName: p.fullName,
      woundId: p.wounds[0]?.id || "WND-001",
      woundTitle: p.wounds[0]?.title || "Loét bàn chân đái tháo đường",
      scheduledTime: combinedDateTime,
      status: "scheduled",
      doctorName: user?.fullName || "BS. CKI Trần Minh Đức",
      doctorSpecialty: user?.specialty || "Chuyên khoa Chăm sóc Vết thương — BV Chợ Rẫy",
      doctorId: user?.id || "USR-DOC-01",
      clinicalSummary: sessionNotes || "Tái khám định kỳ và đánh giá tỷ lệ mô hạt RYB."
    };

    DBStore.addAppointment(newSession);
    setSessions(prev => [newSession, ...prev]);
    setShowScheduleModal(false);
    setSessionNotes("");
  };

  const currentChatPatient = patients.find(p => p.id === selectedPatientIdForChat) || patients[0];
  const doctorId = user?.id || "USR-DOC-01";
  const doctorName = user?.fullName || "BS. CKI Trần Minh Đức";

  return (
    <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-oceanic-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigoContrast-50 px-2.5 py-0.5 text-xs font-bold text-indigoContrast border border-indigoContrast-200 font-mono uppercase">
              Phòng hội chẩn Telehealth Bác sĩ
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-oceanic font-heading mt-1">
            Quản lý hội chẩn & <span className="font-editorial italic font-normal text-sapphire">Tin nhắn trực tuyến</span>
          </h1>
          <p className="text-xs sm:text-sm text-dusk-600">
            Khởi động cuộc gọi video 2 chiều, lên lịch tái khám và trao đổi trực tiếp với bệnh nhân
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab("appointments")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "appointments"
                  ? "bg-indigoContrast text-white shadow-xs"
                  : "text-slate-600 hover:text-indigoContrast"
              }`}
            >
              Lịch hẹn hội chẩn ({sessions.length})
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "chat"
                  ? "bg-indigoContrast text-white shadow-xs"
                  : "text-slate-600 hover:text-indigoContrast"
              }`}
            >
              Nhắn tin 1-on-1
            </button>
          </div>

          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-oceanic hover:bg-oceanic-800 text-white text-xs font-bold shadow-xs transition-all"
          >
            <span>+ Lên lịch hẹn mới</span>
          </button>
        </div>
      </div>

      {activeTab === "appointments" ? (
        /* Grid of Sessions */
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

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-3">
                <button
                  type="button"
                  onClick={() => handleStartCall(session)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Bắt đầu gọi Telehealth</span>
                </button>

                <Link
                  href={`/doctor/patient/${session.patientId}`}
                  className="flex-1 py-2.5 px-4 text-center rounded-xl bg-indigoContrast hover:bg-indigoContrast-900 text-xs font-bold text-white shadow-xs transition-all"
                >
                  <span>Bệnh án & Ký SOAP →</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Chat Tab with Patient Selector */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Patient Selector List (4 Cols) */}
          <div className="lg:col-span-4 rounded-3xl bg-white/95 p-6 shadow-clinical border border-oceanic-100/70 space-y-4">
            <h3 className="text-xs font-bold text-oceanic font-heading uppercase tracking-wider">
              Chọn bệnh nhân để trò chuyện
            </h3>

            <div className="space-y-2">
              {patients.map((p) => {
                const isSelected = p.id === selectedPatientIdForChat;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatientIdForChat(p.id)}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all border ${
                      isSelected
                        ? "bg-indigoContrast text-white border-indigoContrast shadow-xs font-bold"
                        : "bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{p.fullName}</span>
                      <span className={`text-[10px] font-mono ${isSelected ? 'text-cyan-200' : 'text-slate-500'}`}>
                        {p.medicalRecordNumber}
                      </span>
                    </div>
                    <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                      {p.wounds[0]?.title || "Chưa có vết thương"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Chat Room (8 Cols) */}
          <div className="lg:col-span-8">
            {currentChatPatient && (
              <ChatRoom
                doctorId={doctorId}
                doctorName={doctorName}
                patientId={currentChatPatient.id}
                patientName={currentChatPatient.fullName}
              />
            )}
          </div>
        </div>
      )}

      {/* Schedule Appointment Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-7 shadow-2xl border border-oceanic-100 space-y-5 animate-in zoom-in-95">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-oceanic font-heading">Lên lịch hẹn Telehealth mới</h3>
              <p className="text-xs text-slate-500">Thông báo sẽ được tự động gửi đến tài khoản bệnh nhân</p>
            </div>

            <form onSubmit={handleScheduleAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-heading">
                  Chọn bệnh nhân:
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-800 focus:border-oceanic focus:outline-none"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.medicalRecordNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-heading">
                    Ngày hẹn:
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-oceanic focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-heading">
                    Giờ hẹn:
                  </label>
                  <input
                    type="time"
                    required
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-oceanic focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-heading">
                  Nội dung & Yêu cầu chuẩn bị:
                </label>
                <textarea
                  rows={3}
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="VD: Kiểm tra mô hạt gót chân sau 3 ngày thay băng Allevyn. Bệnh nhân chuẩn bị sẵn ánh sáng tốt..."
                  className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-xs text-slate-800 focus:border-oceanic focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-oceanic text-white text-xs font-bold hover:bg-oceanic-800 shadow-xs"
                >
                  Lưu & Gửi thông báo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Telehealth Call Modal */}
      {callingPatient && callingPatient.wounds.length > 0 && (
        <TelehealthCallModal
          isOpen={!!callingPatient}
          onClose={() => {
            if (callingPatient) {
              TelehealthSignalingEngine.sendSignal({
                type: "CALL_ENDED",
                doctorId: user?.id || "USR-DOC-01",
                patientId: callingPatient.id,
                timestamp: Date.now()
              });
              TelehealthSignalingEngine.clearActiveCall(callingPatient.id);
            }
            setCallingPatient(null);
          }}
          patient={callingPatient}
          wound={callingPatient.wounds[0]}
          activeSnapshot={callingPatient.wounds[0].snapshots[callingPatient.wounds[0].snapshots.length - 1]}
          onSignSoap={(assessment, plan) => {
            console.log("Signed SOAP from telehealth page:", assessment, plan);
          }}
        />
      )}

    </main>
  );
}
