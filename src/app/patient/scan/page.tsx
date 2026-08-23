"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { WoundCanvas } from "@/components/wound-canvas";
import { IntakeSurveyModal } from "@/components/intake-survey-modal";
import { 
  CLINICAL_PRESETS, 
  ClinicalPresetCase, 
  calculateWHI, 
  evaluateHazardStatus, 
  generateDressingRecommendation 
} from "@/lib/ai-vision-mock";
import { MockStorageService } from "@/lib/mock-storage";
import { 
  CalibrationData, 
  LightingStatus, 
  RYBMetrics, 
  SnapshotLog, 
  SurveyData 
} from "@/types/medical-schema";

export default function PatientScanPage() {
  const router = useRouter();
  const [patientId, setPatientId] = useState<string>("PAT-10842");

  // Input Source: 'dropzone' | 'camera' | 'presets'
  const [inputMode, setInputMode] = useState<"dropzone" | "camera" | "presets">("dropzone");
  const [customImageSrc, setCustomImageSrc] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<ClinicalPresetCase>(CLINICAL_PRESETS[0]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Live Camera Stream
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Calibration HUD
  const [lightingStatus, setLightingStatus] = useState<LightingStatus>("optimal");
  const [skewAngle, setSkewAngle] = useState(2.4);
  const [arucoDetected, setArucoDetected] = useState(true);
  const [luxLevel, setLuxLevel] = useState(480);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Tunable RYB metrics
  const [redPct, setRedPct] = useState(selectedPreset.defaultRyb.red);
  const [yellowPct, setYellowPct] = useState(selectedPreset.defaultRyb.yellow);
  const [blackPct, setBlackPct] = useState(selectedPreset.defaultRyb.black);
  const [pinkPct, setPinkPct] = useState(selectedPreset.defaultRyb.pink);
  const [areaCm2, setAreaCm2] = useState(selectedPreset.baseAreaCm2);

  // Intake Survey Modal
  const [showIntakeModal, setShowIntakeModal] = useState(false);

  useEffect(() => {
    const active = localStorage.getItem("LANT_ACTIVE_PATIENT_ID") || "PAT-10842";
    setPatientId(active);
  }, []);

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Handle File Upload from Native Picker or Drag-and-Drop
  const handleFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng tải lên file định dạng hình ảnh hợp lệ (PNG, JPG, WEBP, HEIC).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCustomImageSrc(result);
      setInputMode("dropzone");
      setAreaCm2(9.25);
      setRedPct(55);
      setYellowPct(25);
      setBlackPct(10);
      setPinkPct(10);
      setArucoDetected(true);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Camera Handlers
  const startCamera = async () => {
    stopCameraStream();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setInputMode("camera");
    } catch (err: any) {
      console.warn("Camera access failed, fallback to simulated lens:", err);
      setCameraError("Không thể truy cập camera trực tiếp. Đang sử dụng chế độ mô phỏng ống kính y tế.");
      setInputMode("camera");
    }
  };

  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const switchCameraFacing = () => {
    const next = cameraFacing === "environment" ? "user" : "environment";
    setCameraFacing(next);
    setTimeout(() => startCamera(), 100);
  };

  const captureCameraSnapshot = () => {
    if (videoRef.current && cameraStream) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCustomImageSrc(dataUrl);
        stopCameraStream();
        setInputMode("dropzone");
      }
    } else {
      setCustomImageSrc("/presets/sample_1.jpg");
      stopCameraStream();
      setInputMode("dropzone");
    }
  };

  const handleSelectPreset = (preset: ClinicalPresetCase) => {
    setSelectedPreset(preset);
    setCustomImageSrc(null);
    setRedPct(preset.defaultRyb.red);
    setYellowPct(preset.defaultRyb.yellow);
    setBlackPct(preset.defaultRyb.black);
    setPinkPct(preset.defaultRyb.pink);
    setAreaCm2(preset.baseAreaCm2);
    setInputMode("presets");
    stopCameraStream();
  };

  const handleRunAiAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setArucoDetected(true);
      setSkewAngle(2.1);
      setLuxLevel(510);
    }, 800);
  };

  // Compute live metrics
  const totalRyb = redPct + yellowPct + blackPct + pinkPct || 100;
  const normalizedRyb: RYBMetrics = {
    redPercent: Math.round((redPct / totalRyb) * 100),
    yellowPercent: Math.round((yellowPct / totalRyb) * 100),
    blackPercent: Math.round((blackPct / totalRyb) * 100),
    pinkPercent: Math.max(0, 100 - Math.round((redPct / totalRyb) * 100) - Math.round((yellowPct / totalRyb) * 100) - Math.round((blackPct / totalRyb) * 100)),
    granulationAreaCm2: Number(((redPct / 100) * areaCm2).toFixed(2)),
    sloughAreaCm2: Number(((yellowPct / 100) * areaCm2).toFixed(2)),
    necroticAreaCm2: Number(((blackPct / 100) * areaCm2).toFixed(2)),
    epithelialAreaCm2: Number(((pinkPct / 100) * areaCm2).toFixed(2)),
  };

  const calculatedWHI = calculateWHI(normalizedRyb);
  const hazard = evaluateHazardStatus(normalizedRyb, 0);

  const calibrationData: CalibrationData = {
    markerDetected: arucoDetected,
    markerType: "aruco_4x4",
    knownDimensionCm: 2.0,
    markerPixelWidth: 120,
    ratioCmPerPixel: 2.0 / 120,
    perspectiveSkewAngle: skewAngle,
    lightingStatus,
    luxLevel,
    confidenceScore: 98.4
  };

  const handleSurveySubmit = (survey: SurveyData, woundTitle: string, anatomicalLocation: string) => {
    const woundId = `WND-${Math.floor(100000 + Math.random() * 900000)}`;
    const snapshotId = `SNP-${woundId.split("-")[1]}-01`;

    const newSnapshot: SnapshotLog = {
      id: snapshotId,
      woundId,
      timestamp: new Date().toISOString(),
      dayIndex: 0,
      imageUrl: customImageSrc || selectedPreset.rawImage,
      calibration: calibrationData,
      totalAreaCm2: areaCm2,
      estimatedVolumeCm3: Number((areaCm2 * 0.35).toFixed(2)),
      rybMetrics: normalizedRyb,
      whiScore: calculatedWHI,
      deltaPrevPercent: 0,
      deltaBasePercent: 0,
      hazardStatus: hazard.status,
      hazardReasons: hazard.reasons,
      recommendation: generateDressingRecommendation(normalizedRyb, survey.exudateLevel),
      survey
    };

    MockStorageService.createNewWound(
      patientId,
      { title: woundTitle, anatomicalLocation },
      newSnapshot
    );

    setShowIntakeModal(false);
    router.push("/patient/dashboard");
  };

  return (
    <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-oceanic-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-oceanic-50 px-2.5 py-0.5 text-xs font-bold text-oceanic border border-oceanic-200 font-mono uppercase">
              Quét & hiệu chuẩn ArUco
            </span>
            <span className="text-xs text-slate-500 font-mono">Thước đo 2.0 cm</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-oceanic font-heading mt-1">
            Chụp vết thương & <span className="font-editorial italic font-normal text-sapphire">phân tách mô học AI</span>
          </h1>
          <p className="text-xs sm:text-sm text-dusk-600">
            Hỗ trợ kéo thả ảnh, chọn từ máy, chụp trực tiếp bằng camera hoặc ca bệnh mẫu
          </p>
        </div>

        <button
          onClick={() => setShowIntakeModal(true)}
          className="px-6 py-3 rounded-2xl bg-oceanic text-xs font-bold text-white hover:bg-oceanic-800 shadow-xs transition-all self-start sm:self-auto"
        >
          <span>Khảo sát & lưu bệnh án →</span>
        </button>
      </div>

      {/* Input Source Selector Bar - Pure Typography */}
      <div className="grid grid-cols-3 gap-3 max-w-2xl">
        <button
          onClick={() => {
            setInputMode("dropzone");
            stopCameraStream();
          }}
          className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all ${
            inputMode === "dropzone"
              ? "bg-oceanic text-white shadow-xs"
              : "bg-white/95 text-slate-700 hover:bg-slate-50 border border-oceanic-100/60"
          }`}
        >
          <span>Tải lên / Kéo thả file</span>
        </button>

        <button
          onClick={startCamera}
          className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all ${
            inputMode === "camera"
              ? "bg-oceanic text-white shadow-xs"
              : "bg-white/95 text-slate-700 hover:bg-slate-50 border border-oceanic-100/60"
          }`}
        >
          <span>Bật camera trực tiếp</span>
        </button>

        <button
          onClick={() => {
            setInputMode("presets");
            stopCameraStream();
          }}
          className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all ${
            inputMode === "presets"
              ? "bg-oceanic text-white shadow-xs"
              : "bg-white/95 text-slate-700 hover:bg-slate-50 border border-oceanic-100/60"
          }`}
        >
          <span>Bộ ca bệnh mẫu</span>
        </button>
      </div>

      {/* Viewport Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Canvas / Camera Stream (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Quality Telemetry HUD */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white/95 p-4 shadow-xs border border-oceanic-100/60">
              <span className="text-[11px] font-bold text-slate-600 block mb-1 font-heading">Thước ArUco</span>
              <p className="text-xs font-bold text-oceanic font-heading">
                {arucoDetected ? "Đã khóa 2.0 cm" : "Chưa khóa"}
              </p>
            </div>

            <div className="rounded-2xl bg-white/95 p-4 shadow-xs border border-oceanic-100/60">
              <span className="text-[11px] font-bold text-slate-600 block mb-1 font-heading">Góc nghiêng</span>
              <p className="text-xs font-bold text-oceanic font-heading">
                {skewAngle.toFixed(1)}° (Chuẩn)
              </p>
            </div>

            <div className="rounded-2xl bg-white/95 p-4 shadow-xs border border-oceanic-100/60">
              <span className="text-[11px] font-bold text-slate-600 block mb-1 font-heading">Độ rọi sáng</span>
              <p className="text-xs font-bold text-oceanic font-heading">
                {luxLevel} Lux
              </p>
            </div>
          </div>

          {/* Live Camera Stream Viewport */}
          {inputMode === "camera" && (
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 p-4 space-y-4 shadow-clinical">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-4 left-4 px-3 py-1.5 bg-emerald-950/60 border border-emerald-400 rounded-xl pointer-events-none">
                  <span className="text-[10px] font-mono font-bold text-emerald-300">ARUCO 2.0 CM</span>
                </div>

                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={switchCameraFacing}
                    className="px-4 py-2 rounded-xl bg-slate-900/80 backdrop-blur text-white hover:bg-slate-800 text-xs font-bold border border-white/20"
                  >
                    <span>Đổi camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={captureCameraSnapshot}
                    className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 shadow-md transition-transform active:scale-95"
                  >
                    <span>Chụp ảnh ngay</span>
                  </button>

                  <button
                    type="button"
                    onClick={stopCameraStream}
                    className="px-4 py-2 rounded-xl bg-slate-900/80 backdrop-blur text-white hover:bg-slate-800 text-xs font-bold border border-white/20"
                  >
                    <span>Tắt camera</span>
                  </button>
                </div>
              </div>

              {cameraError && (
                <p className="text-xs text-amber-400 font-medium px-2">
                  {cameraError}
                </p>
              )}
            </div>
          )}

          {/* Drag & Drop Dropzone */}
          {inputMode === "dropzone" && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-3xl p-8 text-center transition-all cursor-pointer border-2 border-dashed ${
                isDragOver
                  ? "border-oceanic bg-oceanic-50"
                  : "border-oceanic-200 bg-white/95 hover:bg-azure-mist/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/heic"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />

              <div className="space-y-1.5">
                <p className="text-sm font-bold text-oceanic font-heading">
                  Kéo thả ảnh vết thương vào đây hoặc <span className="text-sapphire underline">Duyệt file từ máy</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Hỗ trợ định dạng PNG, JPG, WEBP, HEIC
                </p>
              </div>
            </div>
          )}

          {/* Interactive Segmentation Canvas */}
          <WoundCanvas
            imageUrl={customImageSrc || selectedPreset.rawImage}
            rybMetrics={normalizedRyb}
            calibration={calibrationData}
            totalAreaCm2={areaCm2}
            whiScore={calculatedWHI}
            interactive={true}
          />

          {/* Re-analyze Action */}
          <div className="rounded-3xl bg-white/95 p-6 shadow-xs border border-oceanic-100/70 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-oceanic font-heading">Bóc tách & tính toán lại</h4>
              <p className="text-[11px] text-slate-500">Tái tính toán mô hạt, hoại tử và diện tích cm²</p>
            </div>

            <button
              type="button"
              onClick={handleRunAiAnalysis}
              disabled={isAnalyzing}
              className="px-6 py-2.5 rounded-xl bg-sapphire text-xs font-bold text-white hover:bg-sapphire-700 shadow-xs transition-all"
            >
              <span>{isAnalyzing ? "Đang phân đoạn..." : "Chạy lại phân tích"}</span>
            </button>
          </div>

        </div>

        {/* Right Column: Case Presets & Tuning Sliders (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Clinical Presets */}
          <div className="rounded-3xl bg-white/95 p-6 shadow-clinical space-y-4 border border-oceanic-100/70">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-oceanic uppercase tracking-wider font-heading">
                Ca bệnh lâm sàng mẫu
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">4 ca thực tế</span>
            </div>

            <div className="space-y-2.5">
              {CLINICAL_PRESETS.map((preset) => {
                const isSelected = preset.id === selectedPreset.id && !customImageSrc;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`w-full text-left p-3.5 rounded-2xl text-xs transition-all ${
                      isSelected
                        ? "bg-oceanic-50 text-oceanic font-bold border border-oceanic"
                        : "bg-slate-50/70 hover:bg-white text-slate-700 border border-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold font-heading">{preset.name}</span>
                      <span className="font-mono text-[11px] text-sapphire font-bold">
                        {preset.baseAreaCm2} cm²
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {preset.location} • {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RYB Slider Calibration */}
          <div className="rounded-3xl bg-white/95 p-6 shadow-clinical space-y-5 border border-oceanic-100/70">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-oceanic uppercase tracking-wider font-heading">
                Hiệu chỉnh tham số RYB & cm²
              </h3>
              <span className="rounded-full bg-azure-mist px-2 py-0.5 text-[10px] font-bold text-oceanic font-mono">
                Calibrator
              </span>
            </div>

            {/* Area Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Diện tích:</span>
                <span className="font-bold text-oceanic font-mono">{areaCm2} cm²</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="30"
                step="0.1"
                value={areaCm2}
                onChange={(e) => setAreaCm2(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-oceanic"
              />
            </div>

            {/* Red Granulation */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Mô hạt đỏ (Granulation):</span>
                <span className="font-bold text-red-600 font-mono">{redPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={redPct}
                onChange={(e) => setRedPct(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>

            {/* Yellow Slough */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Mô vảy vàng (Slough):</span>
                <span className="font-bold text-amber-600 font-mono">{yellowPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={yellowPct}
                onChange={(e) => setYellowPct(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Black Necrosis */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Mô hoại tử đen (Eschar):</span>
                <span className="font-bold text-slate-950 font-mono">{blackPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={blackPct}
                onChange={(e) => setBlackPct(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
              />
            </div>

            {/* Pink Epithelial */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Rìa biểu mô hóa (Epithelial):</span>
                <span className="font-bold text-pink-600 font-mono">{pinkPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={pinkPct}
                onChange={(e) => setPinkPct(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>

            {hazard.status === "emergency_critical" && (
              <div className="rounded-2xl bg-red-50 p-4 space-y-1 border border-red-200">
                <p className="text-xs font-bold text-red-800 font-heading">
                  Kích hoạt ngưỡng cảnh báo đỏ!
                </p>
                <p className="text-[11px] text-red-700">{hazard.reasons[0]}</p>
              </div>
            )}

            <button
              onClick={() => setShowIntakeModal(true)}
              className="w-full py-3.5 rounded-2xl bg-oceanic text-xs font-bold text-white hover:bg-oceanic-800 shadow-xs transition-all"
            >
              <span>Tiếp tục khảo sát bệnh án & lưu vết thương →</span>
            </button>
          </div>

        </div>

      </div>

      {/* Intake Survey Modal */}
      <IntakeSurveyModal
        isOpen={showIntakeModal}
        onClose={() => setShowIntakeModal(false)}
        onSubmit={handleSurveySubmit}
        defaultTitle={customImageSrc ? "Vết thương mới quét" : selectedPreset.name}
        defaultLocation={selectedPreset.location}
        defaultEtiology={selectedPreset.etiology as any}
      />
    </main>
  );
}
