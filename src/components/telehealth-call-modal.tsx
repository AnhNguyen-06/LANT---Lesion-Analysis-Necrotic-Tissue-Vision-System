"use client";

import { useState, useEffect } from "react";
import { 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Share2, 
  Stethoscope, 
  Layers, 
  User, 
  Edit3, 
  Lock,
  Clock,
  ShieldCheck,
  X
} from "lucide-react";
import { Patient, WoundProfile, SnapshotLog, ClinicianReview } from "@/types/medical-schema";
import { MockStorageService } from "@/lib/mock-storage";
import { WoundCanvas } from "./wound-canvas";

interface TelehealthCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  wound: WoundProfile;
  latestSnapshot: SnapshotLog;
}

export function TelehealthCallModal({
  isOpen,
  onClose,
  patient,
  wound,
  latestSnapshot
}: TelehealthCallModalProps) {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(145); // seconds
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  // SOAP Note Form State
  const [soapSubjective, setSoapSubjective] = useState(
    `Bệnh nhân ${patient.fullName} (${patient.age} tuổi) báo mức độ đau hiện tại VAS ${latestSnapshot.survey.painScore}/10. Vết thương không còn cảm giác đau nhức âm ỉ ban đêm. Băng phụ không bị rò dịch ướt.`
  );
  const [soapObjective] = useState(
    `Diện tích đo đạc ArUco: ${latestSnapshot.totalAreaCm2} cm² (giảm ${latestSnapshot.deltaBasePercent}% so với ban đầu). Tỷ lệ mô RYB: Đỏ (Mô hạt) ${latestSnapshot.rybMetrics.redPercent}%, Vàng (Slough) ${latestSnapshot.rybMetrics.yellowPercent}%, Đen (Hoại tử) ${latestSnapshot.rybMetrics.blackPercent}%, Hồng (Biểu mô) ${latestSnapshot.rybMetrics.pinkPercent}%. Điểm WHI: ${latestSnapshot.whiScore}/100.`
  );
  const [soapAssessment, setSoapAssessment] = useState(
    `Loét bàn chân tiến triển thuận lợi vào pha tăng sinh mô hạt và biểu mô hóa mép. Không có dấu hiệu viêm mô tế bào (Cellulitis) quanh bờ mép.`
  );
  const [soapPlan, setSoapPlan] = useState(
    `1. Tiếp tục duy trì băng dán bọt xốp Allevyn Non-Adhesive Foam, thay băng mỗi 3 ngày.\n2. Rửa nhẹ nhàng bằng NaCl 0.9% ấm trước khi dán băng mới.\n3. Duy trì mang dép chỉnh hình giảm tải áp lực khi đi lại trong nhà.\n4. Tái khám và chụp quét cập nhật sau 7 ngày.`
  );

  // Call timer ticker
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleApproveAndSign = () => {
    const newReview: ClinicianReview = {
      id: `REV-${wound.id}-${Date.now()}`,
      patientId: patient.id,
      woundId: wound.id,
      snapshotId: latestSnapshot.id,
      clinicianName: "BS. CKI Trần Minh Đức",
      clinicianTitle: "Chuyên khoa Chăm sóc Vết thương & Phẫu thuật Chấn thương",
      date: new Date().toISOString(),
      soapSubjective,
      soapObjective,
      soapAssessment,
      soapPlan,
      approved: true,
      signedAt: new Date().toISOString()
    };

    MockStorageService.addReview(newReview);
    setIsSigned(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleRegenerateAiSummary = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      setSoapAssessment(
        `AI ĐÃ TỐI ƯU HÓA: Tốc độ co nhỏ diện tích đạt ${latestSnapshot.deltaBasePercent}%. Nền mô sạch 100% hoại tử đen, biểu mô hóa đang tiến dần từ bờ mép. Đáp ứng tốt với phác đồ kiểm soát đường huyết hiện tại.`
      );
      setIsAiGenerating(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl rounded-2xl border border-oceanic-300 bg-white p-4 sm:p-6 shadow-2xl my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-oceanic text-white shadow-sm">
              <Stethoscope className="h-5 w-5 text-azure-mist" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-oceanic">Hội Chẩn Telehealth Y Khoa Trực Tuyến</span>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                  MÃ HÓA E2EE CHUẨN HIPAA
                </span>
              </div>
              <p className="text-xs text-dusk-500">
                Bệnh nhân: <strong className="text-slate-800">{patient.fullName}</strong> ({patient.age}t • {patient.medicalRecordNumber}) • Bác sĩ: <strong>BS. CKI Trần Minh Đức</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-mono font-bold text-slate-800">
              <Clock className="h-3.5 w-3.5 text-oceanic" />
              <span>{formatTimer(callDuration)}</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-y-auto pr-1">
          
          {/* Left Column: Simulated Video Call & Synchronized Wound Canvas (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Split Video Streams */}
            <div className="grid grid-cols-2 gap-2">
              {/* Doctor Video Mock */}
              <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video border border-slate-800 flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center p-3">
                  <div className="h-12 w-12 rounded-full bg-oceanic-700 border-2 border-cyan-400 flex items-center justify-center text-white font-bold text-sm mb-1">
                    BS.Đ
                  </div>
                  <span className="text-xs font-bold text-white">BS. CKI Trần Minh Đức</span>
                  <span className="text-[10px] text-cyan-300">Chuyên khoa Chăm sóc Vết thương</span>
                </div>
                <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-mono text-emerald-400">
                  HD 1080p • 60fps
                </span>
              </div>

              {/* Patient Video Mock */}
              <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video border border-slate-800 flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center p-3">
                  <div className="h-12 w-12 rounded-full bg-slate-700 border-2 border-emerald-400 flex items-center justify-center text-white font-bold text-sm mb-1">
                    {patient.fullName.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-white">{patient.fullName}</span>
                  <span className="text-[10px] text-slate-300">Đang kết nối tại gia</span>
                </div>
                <span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-mono text-emerald-400">
                  PATIENT STREAM • STERILE MIC
                </span>
              </div>
            </div>

            {/* Video Controls Toolbar */}
            <div className="flex items-center justify-center gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-2.5 rounded-full transition-colors ${
                  isMicOn ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-red-600 text-white"
                }`}
                title={isMicOn ? "Tắt mic" : "Bật mic"}
              >
                {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-2.5 rounded-full transition-colors ${
                  isVideoOn ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-red-600 text-white"
                }`}
                title={isVideoOn ? "Tắt camera" : "Bật camera"}
              >
                {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </button>

              <button
                onClick={onClose}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-full transition-colors"
              >
                <PhoneOff className="h-4 w-4" />
                <span>Kết Thúc Cuộc Gọi</span>
              </button>
            </div>

            {/* Synchronized Live Wound Inspection Canvas */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-oceanic uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-sapphire" />
                  Đồng Bộ Khung Hình Đo Đạc Trực Tuyến
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Ảnh Chụp Ngày {latestSnapshot.dayIndex} ({latestSnapshot.totalAreaCm2} cm²)
                </span>
              </div>
              <WoundCanvas
                rybMetrics={latestSnapshot.rybMetrics}
                calibration={latestSnapshot.calibration}
                totalAreaCm2={latestSnapshot.totalAreaCm2}
                whiScore={latestSnapshot.whiScore}
                interactive={true}
              />
            </div>

          </div>

          {/* Right Column: AI Auto-Generated SOAP Note & Clinical Sign-off (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-oceanic-100 bg-azure-mist/30 p-4 space-y-3">
            <div>
              <div className="flex items-center justify-between border-b border-oceanic-100 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-sapphire" />
                  <h3 className="text-xs font-bold text-oceanic uppercase tracking-wide">
                    Bệnh Án Điện Tử SOAP & Phê Duyệt AI
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleRegenerateAiSummary}
                  disabled={isAiGenerating}
                  className="text-[10px] font-bold text-sapphire hover:underline flex items-center gap-1"
                >
                  <Sparkles className={`h-3 w-3 ${isAiGenerating ? 'animate-spin' : ''}`} />
                  Tạo Lại Với AI
                </button>
              </div>

              {/* SOAP Form Fields */}
              <div className="space-y-3 text-xs">
                {/* S */}
                <div>
                  <label className="block font-bold text-slate-800 mb-0.5">
                    [S] Subjective — Triệu Chứng Cơ Năng:
                  </label>
                  <textarea
                    rows={2}
                    value={soapSubjective}
                    onChange={(e) => setSoapSubjective(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 focus:border-oceanic focus:outline-none"
                  />
                </div>

                {/* O */}
                <div>
                  <label className="block font-bold text-slate-800 mb-0.5">
                    [O] Objective — Đo Đạc Khách Quan (Từ AI Vision):
                  </label>
                  <div className="rounded-lg border border-slate-200 bg-white p-2 text-[11px] text-slate-700 leading-relaxed font-medium">
                    {soapObjective}
                  </div>
                </div>

                {/* A */}
                <div>
                  <label className="block font-bold text-slate-800 mb-0.5">
                    [A] Assessment — Đánh Giá & Chẩn Đoán Của Bác Sĩ:
                  </label>
                  <textarea
                    rows={2}
                    value={soapAssessment}
                    onChange={(e) => setSoapAssessment(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 focus:border-oceanic focus:outline-none"
                  />
                </div>

                {/* P */}
                <div>
                  <label className="block font-bold text-slate-800 mb-0.5">
                    [P] Plan — Phác Đồ Kê Toa & Chăm Sóc Tại Nhà:
                  </label>
                  <textarea
                    rows={3}
                    value={soapPlan}
                    onChange={(e) => setSoapPlan(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 focus:border-oceanic focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Doctor Sign and Approve Button */}
            <div className="pt-3 border-t border-oceanic-100 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Ký số định danh chứng thư: <strong>BS-MD-2024-8842</strong></span>
              </div>

              <button
                onClick={handleApproveAndSign}
                disabled={isSigned}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-white shadow-md transition-all ${
                  isSigned
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-oceanic hover:bg-oceanic-800 shadow-oceanic/30"
                }`}
              >
                {isSigned ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Đã Ký Số & Gửi Cho Bệnh Nhân!</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 text-azure-mist" />
                    <span>Phê Duyệt SOAP & Gửi Phác Đồ Cho Bệnh Nhân</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
