"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { WoundCanvas } from "@/components/wound-canvas";
import { RecoveryChart } from "@/components/recovery-chart";
import { TelehealthCallModal } from "@/components/telehealth-call-modal";
import { ChatRoom } from "@/components/chat-room";
import { DBStore } from "@/lib/db-store";
import { TelehealthSignalingEngine } from "@/lib/telehealth-signaling";
import { Patient, WoundProfile, SnapshotLog, ClinicianReview } from "@/types/medical-schema";
import { useAuth } from "@/context/AuthContext";

export default function DoctorPatientReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeWound, setActiveWound] = useState<WoundProfile | null>(null);
  const [activeSnapshot, setActiveSnapshot] = useState<SnapshotLog | null>(null);
  const [existingReviews, setExistingReviews] = useState<ClinicianReview[]>([]);
  const [activeViewTab, setActiveViewTab] = useState<"review" | "chat">("review");

  // Telehealth Call Modal
  const [showTelehealthModal, setShowTelehealthModal] = useState(false);

  // Editable SOAP Form State
  const [soapSubjective, setSoapSubjective] = useState("");
  const [soapObjective, setSoapObjective] = useState("");
  const [soapAssessment, setSoapAssessment] = useState("");
  const [soapPlan, setSoapPlan] = useState("");
  const [isSigned, setIsSigned] = useState(false);
  const [signedCertId, setSignedCertId] = useState<string | null>(null);

  useEffect(() => {
    const p = DBStore.getPatientById(patientId) || DBStore.getPatients()[0];
    if (!p) return;
    setPatient(p);

    if (p.wounds.length > 0) {
      const wound = p.wounds.find(w => w.status === "critical_triage" || w.status === "active") || p.wounds[0];
      setActiveWound(wound);

      if (wound.snapshots.length > 0) {
        const latest = wound.snapshots[wound.snapshots.length - 1];
        setActiveSnapshot(latest);

        // Pre-fill realistic AI SOAP Draft
        setSoapSubjective(
          `Bệnh nhân khai: Mức độ đau VAS ${latest.survey.painScore}/10. Dịch tiết ${latest.survey.exudateLevel} (${latest.survey.exudateType}). Không có sốt cao.`
        );
        setSoapObjective(
          `Thị giác AI đo đạc: Diện tích ${latest.totalAreaCm2} cm² (Biến thiên vs Baseline: ${latest.deltaBasePercent}%). Mô học: Đỏ ${latest.rybMetrics.redPercent}%, Vàng ${latest.rybMetrics.yellowPercent}%, Đen ${latest.rybMetrics.blackPercent}%, Hồng ${latest.rybMetrics.pinkPercent}%. Điểm WHI: ${latest.whiScore}/100.`
        );
        setSoapAssessment(
          latest.hazardStatus === "emergency_critical"
            ? "Cảnh báo hoại tử đen / bio-film diện rộng. Cần chỉ định phẫu thuật cắt lọc debridement tại cơ sở y tế."
            : "Vết thương đang trong pha tăng sinh biểu mô hóa, đáp ứng tốt với phác đồ kiểm soát."
        );
        setSoapPlan(
          `Sử dụng ${latest.recommendation.primaryDressing}. Tần suất thay băng: ${latest.recommendation.changeFrequency}. Vệ sinh bằng NaCl 0.9%. Tái khám sau 7 ngày.`
        );
      }

      const revList = DBStore.getSignedSoapRecords(p.id, wound.id);
      setExistingReviews(revList);
    }
  }, [patientId]);

  const handleSelectSnapshot = (snap: SnapshotLog) => {
    setActiveSnapshot(snap);
  };

  const handleInitiateTelehealthCall = () => {
    if (!patient || !activeWound) return;
    
    // Dispatch real-time cross-tab signal to patient
    TelehealthSignalingEngine.sendSignal({
      type: "CALL_INITIATED",
      doctorId: user?.id || "USR-DOC-01",
      doctorName: user?.fullName || "BS. CKI Trần Minh Đức",
      patientId: patient.id,
      woundTitle: activeWound.title,
      timestamp: Date.now()
    });

    setShowTelehealthModal(true);
  };

  const handleSignSoapNote = (overrideAssessment?: string, overridePlan?: string) => {
    if (!patient || !activeWound || !activeSnapshot) return;

    const certId = `LANT-CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReview: ClinicianReview = {
      id: `REV-${Date.now()}`,
      patientId: patient.id,
      woundId: activeWound.id,
      snapshotId: activeSnapshot.id,
      clinicianName: user?.fullName || "BS. CKI Trần Minh Đức",
      clinicianTitle: user?.specialty || "Bác sĩ Chăm sóc Vết thương & Ngoại Chấn Thương",
      date: new Date().toISOString(),
      soapSubjective,
      soapObjective,
      soapAssessment: overrideAssessment || soapAssessment,
      soapPlan: overridePlan || soapPlan,
      approved: true,
      signedAt: new Date().toISOString(),
      certificateId: certId,
      licenseNumber: user?.licenseNumber || "CCHN-2021-8842"
    };

    DBStore.addSignedSoapRecord(newReview);
    setExistingReviews(prev => [newReview, ...prev]);
    setSignedCertId(certId);
    setIsSigned(true);
    setTimeout(() => setIsSigned(false), 3000);
  };

  if (!patient || !activeWound || !activeSnapshot) {
    return (
      <div className="py-24 flex items-center justify-center font-sans text-oceanic">
        <p className="text-sm font-bold font-heading">Đang tải bệnh án...</p>
      </div>
    );
  }

  const doctorId = user?.id || "USR-DOC-01";
  const doctorName = user?.fullName || "BS. CKI Trần Minh Đức";

  return (
    <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans text-slate-800">
      
      {/* Header & Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-oceanic-100 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/doctor/dashboard"
            className="px-4 py-2 rounded-xl bg-white border border-oceanic-200 text-oceanic text-xs font-bold hover:bg-oceanic-50 transition-colors shadow-2xs"
          >
            <span>← Bảng điều phối</span>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-oceanic-50 px-2.5 py-0.5 text-xs font-bold text-oceanic border border-oceanic-200 font-mono">
                Bệnh án điện tử EMR
              </span>
              <span className="text-xs font-mono text-dusk-500">{patient.medicalRecordNumber}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-oceanic font-heading mt-1">
              {patient.fullName} — <span className="font-editorial italic font-normal text-sapphire">{activeWound.title}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab View Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveViewTab("review")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeViewTab === "review"
                  ? "bg-indigoContrast text-white shadow-xs"
                  : "text-slate-600 hover:text-indigoContrast"
              }`}
            >
              Bệnh án & Ký SOAP
            </button>
            <button
              onClick={() => setActiveViewTab("chat")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeViewTab === "chat"
                  ? "bg-indigoContrast text-white shadow-xs"
                  : "text-slate-600 hover:text-indigoContrast"
              }`}
            >
              Nhắn tin 1-on-1
            </button>
          </div>

          <button
            onClick={handleInitiateTelehealthCall}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs transition-all flex items-center gap-2"
          >
            <span>Bắt đầu gọi Telehealth →</span>
          </button>
        </div>
      </div>

      {activeViewTab === "chat" ? (
        /* Chat View */
        <div className="max-w-4xl mx-auto">
          <ChatRoom
            doctorId={doctorId}
            doctorName={doctorName}
            patientId={patient.id}
            patientName={patient.fullName}
          />
        </div>
      ) : (
        /* Main Medical Chart & SOAP Workspace */
        <>
          {/* TIME-SERIES SCRUBBER */}
          <div className="rounded-3xl bg-white/95 p-7 shadow-clinical space-y-5 border border-oceanic-100/70">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-oceanic font-heading uppercase tracking-wider">
                  Chuỗi mốc thời gian hình ảnh vết thương ({activeWound.snapshots.length} mốc)
                </h3>
                <p className="text-[11px] text-slate-500">Chọn mốc thời gian để đối chiếu biến thiên diện tích</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold font-mono text-oceanic">
                  Baseline: {activeWound.baselineAreaCm2} cm²
                </span>
                <span className="text-xs font-bold font-mono text-emerald-700">
                  Hiện tại: {activeWound.currentAreaCm2} cm²
                </span>
              </div>
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
                        ? "bg-indigoContrast text-white border-indigoContrast shadow-md font-bold"
                        : "bg-slate-50/80 hover:bg-white border-slate-200/80 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold font-heading">Day {snap.dayIndex}</span>
                      <span className={`text-[10px] font-mono px-1 rounded ${
                        isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700 font-bold"
                      }`}>
                        {snap.whiScore} WHI
                      </span>
                    </div>
                    <p className={`text-base font-mono font-black ${isSelected ? "text-cyan-200" : "text-oceanic"}`}>
                      {snap.totalAreaCm2} cm²
                    </p>
                    <span className={`text-[10px] block truncate ${isSelected ? "text-slate-200" : "text-slate-400"}`}>
                      {new Date(snap.timestamp).toLocaleDateString("vi-VN")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DUAL WORKSPACE: CANVAS + SOAP EDITOR */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Canvas Viewport (6 Cols) */}
            <div className="lg:col-span-6 space-y-6">
              <WoundCanvas
                imageUrl={activeSnapshot.imageUrl}
                rybMetrics={activeSnapshot.rybMetrics}
                calibration={activeSnapshot.calibration}
                totalAreaCm2={activeSnapshot.totalAreaCm2}
                whiScore={activeSnapshot.whiScore}
                interactive={true}
              />

              {/* Recovery Chart */}
              <RecoveryChart snapshots={activeWound.snapshots} />
            </div>

            {/* Right Column: SOAP Note Editor & Digital Signature (6 Cols) */}
            <div className="lg:col-span-6 space-y-6">
              
              <div className="rounded-3xl bg-white/95 p-7 shadow-clinical border border-oceanic-100/70 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-oceanic font-heading uppercase tracking-wider">
                      Biên soạn & Phê duyệt Bệnh án SOAP
                    </h3>
                    <p className="text-[11px] text-slate-500">Chuẩn hóa lâm sàng S.O.A.P có chữ ký số điện tử y tế</p>
                  </div>

                  <span className="rounded-full bg-indigoContrast-50 text-indigoContrast px-3 py-0.5 text-xs font-mono font-bold border border-indigoContrast-200">
                    Day {activeSnapshot.dayIndex} Focus
                  </span>
                </div>

                {/* S - Subjective */}
                <div>
                  <label className="block text-xs font-bold text-oceanic mb-1 font-heading">
                    S — Subjective (Triệu chứng cơ năng bệnh nhân khai):
                  </label>
                  <textarea
                    rows={2}
                    value={soapSubjective}
                    onChange={(e) => setSoapSubjective(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 p-3.5 text-xs text-slate-800 focus:border-oceanic focus:bg-white focus:outline-none leading-relaxed font-sans"
                  />
                </div>

                {/* O - Objective */}
                <div>
                  <label className="block text-xs font-bold text-oceanic mb-1 font-heading">
                    O — Objective (Thị giác máy tính AI & Đo lường thực thể):
                  </label>
                  <textarea
                    rows={3}
                    value={soapObjective}
                    onChange={(e) => setSoapObjective(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 p-3.5 text-xs text-slate-800 focus:border-oceanic focus:bg-white focus:outline-none leading-relaxed font-mono"
                  />
                </div>

                {/* A - Assessment */}
                <div>
                  <label className="block text-xs font-bold text-oceanic mb-1 font-heading">
                    A — Assessment (Chẩn đoán & Đánh giá của Bác sĩ):
                  </label>
                  <textarea
                    rows={2}
                    value={soapAssessment}
                    onChange={(e) => setSoapAssessment(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 p-3.5 text-xs text-slate-800 focus:border-oceanic focus:bg-white focus:outline-none leading-relaxed font-sans"
                  />
                </div>

                {/* P - Plan */}
                <div>
                  <label className="block text-xs font-bold text-oceanic mb-1 font-heading">
                    P — Plan (Kế hoạch điều trị, chỉ định băng gạc & Dặn dò):
                  </label>
                  <textarea
                    rows={2}
                    value={soapPlan}
                    onChange={(e) => setSoapPlan(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 p-3.5 text-xs text-slate-800 focus:border-oceanic focus:bg-white focus:outline-none leading-relaxed font-sans"
                  />
                </div>

                {/* Sign Action Button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div className="text-[11px] text-slate-500 font-mono">
                    Ký với tư cách: <strong>{doctorName}</strong> ({user?.licenseNumber || "CCHN-2021-8842"})
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSignSoapNote()}
                    disabled={isSigned}
                    className="px-6 py-3 rounded-2xl bg-indigoContrast hover:bg-indigo-950 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
                  >
                    <span>{isSigned ? "Đã ký số thành công!" : "Phê duyệt & Ký số Điện tử"}</span>
                  </button>
                </div>

                {signedCertId && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center justify-between">
                    <span>Mã chứng chỉ số: <strong>{signedCertId}</strong></span>
                    <span>Đã đồng bộ sang hồ sơ bệnh nhân</span>
                  </div>
                )}
              </div>

              {/* History of Signed Reviews */}
              {existingReviews.length > 0 && (
                <div className="rounded-3xl bg-white/95 p-6 shadow-clinical space-y-4 border border-oceanic-100/70">
                  <h3 className="text-xs font-bold text-oceanic font-heading uppercase tracking-wider">
                    Lịch sử các bản SOAP đã ký ({existingReviews.length})
                  </h3>

                  <div className="space-y-3">
                    {existingReviews.map((rev) => (
                      <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-oceanic font-heading">{rev.clinicianName}</span>
                          <span className="font-mono text-slate-500 text-[10px]">
                            {new Date(rev.signedAt || rev.date).toLocaleString("vi-VN")}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed"><strong>Đánh giá:</strong> {rev.soapAssessment}</p>
                        <p className="text-slate-700 leading-relaxed"><strong>Kế hoạch:</strong> {rev.soapPlan}</p>
                        {rev.certificateId && (
                          <div className="text-[10px] text-emerald-700 font-mono pt-1">
                            Chứng thực số: {rev.certificateId} • {rev.licenseNumber}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        </>
      )}

      {/* Telehealth Call Modal */}
      {showTelehealthModal && (
        <TelehealthCallModal
          isOpen={showTelehealthModal}
          onClose={() => {
            setShowTelehealthModal(false);
            if (patient) {
              TelehealthSignalingEngine.sendSignal({
                type: "CALL_ENDED",
                doctorId: user?.id || "USR-DOC-01",
                patientId: patient.id,
                timestamp: Date.now()
              });
              TelehealthSignalingEngine.clearActiveCall(patient.id);
            }
          }}
          patient={patient}
          wound={activeWound}
          activeSnapshot={activeSnapshot}
          onSignSoap={(assessment, plan) => {
            handleSignSoapNote(assessment, plan);
          }}
        />
      )}

    </main>
  );
}
