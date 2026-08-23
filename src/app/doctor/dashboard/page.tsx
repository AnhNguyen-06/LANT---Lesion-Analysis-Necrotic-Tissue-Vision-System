"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MockStorageService } from "@/lib/mock-storage";
import { Patient, TelehealthSession } from "@/types/medical-schema";

export default function DoctorDashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [telehealthList, setTelehealthList] = useState<TelehealthSession[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<"all" | "high_critical" | "moderate" | "low">("all");

  useEffect(() => {
    const pList = MockStorageService.getPatients();
    setPatients(pList);

    const tList = MockStorageService.getTelehealthSessions();
    setTelehealthList(tList);
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

  return (
    <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans">
      
      {/* Header Banner - Pure Typography */}
      <div className="rounded-3xl bg-white/95 p-8 lg:p-10 text-slate-900 shadow-clinical flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-oceanic-100/70">
        <div className="space-y-2.5">
          <span className="rounded-full bg-oceanic-50 px-3 py-0.5 text-xs font-bold font-mono tracking-wider uppercase border border-oceanic-200 text-oceanic inline-block">
            Cổng bác sĩ chuyên khoa
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
        </div>
      </div>

      {/* Upcoming Telehealth Appointments */}
      <div className="rounded-3xl bg-white/95 p-7 shadow-clinical space-y-5 border border-oceanic-100/70">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-oceanic font-heading">
              Lịch hẹn hội chẩn telehealth <span className="font-editorial italic font-normal text-sapphire">trực tuyến</span>
            </h3>
            <p className="text-[11px] text-dusk-500">
              Phòng khám trực tuyến đồng bộ canvas vết thương và ký số điện tử
            </p>
          </div>

          <Link
            href="/doctor/telehealth"
            className="text-xs font-bold text-sapphire hover:underline"
          >
            <span>Xem tất cả ({telehealthList.length}) →</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {telehealthList.map((session) => (
            <div
              key={session.id}
              className="rounded-2xl bg-azure-mist/30 p-5 flex flex-col justify-between space-y-3 border border-oceanic-100/60 hover:border-oceanic transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-oceanic font-heading">{session.patientName}</span>
                  <span className="rounded-full bg-sapphire-50 text-sapphire-800 px-2.5 py-0.5 text-[10px] font-bold font-mono border border-sapphire-200">
                    {new Date(session.scheduledTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-800 mt-1">{session.woundTitle}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{session.clinicalSummary}</p>
              </div>

              <Link
                href={`/doctor/patient/${session.patientId}`}
                className="py-2.5 px-4 text-center rounded-xl bg-indigoContrast text-xs font-bold text-white hover:bg-indigoContrast-900 shadow-xs transition-all"
              >
                <span>Mở bệnh án & phòng telehealth →</span>
              </Link>
            </div>
          ))}
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
                Tất cả
              </button>
              <button
                onClick={() => setSelectedRiskFilter("high_critical")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedRiskFilter === "high_critical" ? "bg-red-600 text-white shadow-xs" : "text-red-700 hover:text-red-800"
                }`}
              >
                Cảnh báo đỏ
              </button>
              <button
                onClick={() => setSelectedRiskFilter("moderate")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedRiskFilter === "moderate" ? "bg-amber-500 text-white shadow-xs" : "text-amber-700 hover:text-amber-800"
                }`}
              >
                Nguy cơ vừa
              </button>
            </div>
          </div>
        </div>

        {/* Patient Rows */}
        <div className="space-y-4">
          {filteredPatients.map((p) => {
            const activeWound = p.wounds.find(w => w.status === "critical_triage" || w.status === "active") || p.wounds[0];
            const latestSnap = activeWound?.snapshots[activeWound.snapshots.length - 1];
            const isHighRisk = p.riskTier === "high_critical";

            return (
              <div
                key={p.id}
                className={`rounded-3xl p-6 bg-white/95 shadow-clinical hover:shadow-clinical-lg transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                  isHighRisk ? "border border-red-200 bg-red-50/20" : "border border-oceanic-100/70"
                }`}
              >
                {/* Left: Demographics */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-bold text-oceanic font-heading">{p.fullName}</h3>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 font-mono border border-slate-200">
                      {p.medicalRecordNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                      isHighRisk ? "bg-red-100 text-red-700" : p.riskTier === "moderate" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {isHighRisk ? "Báo động đỏ" : p.riskTier === "moderate" ? "Nguy cơ vừa" : "Tiến triển tốt"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    {p.age} tuổi ({p.gender}) • <strong className="text-slate-800">{activeWound?.title}</strong>
                  </p>
                </div>

                {/* Middle: Metrics */}
                <div className="grid grid-cols-3 gap-6 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">DIỆN TÍCH</span>
                    <span className="font-mono font-black text-oceanic text-base">
                      {activeWound?.currentAreaCm2} cm²
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">ĐIỂM WHI</span>
                    <span className={`font-mono font-black text-base ${
                      (activeWound?.currentWHI || 0) >= 70 ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {activeWound?.currentWHI}/100
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">HOẠI TỬ ĐEN</span>
                    <span className="font-mono font-black text-red-600 text-base">
                      {latestSnap?.rybMetrics.blackPercent}%
                    </span>
                  </div>
                </div>

                {/* Right: CTA */}
                <div className="pt-2 md:pt-0">
                  <Link
                    href={`/doctor/patient/${p.id}`}
                    className="px-6 py-3 rounded-2xl bg-indigoContrast text-xs font-bold text-white hover:bg-indigoContrast-900 shadow-xs transition-all inline-block"
                  >
                    <span>Xem bệnh án & ký SOAP →</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </main>
  );
}
