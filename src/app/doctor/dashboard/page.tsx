"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DBStore } from "@/lib/db-store";
import { TelehealthSignalingEngine } from "@/lib/telehealth-signaling";
import { Patient, TelehealthSession } from "@/types/medical-schema";
import { useAuth } from "@/context/AuthContext";
import { TelehealthCallModal } from "@/components/telehealth-call-modal";

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [telehealthList, setTelehealthList] = useState<TelehealthSession[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<"all" | "high_critical" | "moderate" | "low">("all");

  // Direct Call Modal from Dashboard
  const [callingPatient, setCallingPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const pList = DBStore.getPatients();
    setPatients(pList);

    const tList = DBStore.getAppointments();
    setTelehealthList(tList);

    const handlePatientChange = () => {
      setPatients(DBStore.getPatients());
      setTelehealthList(DBStore.getAppointments());
    };

    window.addEventListener("LANT_PATIENT_CHANGED", handlePatientChange);
    window.addEventListener("LANT_APPOINTMENT_ADDED" as any, handlePatientChange);

    return () => {
      window.removeEventListener("LANT_PATIENT_CHANGED", handlePatientChange);
      window.removeEventListener("LANT_APPOINTMENT_ADDED" as any, handlePatientChange);
    };
  }, []);

  // Filter & sort High Risk to top
  const filteredPatients = patients
    .filter(p => {
      const matchSearch = p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.medicalRecordNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRisk = selectedRiskFilter === "all" || p.riskTier === selectedRiskFilter;
      return matchSearch && matchRisk;
    })
    .sort((a, b) => {
      const riskWeight = { high_critical: 3, moderate: 2, low: 1 };
      return (riskWeight[b.riskTier] || 0) - (riskWeight[a.riskTier] || 0);
    });

  const criticalCount = patients.filter(p => p.riskTier === "high_critical").length;

  const handleStartCallFromDashboard = (patient: Patient) => {
    if (patient.wounds.length === 0) return;
    const wound = patient.wounds[0];

    TelehealthSignalingEngine.sendSignal({
      type: "CALL_INITIATED",
      doctorId: user?.id || "USR-DOC-01",
      doctorName: user?.fullName || "BS. CKI Trần Minh Đức",
      patientId: patient.id,
      woundTitle: wound.title,
      timestamp: Date.now()
    });

    setCallingPatient(patient);
  };

  return (
    <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* Header Banner - Pure Typography */}
      <div className="rounded-3xl bg-white/95 p-8 lg:p-10 text-slate-900 shadow-clinical flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-oceanic-100/70">
        <div className="space-y-2.5">
          <span className="rounded-full bg-oceanic-50 px-3 py-0.5 text-xs font-bold font-mono tracking-wider uppercase border border-oceanic-200 text-oceanic inline-block">
            Cổng bác sĩ chuyên khoa — {user?.fullName || "BS. CKI Trần Minh Đức"}
          </span>
          <h1 className="text-3xl lg:text-4xl font-black font-heading tracking-tight text-oceanic">
            Bảng phân luồng nguy cơ & <span className="font-editorial italic font-normal text-sapphire">hàng đợi hội chẩn</span>
          </h1>
          <p className="text-xs sm:text-sm text-dusk-600 max-w-2xl leading-relaxed font-sans">
            Hệ thống tự động xếp hạng bệnh nhân theo mức độ hoại tử đen (Eschar) và nguy cơ nhiễm trùng, hỗ trợ xem chi tiết và ký số bệnh án SOAP.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {criticalCount > 0 && (
            <div className="px-4 py-2.5 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold font-mono">
              <span>{criticalCount} ca cảnh báo đỏ khẩn cấp</span>
            </div>
          )}

          <Link
            href="/doctor/profile"
            className="px-5 py-2.5 rounded-2xl bg-white border border-oceanic-200 text-oceanic text-xs font-bold hover:bg-oceanic-50 transition-colors shadow-2xs font-mono"
          >
            <span>Hồ sơ & CCHN →</span>
          </Link>
        </div>
      </div>

      {/* Upcoming Telehealth Appointments */}
      <div className="rounded-3xl bg-white/95 p-7 shadow-clinical space-y-5 border border-oceanic-100/70">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-oceanic font-heading">
              Lịch hẹn hội chẩn telehealth <span className="font-editorial italic font-normal text-sapphire">hôm nay ({telehealthList.length})</span>
            </h3>
            <p className="text-[11px] text-dusk-500">
              Phòng khám trực tuyến đồng bộ canvas vết thương và ký số điện tử
            </p>
          </div>

          <Link
            href="/doctor/telehealth"
            className="text-xs font-bold text-sapphire hover:underline"
          >
            <span>Quản lý tất cả ({telehealthList.length}) →</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {telehealthList.map((session) => {
            const matchedPatient = patients.find(p => p.id === session.patientId);
            return (
              <div
                key={session.id}
                className="rounded-2xl bg-azure-mist/30 p-5 flex flex-col justify-between space-y-3 border border-oceanic-100/60 hover:border-oceanic transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-oceanic font-heading text-sm">{session.patientName}</span>
                    <span className="rounded-full bg-sapphire-50 text-sapphire-800 px-2.5 py-0.5 text-[10px] font-bold font-mono border border-sapphire-200">
                      {new Date(session.scheduledTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800 mt-1">{session.woundTitle}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{session.clinicalSummary}</p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  {matchedPatient && matchedPatient.wounds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleStartCallFromDashboard(matchedPatient)}
                      className="flex-1 py-2 px-3 text-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs transition-all"
                    >
                      <span>Bắt đầu gọi Telehealth</span>
                    </button>
                  )}

                  <Link
                    href={`/doctor/patient/${session.patientId}`}
                    className="flex-1 py-2 px-3 text-center rounded-xl bg-indigoContrast text-xs font-bold text-white hover:bg-indigoContrast-900 shadow-xs transition-all"
                  >
                    <span>Xem bệnh án & Ký SOAP →</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PATIENT TRIAGE QUEUE */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-oceanic font-heading">
              Hàng đợi phân luồng nguy cơ <span className="font-editorial italic font-normal text-sapphire">(Triage Queue)</span>
            </h2>
            <p className="text-xs text-dusk-500">
              Sắp xếp ưu tiên các ca có tỷ lệ hoại tử đen (Eschar) hoặc tiến triển xấu lên đầu
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên hoặc mã MRN..."
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 focus:border-oceanic focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
              <button
                onClick={() => setSelectedRiskFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedRiskFilter === "all" ? "bg-white text-oceanic shadow-xs" : "text-slate-600 hover:text-oceanic"
                }`}
              >
                Tất cả ({patients.length})
              </button>
              <button
                onClick={() => setSelectedRiskFilter("high_critical")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedRiskFilter === "high_critical" ? "bg-red-600 text-white shadow-xs" : "text-red-700 hover:bg-red-50"
                }`}
              >
                Nguy cơ cao
              </button>
              <button
                onClick={() => setSelectedRiskFilter("moderate")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedRiskFilter === "moderate" ? "bg-amber-600 text-white shadow-xs" : "text-amber-800 hover:bg-amber-50"
                }`}
              >
                Nguy cơ vừa
              </button>
              <button
                onClick={() => setSelectedRiskFilter("low")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedRiskFilter === "low" ? "bg-emerald-600 text-white shadow-xs" : "text-emerald-800 hover:bg-emerald-50"
                }`}
              >
                Ổn định
              </button>
            </div>
          </div>
        </div>

        {/* Triage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((p) => {
            const mainWound = p.wounds[0];
            const latestSnap = mainWound?.snapshots[mainWound.snapshots.length - 1];

            return (
              <div
                key={p.id}
                className="rounded-3xl bg-white/95 p-6 shadow-clinical space-y-4 hover:shadow-clinical-lg transition-all border border-oceanic-100/70 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-oceanic font-heading">{p.fullName}</h3>
                      <span className="text-xs text-dusk-500 font-mono">{p.medicalRecordNumber} • {p.age} tuổi</span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                      p.riskTier === "high_critical"
                        ? "bg-red-100 text-red-700 border border-red-200"
                        : p.riskTier === "moderate"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}>
                      {p.riskTier === "high_critical" ? "Nguy kịch" : p.riskTier === "moderate" ? "Trung bình" : "Ổn định"}
                    </span>
                  </div>

                  {mainWound && latestSnap ? (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                      <p className="font-semibold text-slate-800 truncate">{mainWound.title}</p>
                      
                      <div className="grid grid-cols-3 gap-1 font-mono text-[11px]">
                        <div>
                          <span className="text-slate-400 text-[10px] block">Diện tích</span>
                          <strong className="text-oceanic">{mainWound.currentAreaCm2} cm²</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">WHI</span>
                          <strong className="text-sapphire">{mainWound.currentWHI}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Hoại tử</span>
                          <strong className="text-red-600">{latestSnap.rybMetrics.blackPercent}%</strong>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-slate-50 text-xs text-slate-400 text-center">
                      Chưa có dữ liệu vết thương
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <Link
                    href={`/doctor/patient/${p.id}`}
                    className="flex-1 py-2.5 px-3 text-center rounded-xl bg-oceanic text-white text-xs font-bold hover:bg-oceanic-800 transition-colors shadow-xs"
                  >
                    <span>Xem bệnh án & Ký SOAP →</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleStartCallFromDashboard(p)}
                    className="py-2.5 px-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-colors font-mono"
                    title="Gọi video Telehealth ngay"
                  >
                    <span>Gọi</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Telehealth Call Modal Triggered from Dashboard */}
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
            console.log("Signed SOAP in dashboard call modal:", assessment, plan);
          }}
        />
      )}

    </main>
  );
}
