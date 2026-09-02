"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WoundCanvas } from "@/components/wound-canvas";
import { RecoveryChart } from "@/components/recovery-chart";
import { DressingRecommender } from "@/components/dressing-recommender";
import { DBStore } from "@/lib/db-store";
import { Patient, WoundProfile, SnapshotLog, ClinicianReview } from "@/types/medical-schema";
import { useAuth } from "@/context/AuthContext";

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeWound, setActiveWound] = useState<WoundProfile | null>(null);
  const [activeSnapshot, setActiveSnapshot] = useState<SnapshotLog | null>(null);
  const [reviews, setReviews] = useState<ClinicianReview[]>([]);

  useEffect(() => {
    const loadData = () => {
      const activeId = user?.patientId || user?.id || localStorage.getItem("LANT_ACTIVE_PATIENT_ID") || "PAT-10842";
      let p = DBStore.getPatientById(activeId);
      
      if (!p && user) {
        // Construct patient object from registered user
        p = {
          id: user.patientId || user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone || "Chưa cập nhật",
          age: user.dob ? Math.max(1, new Date().getFullYear() - new Date(user.dob).getFullYear()) : 45,
          gender: user.gender || "Nam",
          medicalRecordNumber: user.medicalRecordNumber || "MRN-2026-0001",
          address: user.address,
          primaryPhysician: "BS. CKI Trần Minh Đức",
          riskTier: "low",
          wounds: []
        };
      } else if (!p) {
        p = DBStore.getPatients()[0] || null;
      }

      setPatient(p || null);

      if (p && p.wounds.length > 0) {
        const defaultWound = p.wounds.find(w => w.status === "active") || p.wounds[0];
        setActiveWound(defaultWound);
        if (defaultWound.snapshots.length > 0) {
          const latest = defaultWound.snapshots[defaultWound.snapshots.length - 1];
          setActiveSnapshot(latest);
        }
        const revList = DBStore.getSignedSoapRecords(p.id, defaultWound.id);
        setReviews(revList);
      } else {
        setActiveWound(null);
        setActiveSnapshot(null);
      }
    };

    loadData();

    const handlePatientChange = () => loadData();
    const handleSoapSigned = () => loadData();

    window.addEventListener("LANT_PATIENT_CHANGED", handlePatientChange);
    window.addEventListener("LANT_SOAP_SIGNED" as any, handleSoapSigned);

    return () => {
      window.removeEventListener("LANT_PATIENT_CHANGED", handlePatientChange);
      window.removeEventListener("LANT_SOAP_SIGNED" as any, handleSoapSigned);
    };
  }, [user]);

  const handleSelectWound = (wound: WoundProfile) => {
    setActiveWound(wound);
    if (wound.snapshots.length > 0) {
      setActiveSnapshot(wound.snapshots[wound.snapshots.length - 1]);
    }
    if (patient) {
      const revList = DBStore.getSignedSoapRecords(patient.id, wound.id);
      setReviews(revList);
    }
  };

  const handleSelectSnapshot = (snapshot: SnapshotLog) => {
    setActiveSnapshot(snapshot);
  };

  const handlePrintEmr = () => {
    window.print();
  };

  if (!patient) {
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
    <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
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
            <span>Địa chỉ: <strong className="text-slate-800">{patient.address ? `${patient.address.ward}, ${patient.address.district}, ${patient.address.province}` : "TP. Hồ Chí Minh"}</strong></span>
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
            <span>Hội chẩn & Nhắn tin Bác sĩ</span>
          </Link>
        </div>
      </div>

      {/* EMPTY STATE OR ACTIVE WOUNDS VIEW */}
      {patient.wounds.length === 0 || !activeWound || !activeSnapshot ? (
        /* Explicit High-Conversion Clinical Empty State */
        <div className="rounded-3xl bg-white/95 p-8 lg:p-12 shadow-clinical border border-oceanic-100/70 text-center space-y-6 max-w-3xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-oceanic-50 border border-oceanic-200 text-oceanic flex items-center justify-center mx-auto text-2xl font-bold font-mono">
            +
          </div>
          
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-oceanic-50 text-oceanic text-xs font-mono font-bold border border-oceanic-200 uppercase">
              Khởi tạo hồ sơ lâm sàng
            </span>
            <h2 className="text-2xl lg:text-3xl font-black text-oceanic font-heading">
              Chưa có vết thương nào được ghi nhận
            </h2>
            <p className="text-xs sm:text-sm text-dusk-600 max-w-xl mx-auto leading-relaxed">
              Hồ sơ bệnh án của bạn hiện chưa có dữ liệu vết thương. Vui lòng thực hiện Chụp & Đo ArUco ngay để khởi tạo hồ sơ bệnh án điện tử và đồng bộ hóa với bác sĩ chuyên khoa phụ trách.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/patient/scan"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-oceanic text-white text-xs font-bold hover:bg-oceanic-800 shadow-md transition-all font-heading"
            >
              <span>Chụp & Đo Vết Thương Ngay (Chuẩn ArUco) →</span>
            </Link>

            <Link
              href="/patient/telehealth"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all"
            >
              <span>Liên hệ bác sĩ phụ trách</span>
            </Link>
          </div>

          {/* 3 Quick Guidance Steps */}
          <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-oceanic font-mono block">BƯỚC 1</span>
              <p className="text-xs font-bold text-slate-800">Đặt thước ArUco 2cm</p>
              <p className="text-[11px] text-slate-500">Đặt cạnh vết thương để hiệu chuẩn kích thước thực tế.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-oceanic font-mono block">BƯỚC 2</span>
              <p className="text-xs font-bold text-slate-800">Kiểm tra độ rọi sáng</p>
              <p className="text-[11px] text-slate-500">Giữ camera ở đèn xanh lá (30-85%) tối ưu.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-oceanic font-mono block">BƯỚC 3</span>
              <p className="text-xs font-bold text-slate-800">Phân tách RYB tự động</p>
              <p className="text-[11px] text-slate-500">AI tính toán mô hạt, vảy vàng và điểm WHI.</p>
            </div>
          </div>
        </div>
      ) : (
        /* Active Wounds Management Dashboard */
        <>
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
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-dusk-400 uppercase tracking-wider font-heading block">
                            {wound.anatomicalLocation}
                          </span>
                          <h3 className="text-base font-bold text-oceanic font-heading mt-0.5">
                            {wound.title}
                          </h3>
                        </div>
                        
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          isWoundCritical 
                            ? "bg-red-50 text-red-700 border border-red-200" 
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}>
                          {isWoundCritical ? "Báo động" : "Ổn định"}
                        </span>
                      </div>

                      {/* Telemetry Metrics */}
                      <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 font-heading block">Diện tích</span>
                          <span className="text-sm font-black font-mono text-oceanic">{wound.currentAreaCm2} cm²</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-heading block">Điểm WHI</span>
                          <span className="text-sm font-black font-mono text-sapphire">{wound.currentWHI}/100</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-heading block">Số lần quét</span>
                          <span className="text-sm font-black font-mono text-slate-700">{wound.snapshots.length} mốc</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>Mốc ban đầu: <strong className="font-mono">{wound.baselineAreaCm2} cm²</strong></span>
                        <span className="text-sapphire font-bold">Xem chi tiết →</span>
                      </div>
                    </div>

                    {/* Hover-to-Reveal Overlay */}
                    {latestSnap && (
                      <div className="absolute inset-0 rounded-3xl bg-slate-950/90 text-white p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between pointer-events-none backdrop-blur-xs">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <span className="text-xs font-bold font-heading text-cyan-300">Phân tách mô học RYB</span>
                            <span className="text-[10px] font-mono text-slate-300">Day {latestSnap.dayIndex}</span>
                          </div>

                          <div className="space-y-1.5 text-xs font-medium">
                            <div className="flex justify-between">
                              <span className="text-red-400">Mô hạt đỏ:</span>
                              <span className="font-mono">{latestSnap.rybMetrics.redPercent}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-amber-300">Mô vảy vàng:</span>
                              <span className="font-mono">{latestSnap.rybMetrics.yellowPercent}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-300">Hoại tử đen:</span>
                              <span className="font-mono">{latestSnap.rybMetrics.blackPercent}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-pink-300">Biểu bì hồng:</span>
                              <span className="font-mono">{latestSnap.rybMetrics.pinkPercent}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/10 text-[11px] text-slate-300 truncate">
                          Gạc khuyến nghị: <span className="text-white font-semibold">{latestSnap.recommendation.primaryDressing}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* TIME-SERIES SCRUBBER */}
          <div className="rounded-3xl bg-white/95 p-7 shadow-clinical space-y-4 border border-oceanic-100/70">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-oceanic font-heading uppercase tracking-wider">
                  Chuỗi thời gian hình ảnh vết thương ({activeWound.title})
                </h3>
                <p className="text-[11px] text-slate-500">Nhấp chọn từng ngày để theo dõi tốc độ thu hẹp vết thương</p>
              </div>

              <span className="text-xs font-mono font-bold text-oceanic">
                Đang xem: Ngày {activeSnapshot.dayIndex}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {activeWound.snapshots.map((snap) => {
                const isSelected = snap.id === activeSnapshot.id;
                return (
                  <button
                    key={snap.id}
                    onClick={() => handleSelectSnapshot(snap)}
                    className={`p-3 rounded-2xl text-left transition-all border ${
                      isSelected
                        ? "bg-oceanic text-white border-oceanic shadow-md font-bold"
                        : "bg-slate-50/80 hover:bg-white border-slate-200/80 text-slate-700"
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
            
            {/* Left Column: Canvas Viewport & Signed SOAP EMR */}
            <div className="lg:col-span-6 space-y-8">
              <WoundCanvas
                imageUrl={activeSnapshot.imageUrl}
                rybMetrics={activeSnapshot.rybMetrics}
                calibration={activeSnapshot.calibration}
                totalAreaCm2={activeSnapshot.totalAreaCm2}
                whiScore={activeSnapshot.whiScore}
                interactive={true}
              />

              {/* OFFICIAL SIGNED SOAP CLINICAL NOTE */}
              {reviews.length > 0 ? (
                <div className="rounded-3xl bg-white/95 p-7 shadow-clinical space-y-4 border border-emerald-300">
                  <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                    <div>
                      <h3 className="text-xs font-bold text-emerald-950 font-heading uppercase tracking-wider">
                        Bệnh án điện tử đã ký số (Official Signed SOAP EMR)
                      </h3>
                      <p className="text-[11px] text-slate-500">Chứng thực bởi Bác sĩ chuyên khoa phụ trách</p>
                    </div>

                    <button
                      onClick={handlePrintEmr}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition-colors font-mono"
                    >
                      <span>In / Tải PDF</span>
                    </button>
                  </div>

                  {/* Complete SOAP Breakdown */}
                  <div className="space-y-3 text-xs text-slate-800 leading-relaxed bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                    {reviews[0].soapSubjective && (
                      <p>
                        <strong className="text-oceanic font-heading">S — Triệu chứng (Subjective):</strong> {reviews[0].soapSubjective}
                      </p>
                    )}
                    {reviews[0].soapObjective && (
                      <p className="font-mono text-[11px]">
                        <strong className="text-oceanic font-heading font-sans text-xs">O — Đo đạc AI (Objective):</strong> {reviews[0].soapObjective}
                      </p>
                    )}
                    <p>
                      <strong className="text-oceanic font-heading">A — Đánh giá Bác sĩ (Assessment):</strong> {reviews[0].soapAssessment}
                    </p>
                    <p>
                      <strong className="text-oceanic font-heading">P — Phác đồ điều trị (Plan):</strong> {reviews[0].soapPlan}
                    </p>
                  </div>

                  {/* Cryptographic Verification Stamp */}
                  <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 border-t border-slate-100 gap-2">
                    <div>
                      <span className="block font-medium">Bác sĩ ký duyệt: <strong className="text-slate-800">{reviews[0].clinicianName}</strong></span>
                      <span className="text-[10px] text-slate-400">{reviews[0].clinicianTitle}</span>
                    </div>

                    <div className="text-right font-mono text-[11px]">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold mb-0.5">
                        {reviews[0].certificateId || "LANT-CERT-2026-8841"}
                      </span>
                      <p className="text-[10px] text-slate-400">{new Date(reviews[0].signedAt || reviews[0].date).toLocaleString("vi-VN")}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl bg-white/95 p-6 text-center text-xs text-slate-500 border border-slate-200">
                  <p>Chưa có bản ghi SOAP nào được ký duyệt cho vết thương này.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Bác sĩ sẽ kiểm tra và ký số sau phiên hội chẩn telehealth.</p>
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
        </>
      )}

    </main>
  );
}
