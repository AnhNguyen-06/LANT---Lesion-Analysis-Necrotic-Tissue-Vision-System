"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { WoundCanvas } from "@/components/wound-canvas";
import { RecoveryChart } from "@/components/recovery-chart";
import { TelehealthCallModal } from "@/components/telehealth-call-modal";
import { MockStorageService } from "@/lib/mock-storage";
import { Patient, WoundProfile, SnapshotLog, ClinicianReview } from "@/types/medical-schema";

export default function DoctorPatientReviewPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeWound, setActiveWound] = useState<WoundProfile | null>(null);
  const [activeSnapshot, setActiveSnapshot] = useState<SnapshotLog | null>(null);
  const [existingReviews, setExistingReviews] = useState<ClinicianReview[]>([]);

  // Telehealth Call Modal
  const [showTelehealthModal, setShowTelehealthModal] = useState(false);

  // Editable SOAP Form State
  const [soapSubjective, setSoapSubjective] = useState("");
  const [soapObjective, setSoapObjective] = useState("");
  const [soapAssessment, setSoapAssessment] = useState("");
  const [soapPlan, setSoapPlan] = useState("");
  const [isSigned, setIsSigned] = useState(false);

  useEffect(() => {
    const p = MockStorageService.getPatient(patientId);
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
          `Bệnh nhân khai: Mức độ đau VAS ${latest.survey.painScore}/10. Dịch tiết ${latest.survey.exudateLevel} (${latest.survey.exudateType}). Không sốt cao.`
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

      const revList = MockStorageService.getReviews(wound.id);
      setExistingReviews(revList);
    }
  }, [patientId]);

  const handleSelectSnapshot = (snap: SnapshotLog) => {
    setActiveSnapshot(snap);
  };

  const handleSignSoapNote = (overrideAssessment?: string, overridePlan?: string) => {
    if (!patient || !activeWound || !activeSnapshot) return;

    const newReview: ClinicianReview = {
      id: `REV-${Date.now()}`,
      patientId: patient.id,
      woundId: activeWound.id,
      snapshotId: activeSnapshot.id,
      clinicianName: "BS. CKI Trần Minh Đức",
      clinicianTitle: "Bác sĩ Chăm sóc Vết thương & Ngoại Chấn Thương",
      date: new Date().toISOString(),
      soapSubjective,
      soapObjective,
      soapAssessment: overrideAssessment || soapAssessment,
      soapPlan: overridePlan || soapPlan,
      approved: true,
      signedAt: new Date().toISOString()
    };

    MockStorageService.addReview(newReview);
    setExistingReviews(prev => [newReview, ...prev]);
    setIsSigned(true);
    setTimeout(() => setIsSigned(false), 2500);
  };

  if (!patient || !activeWound || !activeSnapshot) {
    return (
      <div className="py-24 flex items-center justify-center font-sans text-oceanic">
        <p className="text-sm font-bold font-heading">Đang tải bệnh án...</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans text-slate-800">
      
      {/* Header & Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-oceanic-100 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/doctor/dashboard"
            className="px-4 py-2 rounded-xl bg-white border border-oceanic-200 text-oceanic text-xs font-bold hover:bg-oceanic-50 transition-colors shadow-2xs"
          >
            <span>← Trở lại</span>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-oceanic-50 px-2.5 py-0.5 text-xs font-bold text-oceanic border border-oceanic-200 font-mono">
                Bệnh án điện tử
              </span>
              <span className="text-xs font-mono text-dusk-500">{patient.medicalRecordNumber}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-oceanic font-heading mt-1">
              {patient.fullName} — <span className="font-editorial italic font-normal text-sapphire">{activeWound.title}</span>
            </h1>
          </div>
        </div>

        <button
          onClick={() => setShowTelehealthModal(true)}
          className="px-6 py-3 rounded-2xl bg-indigoContrast text-xs font-bold text-white hover:bg-indigoContrast-900 shadow-xs transition-all self-start sm:self-auto"
        >
          <span>Mở phòng telehealth trực tuyến →</span>
        </button>
      </div>

      {/* TIME-SERIES SCRUBBER */}
      <div className="rounded-3xl bg-white/95 p-7 shadow-clinical space-y-5 border border-oceanic-100/70">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-oceanic font-heading">
              Chuỗi quét lâm sàng đối chiếu <span className="font-editorial italic font-normal text-sapphire">(Time-Series Scrubber)</span>
            </h3>
            <p className="text-[11px] text-dusk-500">
              Đối chiếu diễn tiến phục hồi qua từng mốc ngày
            </p>
          </div>
          <span className="text-xs font-mono text-dusk-500">
            {activeWound.snapshots.length} mốc theo dõi
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

      {/* SIDE-BY-SIDE: CANVAS & SOAP NOTE EDITOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Synchronized Wound Canvas & Curve (6 Cols) */}
        <div className="lg:col-span-6 space-y-8">
          <WoundCanvas
            imageUrl={activeSnapshot.imageUrl}
            rybMetrics={activeSnapshot.rybMetrics}
            calibration={activeSnapshot.calibration}
            totalAreaCm2={activeSnapshot.totalAreaCm2}
            whiScore={activeSnapshot.whiScore}
            interactive={true}
          />

          <RecoveryChart snapshots={activeWound.snapshots} />
        </div>

        {/* Right: SOAP Editor & Electronic Sign (6 Cols) */}
        <div className="lg:col-span-6 space-y-8">
          
          <div className="rounded-3xl bg-white/95 p-7 shadow-clinical space-y-5 border border-indigoContrast-100/70">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-oceanic font-heading">
                  Bệnh án điện tử chuẩn SOAP & <span className="font-editorial italic font-normal text-sapphire">ký số</span>
                </h3>
                <p className="text-[11px] text-dusk-500">
                  Bác sĩ chỉnh sửa và ký duyệt phác đồ gửi máy bệnh nhân
                </p>
              </div>

              <span className="rounded-full bg-indigoContrast-50 px-2.5 py-0.5 text-[10px] font-bold text-indigoContrast border border-indigoContrast-200 uppercase font-mono">
                SOAP Note
              </span>
            </div>

            {/* SOAP Form */}
            <div className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  S (Subjective — Bệnh nhân khai):
                </label>
                <textarea
                  rows={2}
                  value={soapSubjective}
                  onChange={(e) => setSoapSubjective(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 p-3.5 text-xs text-slate-800 focus:border-oceanic focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  O (Objective — Thị giác AI & Số đo ArUco):
                </label>
                <textarea
                  rows={2}
                  value={soapObjective}
                  onChange={(e) => setSoapObjective(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 p-3.5 text-xs text-slate-800 focus:border-oceanic focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  A (Assessment — Đánh giá Bác sĩ):
                </label>
                <textarea
                  rows={2}
                  value={soapAssessment}
                  onChange={(e) => setSoapAssessment(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 p-3.5 text-xs text-slate-800 focus:border-oceanic focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  P (Plan — Kế hoạch & Băng gạc chỉ định):
                </label>
                <textarea
                  rows={2}
                  value={soapPlan}
                  onChange={(e) => setSoapPlan(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50/50 p-3.5 text-xs text-slate-800 focus:border-oceanic focus:bg-white focus:outline-none"
                />
              </div>

            </div>

            {/* Digital Sign Action */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-dusk-600">
                Ký bởi: <strong className="text-oceanic">BS. CKI Trần Minh Đức</strong> (CCHN-2021-8842)
              </div>

              <button
                type="button"
                onClick={() => handleSignSoapNote()}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs transition-all"
              >
                <span>{isSigned ? "Đã ký số thành công!" : "Phê duyệt & ký số điện tử"}</span>
              </button>
            </div>

          </div>

          {/* Signed Reviews History */}
          {existingReviews.length > 0 && (
            <div className="rounded-3xl bg-white/95 p-7 shadow-clinical space-y-4 border border-oceanic-100/70">
              <h4 className="text-xs font-bold text-oceanic uppercase tracking-wider font-heading">
                Lịch sử ký duyệt bệnh án ({existingReviews.length})
              </h4>
              <div className="space-y-3">
                {existingReviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-bold text-oceanic">{rev.clinicianName}</span>
                      <span className="font-mono text-[10px]">{new Date(rev.signedAt || rev.date).toLocaleDateString("vi-VN")}</span>
                    </div>
                    <p className="text-[11px] text-slate-700"><strong>Đánh giá:</strong> {rev.soapAssessment}</p>
                    <p className="text-[11px] text-slate-700"><strong>Phác đồ:</strong> {rev.soapPlan}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Telehealth Video Call Modal */}
      {showTelehealthModal && (
        <TelehealthCallModal
          isOpen={showTelehealthModal}
          onClose={() => setShowTelehealthModal(false)}
          patient={patient}
          wound={activeWound}
          activeSnapshot={activeSnapshot}
          onSignSoap={handleSignSoapNote}
        />
      )}

    </main>
  );
}
