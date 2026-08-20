"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { WoundCanvas } from "@/components/wound-canvas";
import { TelehealthCallModal } from "@/components/telehealth-call-modal";
import { RecoveryChart } from "@/components/recovery-chart";
import { DressingRecommender } from "@/components/dressing-recommender";
import { 
  Stethoscope, 
  Video, 
  ChevronLeft, 
  Calendar, 
  Clock, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  History,
  Activity,
  Award
} from "lucide-react";
import { MockStorageService } from "@/lib/mock-storage";
import { Patient, WoundProfile, SnapshotLog, ClinicianReview } from "@/types/medical-schema";

export default function PatientRemoteCaseViewer() {
  const params = useParams();
  const router = useRouter();
  const patientId = params?.patientId as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [selectedWound, setSelectedWound] = useState<WoundProfile | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<SnapshotLog | null>(null);
  const [reviews, setReviews] = useState<ClinicianReview[]>([]);
  const [isTelehealthModalOpen, setIsTelehealthModalOpen] = useState(false);

  // SOAP State
  const [subjective, setSubjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    const p = MockStorageService.getPatient(patientId);
    if (p) {
      setPatient(p);
      const activeWound = p.wounds[0];
      setSelectedWound(activeWound || null);
      if (activeWound && activeWound.snapshots.length > 0) {
        const latest = activeWound.snapshots[activeWound.snapshots.length - 1];
        setSelectedSnapshot(latest);
        setSubjective(`Bệnh nhân báo mức độ đau VAS ${latest.survey.painScore}/10. Không có biến chứng sốt hay nhiễm trùng toàn thân.`);
        setAssessment(`Vết thương ở pha tăng sinh mô hạt, đáp ứng tốt với phác đồ hiện hành.`);
        setPlan(`Tiếp tục phác đồ băng dán vô trùng, tái khám sau 7 ngày.`);
      }
      const revList = MockStorageService.getReviews(activeWound?.id);
      setReviews(revList);
    }
  }, [patientId]);

  if (!patient || !selectedWound || !selectedSnapshot) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Activity className="h-8 w-8 text-oceanic animate-spin mx-auto" />
            <p className="text-xs font-bold text-oceanic">Đang tải hồ sơ bệnh nhân {patientId}...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveClinicianNote = (e: React.FormEvent) => {
    e.preventDefault();
    const newRev: ClinicianReview = {
      id: `REV-${selectedWound.id}-${Date.now()}`,
      patientId: patient.id,
      woundId: selectedWound.id,
      snapshotId: selectedSnapshot.id,
      clinicianName: "BS. CKI Trần Minh Đức",
      clinicianTitle: "Chuyên khoa Chăm sóc Vết thương & Ngoại khoa",
      date: new Date().toISOString(),
      soapSubjective: subjective,
      soapObjective: `Diện tích: ${selectedSnapshot.totalAreaCm2} cm², R:${selectedSnapshot.rybMetrics.redPercent}% Y:${selectedSnapshot.rybMetrics.yellowPercent}% B:${selectedSnapshot.rybMetrics.blackPercent}% P:${selectedSnapshot.rybMetrics.pinkPercent}%. WHI: ${selectedSnapshot.whiScore}`,
      soapAssessment: assessment,
      soapPlan: plan,
      approved: true,
      signedAt: new Date().toISOString()
    };

    MockStorageService.addReview(newRev);
    setReviews(MockStorageService.getReviews(selectedWound.id));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Navigation & Patient Quick Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-oceanic-100 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/clinician"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-oceanic">
                  Hồ Sơ Lâm Sàng: {patient.fullName}
                </h1>
                <span className="rounded bg-oceanic-50 px-2 py-0.5 text-xs font-mono font-bold text-oceanic border border-oceanic-200">
                  {patient.medicalRecordNumber}
                </span>
              </div>
              <p className="text-xs text-dusk-500">
                {patient.age} tuổi • {patient.gender === "Male" ? "Nam" : "Nữ"} • SĐT: {patient.phone} • {patient.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTelehealthModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-oceanic to-sapphire text-white text-xs font-bold shadow-md shadow-oceanic/20 hover:opacity-95 transition-all"
            >
              <Video className="h-4 w-4 text-azure-mist animate-pulse" />
              <span>Gọi Video Telehealth Trực Tuyến</span>
            </button>
          </div>
        </div>

        {/* Time-Series Historical Scrubber Strip */}
        <div className="rounded-2xl border border-oceanic-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-oceanic" />
            <span className="text-xs font-bold text-oceanic uppercase tracking-wider">
              Dòng Thời Gian Quét AI (Time-Series Scrubber):
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {selectedWound.snapshots.map((snap) => {
              const isSelected = snap.id === selectedSnapshot.id;
              return (
                <button
                  key={snap.id}
                  onClick={() => setSelectedSnapshot(snap)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? "border-oceanic bg-oceanic text-white shadow-xs font-bold"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>Ngày {snap.dayIndex}</span>
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-azure-mist' : 'text-slate-500'}`}>
                    ({snap.totalAreaCm2} cm²)
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Grid: Wound Canvas Inspection & Clinician SOAP Note Builder */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Visual AI Segmentation & Recovery Trend (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Wound Canvas with Multi-Layer Toggles */}
            <WoundCanvas
              rybMetrics={selectedSnapshot.rybMetrics}
              calibration={selectedSnapshot.calibration}
              totalAreaCm2={selectedSnapshot.totalAreaCm2}
              whiScore={selectedSnapshot.whiScore}
              interactive={true}
            />

            {/* Recovery Chart */}
            <RecoveryChart snapshots={selectedWound.snapshots} />

            {/* Decision Support Dressing */}
            <DressingRecommender
              recommendation={selectedSnapshot.recommendation}
              rybMetrics={selectedSnapshot.rybMetrics}
            />

          </div>

          {/* Right Column: Clinician SOAP Review Form & Past History (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* SOAP Note Form */}
            <div className="rounded-2xl border border-oceanic-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-oceanic" />
                  <h3 className="text-xs font-bold text-oceanic uppercase tracking-wider">
                    Ghi Chú Lâm Sàng SOAP & Ký Số
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">BÁC SĨ NGOẠI KHOA</span>
              </div>

              <form onSubmit={handleSaveClinicianNote} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    [S] Subjective — Triệu Chứng Cơ Năng (Bệnh Nhân Khai):
                  </label>
                  <textarea
                    rows={2}
                    value={subjective}
                    onChange={(e) => setSubjective(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-oceanic focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    [O] Objective — Đo Đạc Khách Quan Từ AI:
                  </label>
                  <div className="p-2.5 rounded-lg bg-azure-mist/60 border border-oceanic-100 text-[11px] text-oceanic-900 font-mono space-y-0.5">
                    <div>Diện tích: <strong>{selectedSnapshot.totalAreaCm2} cm²</strong> (Delta: {selectedSnapshot.deltaBasePercent}%)</div>
                    <div>RYB: R:{selectedSnapshot.rybMetrics.redPercent}% Y:{selectedSnapshot.rybMetrics.yellowPercent}% B:{selectedSnapshot.rybMetrics.blackPercent}% P:{selectedSnapshot.rybMetrics.pinkPercent}%</div>
                    <div>Chỉ số WHI: <strong>{selectedSnapshot.whiScore} / 100</strong></div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    [A] Assessment — Đánh Giá Của Bác Sĩ:
                  </label>
                  <textarea
                    rows={2}
                    value={assessment}
                    onChange={(e) => setAssessment(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-oceanic focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    [P] Plan — Hướng Xử Trí & Thay Băng:
                  </label>
                  <textarea
                    rows={3}
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-oceanic focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-oceanic text-xs font-bold text-white hover:bg-oceanic-800 shadow-md shadow-oceanic/20 transition-all"
                >
                  {isSaved ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Đã Lưu & Ký Số Thành Công!</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 text-azure-mist" />
                      <span>Ký Số & Lưu Vào Hồ Sơ Bệnh Án</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Signed Reviews History */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <History className="h-4 w-4 text-sapphire" />
                Lịch Sử Hội Chẩn & Ký Duyệt ({reviews.length})
              </h3>

              {reviews.length === 0 ? (
                <p className="text-xs text-slate-400">Chưa có ghi chú nào được ký trước đây.</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                        <span className="font-bold text-oceanic">{rev.clinicianName}</span>
                        <span className="text-[10px] text-slate-500">{new Date(rev.date).toLocaleDateString("vi-VN")}</span>
                      </div>
                      <p className="text-slate-700 leading-snug"><strong>Đánh giá:</strong> {rev.soapAssessment}</p>
                      <p className="text-slate-700 leading-snug"><strong>Phác đồ:</strong> {rev.soapPlan}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </main>

      {/* TELEHEALTH VIDEO CALL MODAL */}
      <TelehealthCallModal
        isOpen={isTelehealthModalOpen}
        onClose={() => {
          setIsTelehealthModalOpen(false);
          setReviews(MockStorageService.getReviews(selectedWound.id));
        }}
        patient={patient}
        wound={selectedWound}
        latestSnapshot={selectedSnapshot}
      />

    </div>
  );
}
