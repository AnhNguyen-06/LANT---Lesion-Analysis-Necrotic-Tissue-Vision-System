"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WoundCanvas } from "@/components/wound-canvas";
import { RecoveryChart } from "@/components/recovery-chart";
import { DressingRecommender } from "@/components/dressing-recommender";
import { MockStorageService } from "@/lib/mock-storage";
import { Patient, WoundProfile, SnapshotLog, ClinicianReview } from "@/types/medical-schema";

export default function PatientDashboardPage() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeWound, setActiveWound] = useState<WoundProfile | null>(null);
  const [activeSnapshot, setActiveSnapshot] = useState<SnapshotLog | null>(null);
  const [reviews, setReviews] = useState<ClinicianReview[]>([]);

  useEffect(() => {
    const loadData = () => {
      const activeId = localStorage.getItem("LANT_ACTIVE_PATIENT_ID") || "PAT-10842";
      const p = MockStorageService.getPatient(activeId) || MockStorageService.getPatients()[0];
      setPatient(p);

      if (p && p.wounds.length > 0) {
        const defaultWound = p.wounds.find(w => w.status === "active") || p.wounds[0];
        setActiveWound(defaultWound);
        if (defaultWound.snapshots.length > 0) {
          const latest = defaultWound.snapshots[defaultWound.snapshots.length - 1];
          setActiveSnapshot(latest);
        }
        const revList = MockStorageService.getReviews(defaultWound.id);
        setReviews(revList);
      }
    };

    loadData();

    const handlePatientChange = () => loadData();
    window.addEventListener("LANT_PATIENT_CHANGED", handlePatientChange);
    return () => window.removeEventListener("LANT_PATIENT_CHANGED", handlePatientChange);
  }, []);

  const handleSelectWound = (wound: WoundProfile) => {
    setActiveWound(wound);
    if (wound.snapshots.length > 0) {
      setActiveSnapshot(wound.snapshots[wound.snapshots.length - 1]);
    }
    const revList = MockStorageService.getReviews(wound.id);
    setReviews(revList);
  };

  const handleSelectSnapshot = (snapshot: SnapshotLog) => {
    setActiveSnapshot(snapshot);
  };

  if (!patient || !activeWound || !activeSnapshot) {
    return (
      <div className="py-24 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <p className="text-sm font-bold text-oceanic font-heading">Đang đồng bộ hồ sơ bệnh án...</p>
        </div>
      </div>
    );
  }

  const activeWounds = patient.wounds.filter(w => w.status === "active" || w.status === "critical_triage");

  return (
    <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans">
      
      {/* EXPANDED SPACIOUS PATIENT PROFILE HEADER */}
      <div className="rounded-3xl bg-white/95 p-8 lg:p-10 shadow-clinical flex flex-col lg:flex-row lg:items-center justify-between gap-8 border border-oceanic-100/70">
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl lg:text-4xl font-black text-oceanic font-heading tracking-tight">
              {patient.fullName} — <span className="font-editorial italic font-normal text-sapphire">Hồ sơ theo dõi</span>
            </h1>
            <span className="rounded-full bg-oceanic-50 px-3 py-0.5 text-xs font-bold text-oceanic border border-oceanic-200 font-mono">
              {patient.medicalRecordNumber}
            </span>
            <span className={`rounded-full px-3 py-0.5 text-[11px] font-bold font-mono ${
              patient.riskTier === "high_critical" 
                ? "bg-red-100 text-red-700" 
                : patient.riskTier === "moderate"
                ? "bg-amber-100 text-amber-800"
                : "bg-emerald-100 text-emerald-800"
            }`}>
              {patient.riskTier === "high_critical" ? "Nguy cơ hoại tử cao" : patient.riskTier === "moderate" ? "Nguy cơ vừa" : "Tiến triển tốt"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-dusk-600 font-medium pt-1">
            <span>Tuổi: <strong className="text-slate-800">{patient.age} ({patient.gender})</strong></span>
            <span>•</span>
            <span>Bác sĩ phụ trách: <strong className="text-oceanic">{patient.primaryPhysician}</strong></span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/patient/scan"
            className="px-6 py-3.5 rounded-2xl bg-oceanic text-xs font-bold text-white hover:bg-oceanic-800 shadow-xs transition-all"
          >
            <span>Chụp vết thương mới</span>
          </Link>

          <Link
            href="/patient/telehealth"
            className="px-5 py-3.5 rounded-2xl border border-oceanic-200 bg-azure-mist/60 text-xs font-bold text-oceanic hover:bg-oceanic-50 transition-colors"
          >
            <span>Liên hệ bác sĩ</span>
          </Link>
        </div>
      </div>

      {/* ACTIVE WOUNDS GRID WITH PROGRESSIVE DISCLOSURE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-oceanic font-heading">
            Vết thương đang theo dõi <span className="font-editorial italic font-normal text-sapphire">({activeWounds.length})</span>
          </h2>
          <span className="text-xs text-dusk-500">Rê chuột vào thẻ để xem phân tách mô học RYB</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeWounds.map((wound) => {
            const isSelected = wound.id === activeWound.id;
            const latestSnap = wound.snapshots[wound.snapshots.length - 1];
            const isWoundCritical = wound.status === "critical_triage";

            return (
              <div
                key={wound.id}
                onClick={() => handleSelectWound(wound)}
                className={`group relative rounded-3xl p-6 transition-all duration-200 cursor-pointer bg-white/95 ${
                  isSelected
                    ? "shadow-clinical-lg ring-2 ring-oceanic/70"
                    : "shadow-clinical hover:shadow-clinical-lg border border-oceanic-100/60"
                }`}
              >
                {/* Front Card Summary */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 font-mono">
                      {wound.id}
                    </span>
                    <h3 className="text-base font-bold text-oceanic font-heading group-hover:text-sapphire transition-colors line-clamp-1">
                      {wound.title}
                    </h3>
                    <p className="text-xs text-dusk-500">{wound.anatomicalLocation}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-400 block">Diện tích</span>
                    <span className="text-xl font-black font-mono text-oceanic">
                      {wound.currentAreaCm2} <span className="text-xs font-normal text-slate-500">cm²</span>
                    </span>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 font-bold font-mono">
                    <span className="text-slate-400">WHI:</span>
                    <span className={wound.currentWHI >= 70 ? 'text-emerald-600' : 'text-amber-600'}>
                      {wound.currentWHI}/100
                    </span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                    isWoundCritical 
                      ? "bg-red-100 text-red-700" 
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}>
                    {isWoundCritical ? "Cần hội chẩn" : "Tiến triển tốt"}
                  </span>
                </div>

                {/* PROGRESSIVE DISCLOSURE: HOVER TO REVEAL RYB PROGRESS */}
                <div className="mt-3 pt-3 border-t border-slate-100 max-h-0 opacity-0 overflow-hidden group-hover:max-h-40 group-hover:opacity-100 transition-all duration-200 ease-in-out space-y-2.5">
                  <div className="text-[11px] font-semibold text-slate-600">
                    Mô học: 
                    <span className="text-red-600 ml-1">Đỏ {latestSnap?.rybMetrics.redPercent}%</span> • 
                    <span className="text-amber-600 ml-1">Vàng {latestSnap?.rybMetrics.yellowPercent}%</span> • 
                    <span className="text-slate-900 ml-1">Đen {latestSnap?.rybMetrics.blackPercent}%</span> • 
                    <span className="text-pink-600 ml-1">Hồng {latestSnap?.rybMetrics.pinkPercent}%</span>
                  </div>

                  <div className="h-2 w-full rounded-full overflow-hidden flex bg-slate-100">
                    <div style={{ width: `${latestSnap?.rybMetrics.redPercent}%` }} className="bg-medical-granulation h-full" />
                    <div style={{ width: `${latestSnap?.rybMetrics.yellowPercent}%` }} className="bg-medical-slough h-full" />
                    <div style={{ width: `${latestSnap?.rybMetrics.blackPercent}%` }} className="bg-slate-950 h-full" />
                    <div style={{ width: `${latestSnap?.rybMetrics.pinkPercent}%` }} className="bg-medical-epithelial h-full" />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {wound.snapshots.length} mốc ghi nhận
                    </span>
                    <span className="text-xs font-bold text-sapphire">
                      Xem chi tiết →
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* TIME-SERIES SCRUBBER */}
      <div className="rounded-3xl bg-white/95 p-7 shadow-clinical space-y-5 border border-oceanic-100/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-oceanic font-heading">
              Thanh tua chuỗi thời gian: <span className="font-editorial italic font-normal text-sapphire">{activeWound.title}</span>
            </h3>
            <p className="text-[11px] text-dusk-500">
              Chọn từng mốc ngày để đối chiếu diện tích thực và chất lượng phục hồi
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-slate-500">
            {activeWound.snapshots.length} mốc ghi nhận
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {activeWound.snapshots.map((snap) => {
            const isSelected = snap.id === activeSnapshot.id;
            return (
              <button
                key={snap.id}
                onClick={() => handleSelectSnapshot(snap)}
                className={`p-4 rounded-2xl text-left transition-all ${
                  isSelected
                    ? "bg-oceanic text-white shadow-md scale-[1.01]"
                    : "bg-slate-50/80 hover:bg-white text-slate-700 border border-slate-200/80"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold font-heading">Ngày {snap.dayIndex}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                  }`}>
                    {snap.whiScore} WHI
                  </span>
                </div>
                <p className={`text-lg font-black font-mono ${isSelected ? 'text-cyan-200' : 'text-oceanic'}`}>
                  {snap.totalAreaCm2} cm²
                </p>
                <span className={`text-[10px] ${isSelected ? 'text-slate-200' : 'text-slate-400'}`}>
                  {new Date(snap.timestamp).toLocaleDateString("vi-VN")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE INSPECTOR GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Canvas Viewport & SOAP Signatures */}
        <div className="lg:col-span-6 space-y-8">
          <WoundCanvas
            imageUrl={activeSnapshot.imageUrl}
            rybMetrics={activeSnapshot.rybMetrics}
            calibration={activeSnapshot.calibration}
            totalAreaCm2={activeSnapshot.totalAreaCm2}
            whiScore={activeSnapshot.whiScore}
            interactive={true}
          />

          {reviews.length > 0 && (
            <div className="rounded-3xl bg-white/95 p-7 shadow-clinical space-y-3.5 border border-emerald-200">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
                <span className="text-xs font-bold text-emerald-950 font-heading">
                  Bệnh án điện tử đã ký duyệt (SOAP Note)
                </span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 font-mono">
                  Đã ký số
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
                <p><strong className="text-oceanic">Đánh giá Bác sĩ:</strong> {reviews[0].soapAssessment}</p>
                <p><strong className="text-oceanic">Phác đồ điều trị:</strong> {reviews[0].soapPlan}</p>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 font-mono">
                <span>Ký bởi: <strong className="text-slate-800">{reviews[0].clinicianName}</strong></span>
                <span>{new Date(reviews[0].signedAt || "").toLocaleDateString("vi-VN")}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Recovery Chart & Dressing CDSS */}
        <div className="lg:col-span-6 space-y-8">
          <RecoveryChart snapshots={activeWound.snapshots} />

          <DressingRecommender
            recommendation={activeSnapshot.recommendation}
            rybMetrics={activeSnapshot.rybMetrics}
          />
        </div>

      </div>

    </main>
  );
}
