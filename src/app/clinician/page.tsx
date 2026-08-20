"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { 
  Stethoscope, 
  ShieldAlert, 
  Activity, 
  Video, 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { MockStorageService, SEED_PATIENTS } from "@/lib/mock-storage";
import { Patient, TelehealthSession } from "@/types/medical-schema";

export default function ClinicianTriagePortal() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [telehealthSessions, setTelehealthSessions] = useState<TelehealthSession[]>([]);
  const [filterTier, setFilterTier] = useState<"all" | "high_critical" | "moderate" | "low">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const list = MockStorageService.getPatients();
    setPatients(list);
    const sessions = MockStorageService.getTelehealthSessions();
    setTelehealthSessions(sessions);
  }, []);

  // Sort patients: High Critical first, then Moderate, then Low
  const sortedPatients = [...patients].sort((a, b) => {
    const tierScore = { high_critical: 3, moderate: 2, low: 1 };
    return (tierScore[b.riskTier] || 0) - (tierScore[a.riskTier] || 0);
  });

  // Filter patients
  const filteredPatients = sortedPatients.filter((p) => {
    if (filterTier !== "all" && p.riskTier !== filterTier) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.fullName.toLowerCase().includes(q) ||
        p.medicalRecordNumber.toLowerCase().includes(q) ||
        p.wounds.some((w) => w.title.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const highRiskCount = patients.filter(p => p.riskTier === "high_critical").length;
  const scheduledCallsCount = telehealthSessions.filter(s => s.status === "scheduled").length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Clinician Portal Header */}
        <div className="rounded-2xl border border-indigoContrast-200 bg-gradient-to-r from-indigoContrast-950 via-indigoContrast to-oceanic text-white p-6 shadow-clinical-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-white shadow-inner">
                <Stethoscope className="h-7 w-7 text-cyan-300" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-cyan-400/20 px-2.5 py-0.5 text-xs font-bold text-cyan-300 border border-cyan-400/40">
                    CLINICAL TELEHEALTH PORTAL
                  </span>
                  <span className="text-xs text-slate-300 font-mono">BS. CKI Trần Minh Đức</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Bảng Phân Luồng Nguy Cơ & Hội Chẩn Từ Xa
                </h1>
                <p className="text-xs text-slate-300">
                  Tự động ưu tiên bệnh nhân có dấu hiệu hoại tử eschar (đen) hoặc viêm mủ slough (vàng) lên đầu danh sách
                </p>
              </div>
            </div>

            {/* Quick Stat Highlights */}
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-600/80 border border-red-400/60 p-3 text-center min-w-[110px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-100">Báo Động Đỏ</span>
                <div className="text-2xl font-black text-white font-mono mt-0.5">{highRiskCount} Ca</div>
              </div>

              <div className="rounded-xl bg-cyan-600/80 border border-cyan-400/60 p-3 text-center min-w-[110px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-100">Lịch Hẹn Gọi</span>
                <div className="text-2xl font-black text-white font-mono mt-0.5">{scheduledCallsCount} Ca</div>
              </div>
            </div>

          </div>
        </div>

        {/* Telehealth Sessions Queue */}
        {telehealthSessions.length > 0 && (
          <div className="rounded-2xl border border-oceanic-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-oceanic animate-pulse" />
                <h3 className="text-xs font-bold text-oceanic uppercase tracking-wider">
                  Hàng Đợi Cuộc Gọi Telehealth Hôm Nay
                </h3>
              </div>
              <span className="rounded bg-azure-mist px-2 py-0.5 text-[10px] font-bold text-oceanic">
                {telehealthSessions.length} PHIÊN TRỰC TUYẾN
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {telehealthSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-oceanic transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-oceanic">{session.patientName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {session.status === "scheduled" ? "Đã Đặt Lịch" : "Đang Gọi"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">{session.woundTitle}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-oceanic" />
                      {new Date(session.scheduledTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  <Link
                    href={`/clinician/${session.patientId}`}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-oceanic text-white text-xs font-bold hover:bg-oceanic-800 shadow-sm"
                  >
                    <Video className="h-3.5 w-3.5 text-cyan-300" />
                    <span>Mở Phòng Khám</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Triage Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterTier("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterTier === "all" ? "bg-oceanic text-white shadow-xs" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              Tất Cả Bệnh Nhân ({patients.length})
            </button>

            <button
              onClick={() => setFilterTier("high_critical")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterTier === "high_critical" ? "bg-red-600 text-white shadow-xs" : "bg-white text-red-700 border border-red-200 hover:bg-red-50"
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Nguy Cơ Hoại Tử / Đỏ ({highRiskCount})</span>
            </button>

            <button
              onClick={() => setFilterTier("moderate")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterTier === "moderate" ? "bg-amber-500 text-white shadow-xs" : "bg-white text-amber-700 border border-amber-200 hover:bg-amber-50"
              }`}
            >
              Cảnh Báo Vừa ({patients.filter(p => p.riskTier === "moderate").length})
            </button>

            <button
              onClick={() => setFilterTier("low")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterTier === "low" ? "bg-emerald-600 text-white shadow-xs" : "bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50"
              }`}
            >
              Phục Hồi Tốt ({patients.filter(p => p.riskTier === "low").length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, mã hồ sơ MRN..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 pl-8 text-xs font-semibold text-slate-800 focus:border-oceanic focus:outline-none"
            />
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

        </div>

        {/* Patient Triage Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => {
            const isHighRisk = patient.riskTier === "high_critical";
            const activeWound = patient.wounds.find(w => w.status !== "healed") || patient.wounds[0];
            const latestSnap = activeWound?.snapshots[activeWound.snapshots.length - 1];

            return (
              <div
                key={patient.id}
                className={`rounded-2xl border bg-white p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-clinical ${
                  isHighRisk ? "border-red-300 bg-red-50/20 ring-1 ring-red-300" : "border-oceanic-100"
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {patient.medicalRecordNumber}
                    </span>

                    {isHighRisk ? (
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-black text-red-700 border border-red-300 flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3 animate-pulse" />
                        CẤP CỨU HOẠI TỬ
                      </span>
                    ) : (
                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-oceanic border border-oceanic-200">
                        {patient.riskTier === "moderate" ? "THEO DÕI VỪA" : "TIẾN TRIỂN TỐT"}
                      </span>
                    )}
                  </div>

                  {/* Patient Info */}
                  <h3 className="text-base font-extrabold text-slate-900">{patient.fullName}</h3>
                  <p className="text-xs text-slate-500 mb-3">
                    {patient.age} tuổi • {patient.gender === "Male" ? "Nam" : "Nữ"} • SĐT: {patient.phone}
                  </p>

                  {/* Latest Wound Preview */}
                  {activeWound && latestSnap && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 mb-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-oceanic">{activeWound.title}</span>
                        <span className="font-mono font-bold text-slate-800">{latestSnap.totalAreaCm2} cm²</span>
                      </div>

                      {/* RYB Proportion Bar */}
                      <div className="h-2 w-full rounded-full overflow-hidden flex bg-slate-200">
                        <div style={{ width: `${latestSnap.rybMetrics.redPercent}%` }} className="bg-medical-granulation h-full" />
                        <div style={{ width: `${latestSnap.rybMetrics.yellowPercent}%` }} className="bg-medical-slough h-full" />
                        <div style={{ width: `${latestSnap.rybMetrics.blackPercent}%` }} className="bg-medical-necrotic h-full" />
                        <div style={{ width: `${latestSnap.rybMetrics.pinkPercent}%` }} className="bg-medical-epithelial h-full" />
                      </div>

                      <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                        <span className="text-red-600">Mô đỏ: {latestSnap.rybMetrics.redPercent}%</span>
                        <span className="text-amber-600">Vảy: {latestSnap.rybMetrics.yellowPercent}%</span>
                        <span className="text-slate-900 font-bold">Hoại tử: {latestSnap.rybMetrics.blackPercent}%</span>
                        <span className="text-emerald-700 font-bold">WHI: {latestSnap.whiScore}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Open Remote Case Action */}
                <Link
                  href={`/clinician/${patient.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-oceanic text-xs font-bold text-white hover:bg-oceanic-800 shadow-sm transition-all"
                >
                  <span>Mở Hồ Sơ & Hội Chẩn Telehealth</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>

              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
