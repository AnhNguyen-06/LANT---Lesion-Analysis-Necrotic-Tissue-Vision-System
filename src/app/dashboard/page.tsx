"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { WoundCanvas } from "@/components/wound-canvas";
import { RecoveryChart } from "@/components/recovery-chart";
import { DressingRecommender } from "@/components/dressing-recommender";
import { HazardAlertModal } from "@/components/hazard-alert";
import { ReminderModal } from "@/components/reminder-modal";
import { 
  Activity, 
  Camera, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  Layers, 
  FileText, 
  Stethoscope, 
  ShieldAlert, 
  Plus, 
  ArrowRight,
  User,
  Heart,
  ChevronRight,
  Clock
} from "lucide-react";
import { MockStorageService } from "@/lib/mock-storage";
import { Patient, WoundProfile, SnapshotLog } from "@/types/medical-schema";

export default function PatientDashboardPage() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [selectedWound, setSelectedWound] = useState<WoundProfile | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<SnapshotLog | null>(null);

  // Modals
  const [showHazardModal, setShowHazardModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);

  // Load Patient Data
  const loadData = () => {
    const activeId = localStorage.getItem("LANT_ACTIVE_PATIENT_ID") || "PAT-10842";
    const p = MockStorageService.getPatient(activeId);
    if (p) {
      setPatient(p);
      const activeWounds = p.wounds.filter(w => w.status !== "healed");
      const current = activeWounds.length > 0 ? activeWounds[0] : p.wounds[0];
      setSelectedWound(current || null);
      if (current && current.snapshots.length > 0) {
        setSelectedSnapshot(current.snapshots[current.snapshots.length - 1]);
      }
    }
  };

  useEffect(() => {
    loadData();

    const handlePatientChange = () => {
      loadData();
    };
    window.addEventListener("LANT_PATIENT_CHANGED", handlePatientChange);
    return () => window.removeEventListener("LANT_PATIENT_CHANGED", handlePatientChange);
  }, []);

  const handleSelectWound = (w: WoundProfile) => {
    setSelectedWound(w);
    if (w.snapshots.length > 0) {
      setSelectedSnapshot(w.snapshots[w.snapshots.length - 1]);
    }
  };

  if (!patient || !selectedWound || !selectedSnapshot) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Activity className="h-8 w-8 text-oceanic animate-spin mx-auto" />
            <p className="text-xs font-bold text-oceanic">Đang tải hồ sơ bệnh án LANT...</p>
          </div>
        </div>
      </div>
    );
  }

  const isCriticalHazard = selectedSnapshot.hazardStatus === "emergency_critical";
  const baselineArea = selectedWound.baselineAreaCm2;
  const currentArea = selectedSnapshot.totalAreaCm2;
  const totalReductionPct = baselineArea > 0 ? (((baselineArea - currentArea) / baselineArea) * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar 
        onOpenReminderModal={() => setShowReminderModal(true)} 
        onOpenHazardModal={() => setShowHazardModal(true)} 
      />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Patient Profile Banner */}
        <div className="rounded-2xl border border-oceanic-200 bg-gradient-to-r from-oceanic-900 via-oceanic to-indigoContrast-900 text-white p-6 shadow-clinical-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left: Patient Identity */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-white text-2xl font-black shadow-inner">
                {patient.fullName.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">{patient.fullName}</h1>
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-mono font-bold text-azure-mist">
                    {patient.medicalRecordNumber}
                  </span>
                  {patient.riskTier === "high_critical" ? (
                    <span className="rounded-full bg-red-500/80 px-2.5 py-0.5 text-[11px] font-bold text-white border border-red-300 flex items-center gap-1">
                      <ShieldAlert className="h-3 w-3" />
                      NGUY CƠ HOẠI TỬ CAO
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-400">
                      THEO DÕI ỔN ĐỊNH
                    </span>
                  )}
                </div>
                <p className="text-xs text-oceanic-100 flex items-center gap-3">
                  <span>{patient.age} tuổi • {patient.gender === "Male" ? "Nam" : "Nữ"}</span>
                  <span>•</span>
                  <span>Bác sĩ phụ trách: <strong>{patient.primaryPhysician || "BS. CKI Trần Minh Đức"}</strong></span>
                </p>
              </div>
            </div>

            {/* Right: Quick Action Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/scan"
                className="inline-flex items-center gap-2 rounded-xl bg-white text-oceanic font-extrabold text-xs px-4 py-2.5 shadow-sm hover:bg-azure-mist transition-colors"
              >
                <Camera className="h-4 w-4 text-oceanic" />
                <span>Chụp & Cập Nhật Lần Quét Mới</span>
              </Link>

              <button
                onClick={() => setShowReminderModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 text-white font-bold text-xs px-3.5 py-2.5 border border-white/20 hover:bg-white/20 transition-colors"
              >
                <Calendar className="h-4 w-4 text-amber-300" />
                <span>Lịch Nhắc Thay Băng</span>
              </button>
            </div>

          </div>
        </div>

        {/* Emergency Hazard Banner if Red Flag */}
        {isCriticalHazard && (
          <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-5 shadow-hazard flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white animate-pulse">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-red-950 uppercase tracking-wide">
                  CẢNH BÁO HOẠI TỬ NGUY HIỂM — YÊU CẦU CAN THIỆP Y TẾ
                </h3>
                <p className="text-xs text-red-800 leading-relaxed font-medium">
                  {selectedSnapshot.hazardReasons.join(" • ")}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowHazardModal(true)}
              className="shrink-0 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-red-700 transition-colors"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Xem Phác Đồ Cấp Cứu 115</span>
            </button>
          </div>
        )}

        {/* Active Wounds Selector Carousel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-oceanic uppercase tracking-wider">
              Danh Sách Vết Thương Đang Theo Dõi ({patient.wounds.filter(w => w.status !== "healed").length})
            </h2>
            <Link href="/scan" className="text-xs font-bold text-sapphire hover:underline flex items-center gap-1">
              <Plus className="h-3.5 w-3.5" />
              <span>Thêm Vết Thương Mới</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {patient.wounds.map((w) => {
              const isSelected = w.id === selectedWound.id;
              const isHealed = w.status === "healed";
              return (
                <button
                  key={w.id}
                  onClick={() => handleSelectWound(w)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-oceanic bg-oceanic-50/70 shadow-sm ring-1 ring-oceanic"
                      : isHealed
                      ? "border-slate-200 bg-slate-50 opacity-70 hover:opacity-100"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-oceanic">{w.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isHealed 
                        ? "bg-emerald-100 text-emerald-800"
                        : w.status === "critical_triage"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {isHealed ? "Đã Liền" : w.status === "critical_triage" ? "Khẩn Cấp" : "Đang Lành"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">{w.anatomicalLocation}</p>
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-700 border-t border-slate-100 pt-2">
                    <span>Diện tích: {w.currentAreaCm2} cm²</span>
                    <span className="text-emerald-600">WHI: {w.currentWHI}/100</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Grid: Hero Snapshot View & Analytical Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Hero Canvas & Snapshot Time Scrubber (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Snapshot Selector Header */}
            <div className="rounded-xl border border-oceanic-100 bg-white p-3 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-oceanic uppercase tracking-wider">
                  Mốc Thời Gian Chụp:
                </span>
                <div className="flex gap-1">
                  {selectedWound.snapshots.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSnapshot(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-colors ${
                        selectedSnapshot.id === s.id
                          ? "bg-oceanic text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      Ngày {s.dayIndex}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-slate-500">
                {new Date(selectedSnapshot.timestamp).toLocaleDateString("vi-VN", {
                  year: "numeric", month: "long", day: "numeric"
                })}
              </div>
            </div>

            {/* Main Interactive HTML5 Canvas with RYB Layer Toggles */}
            <WoundCanvas
              rybMetrics={selectedSnapshot.rybMetrics}
              calibration={selectedSnapshot.calibration}
              totalAreaCm2={selectedSnapshot.totalAreaCm2}
              whiScore={selectedSnapshot.whiScore}
              interactive={true}
            />

            {/* Recharts Analytical Recovery Trend */}
            <RecoveryChart snapshots={selectedWound.snapshots} />

          </div>

          {/* Right Column: Clinical Metrics, Dressing Decision Support & Telehealth (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Realtime Clinical Metric Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-oceanic-100 bg-white p-4 shadow-xs">
                <span className="text-[11px] font-bold text-dusk-500 uppercase tracking-wider">Diện Tích Hiện Tại</span>
                <div className="text-2xl font-black text-oceanic mt-1 font-mono">
                  {selectedSnapshot.totalAreaCm2} <span className="text-xs font-normal text-slate-500">cm²</span>
                </div>
                <p className="text-[11px] text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                  <TrendingDown className="h-3.5 w-3.5" />
                  Giảm {totalReductionPct}% so với ban đầu
                </p>
              </div>

              <div className="rounded-xl border border-oceanic-100 bg-white p-4 shadow-xs">
                <span className="text-[11px] font-bold text-dusk-500 uppercase tracking-wider">Chỉ Số WHI</span>
                <div className={`text-2xl font-black mt-1 font-mono ${
                  selectedSnapshot.whiScore >= 70 ? 'text-emerald-600' : selectedSnapshot.whiScore >= 40 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {selectedSnapshot.whiScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
                </div>
                <p className="text-[11px] text-dusk-600 mt-1 font-medium">
                  {selectedSnapshot.whiScore >= 70 ? "Phục hồi rất tốt" : selectedSnapshot.whiScore >= 40 ? "Đang theo dõi chặt" : "Cần can thiệp khẩn"}
                </p>
              </div>
            </div>

            {/* Clinical Decision Support & Dressing Recommendation */}
            <DressingRecommender
              recommendation={selectedSnapshot.recommendation}
              rybMetrics={selectedSnapshot.rybMetrics}
            />

            {/* Telehealth Quick Connect Card */}
            <div className="rounded-2xl border border-oceanic-200 bg-gradient-to-br from-oceanic-50 to-azure-mist p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-oceanic text-white shadow-sm">
                  <Stethoscope className="h-5 w-5 text-azure-mist" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-oceanic uppercase tracking-wider">
                    Hội Chẩn Telehealth Cùng Bác Sĩ
                  </h4>
                  <p className="text-[11px] text-dusk-600">BS. CKI Trần Minh Đức • Khoa Chăm Sóc Vết Thương</p>
                </div>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Bạn có câu hỏi về tình trạng đổi màu mô hoặc muốn Bác sĩ xem lại hình ảnh phân đoạn AI? Kết nối ngay qua cổng Telehealth.
              </p>
              <Link
                href={`/clinician/${patient.id}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-oceanic text-xs font-bold text-white hover:bg-oceanic-800 shadow-sm transition-all"
              >
                <span>Mở Phòng Hội Chẩn & Ký Bệnh Án</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

          </div>

        </div>

      </main>

      {/* HAZARD ALERT MODAL */}
      <HazardAlertModal
        isOpen={showHazardModal}
        onClose={() => setShowHazardModal(false)}
        blackPercent={selectedSnapshot.rybMetrics.blackPercent}
        yellowPercent={selectedSnapshot.rybMetrics.yellowPercent}
        hazardReasons={selectedSnapshot.hazardReasons}
        patientName={patient.fullName}
        woundTitle={selectedWound.title}
      />

      {/* REMINDER MODAL */}
      {showReminderModal && (
        <ReminderModal
          patientId={patient.id}
          onClose={() => setShowReminderModal(false)}
        />
      )}

    </div>
  );
}
