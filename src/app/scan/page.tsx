"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { WoundCanvas } from "@/components/wound-canvas";
import { IntakeSurveyModal } from "@/components/intake-survey-modal";
import { ReminderModal } from "@/components/reminder-modal";
import { HazardAlertModal } from "@/components/hazard-alert";
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Sun, 
  Compass, 
  Layers, 
  ShieldCheck, 
  ArrowRight,
  RefreshCw,
  Sliders,
  Maximize2,
  FolderOpen
} from "lucide-react";
import { 
  CLINICAL_PRESETS, 
  ClinicalPresetCase, 
  calculatePhysicalArea, 
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

export default function ScanWorkspacePage() {
  const router = useRouter();

  // Active Patient
  const [patientId, setPatientId] = useState<string>("PAT-10842");

  // Selected Preset or Upload
  const [selectedPreset, setSelectedPreset] = useState<ClinicalPresetCase>(CLINICAL_PRESETS[0]);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Calibration State
  const [lightingStatus, setLightingStatus] = useState<LightingStatus>("optimal");
  const [skewAngle, setSkewAngle] = useState(2.4);
  const [arucoDetected, setArucoDetected] = useState(true);
  const [luxLevel, setLuxLevel] = useState(450);

  // Custom adjustable RYB for testing
  const [redPct, setRedPct] = useState(selectedPreset.defaultRyb.red);
  const [yellowPct, setYellowPct] = useState(selectedPreset.defaultRyb.yellow);
  const [blackPct, setBlackPct] = useState(selectedPreset.defaultRyb.black);
  const [pinkPct, setPinkPct] = useState(selectedPreset.defaultRyb.pink);
  const [areaCm2, setAreaCm2] = useState(selectedPreset.baseAreaCm2);

  // Modals
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showHazardModal, setShowHazardModal] = useState(false);

  // Load Active Patient from LocalStorage
  useEffect(() => {
    const active = localStorage.getItem("LANT_ACTIVE_PATIENT_ID") || "PAT-10842";
    setPatientId(active);

    const handlePatientChange = (e: any) => {
      if (e.detail) setPatientId(e.detail);
    };
    window.addEventListener("LANT_PATIENT_CHANGED", handlePatientChange);
    return () => window.removeEventListener("LANT_PATIENT_CHANGED", handlePatientChange);
  }, []);

  // Update metrics when preset changes
  const handleSelectPreset = (preset: ClinicalPresetCase) => {
    setSelectedPreset(preset);
    setRedPct(preset.defaultRyb.red);
    setYellowPct(preset.defaultRyb.yellow);
    setBlackPct(preset.defaultRyb.black);
    setPinkPct(preset.defaultRyb.pink);
    setAreaCm2(preset.baseAreaCm2);
    setIsComplete(false);
  };

  // Run AI Vision Calibration Simulation
  const handleRunAiAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setIsComplete(true);
    }, 1200);
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

  // Handle Intake Survey Submission
  const handleSurveySubmit = (survey: SurveyData, woundTitle: string, anatomicalLocation: string) => {
    const woundId = `WND-${Math.floor(100000 + Math.random() * 900000)}`;
    const snapshotId = `SNP-${woundId.split("-")[1]}-01`;

    const newSnapshot: SnapshotLog = {
      id: snapshotId,
      woundId,
      timestamp: new Date().toISOString(),
      dayIndex: 0,
      imageUrl: selectedPreset.rawImage,
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
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar 
        onOpenReminderModal={() => setShowReminderModal(true)} 
        onOpenHazardModal={() => setShowHazardModal(true)} 
      />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-oceanic-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-oceanic-50 px-2.5 py-0.5 text-xs font-bold text-oceanic border border-oceanic-200">
                AI COMPUTER VISION WORKSPACE
              </span>
              <span className="text-xs font-mono text-slate-500">TASK 2.1 - 2.3</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-oceanic mt-1">
              Chụp, Hiệu Chuẩn Thước ArUco & Phân Đoạn RYB
            </h1>
            <p className="text-xs sm:text-sm text-dusk-600">
              Hệ thống tự động kiểm định góc nghiêng ống kính, độ sáng và quy đổi pixel sang diện tích thực tế (cm²)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowIntakeModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-oceanic text-xs font-bold text-white hover:bg-oceanic-800 shadow-md shadow-oceanic/20 transition-all"
            >
              <Sparkles className="h-4 w-4 text-azure-mist" />
              <span>Đăng Ký Khảo Sát Bệnh Án</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Main Grid: Left Viewport & Right Diagnostic Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Live Canvas & Perspective Quality Meters (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Live Perspective & Lighting Quality HUD */}
            <div className="grid grid-cols-3 gap-3">
              
              {/* Meter 1: ArUco Tag Lock */}
              <div className="rounded-xl border border-oceanic-100 bg-white p-3 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-600">Thước Chuẩn ArUco 2cm</span>
                  <span className={`h-2 w-2 rounded-full ${arucoDetected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-oceanic">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>{arucoDetected ? "Đã Khóa Mục Tiêu" : "Chưa Tìm Thấy"}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">120 px = 2.0 cm (1:60)</span>
              </div>

              {/* Meter 2: Skew Angle */}
              <div className="rounded-xl border border-oceanic-100 bg-white p-3 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-600">Góc Nghiêng Camera</span>
                  <span className={`h-2 w-2 rounded-full ${skewAngle <= 5 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-oceanic">
                  <Compass className="h-4 w-4 text-sapphire" />
                  <span>{skewAngle.toFixed(1)}° ({skewAngle <= 5 ? "Tối ưu < 5°" : "Hơi nghiêng"})</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Trực giao mặt phẳng</span>
              </div>

              {/* Meter 3: Lighting Lux */}
              <div className="rounded-xl border border-oceanic-100 bg-white p-3 shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-600">Ánh Sáng Lâm Sàng</span>
                  <span className={`h-2 w-2 rounded-full ${lightingStatus === "optimal" ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-oceanic">
                  <Sun className="h-4 w-4 text-amber-500" />
                  <span>{luxLevel} Lux (Chuẩn)</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Không phát hiện chói loá</span>
              </div>

            </div>

            {/* Main Interactive Wound Canvas */}
            <WoundCanvas
              rybMetrics={normalizedRyb}
              calibration={calibrationData}
              totalAreaCm2={areaCm2}
              whiScore={calculatedWHI}
              interactive={true}
            />

            {/* Run Analysis Action Bar */}
            <div className="rounded-xl border border-oceanic-100 bg-white p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-oceanic-50 text-oceanic">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-oceanic">Chụp Tức Thì & Phân Tích Lại</h4>
                  <p className="text-[11px] text-slate-500">Tái tính toán phân đoạn mô RYB theo pixel thực</p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleRunAiAnalysis}
                  disabled={isAnalyzing}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sapphire text-xs font-bold text-white hover:bg-sapphire-700 shadow-sm transition-all"
                >
                  <Sparkles className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzing ? "AI Đang Quét..." : "Phân Đoạn Tức Thì (Run AI)"}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Case Presets & Dynamic Parameter Tuning (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Case Presets Picker */}
            <div className="rounded-2xl border border-oceanic-100 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-oceanic" />
                  <h3 className="text-xs font-bold text-oceanic uppercase tracking-wider">
                    Bộ Dữ Liệu Ca Lâm Sàng Mẫu
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">4 Ca Thực Tế</span>
              </div>

              <div className="space-y-2">
                {CLINICAL_PRESETS.map((preset) => {
                  const isSelected = preset.id === selectedPreset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                        isSelected
                          ? "border-oceanic bg-oceanic-50/70 shadow-xs"
                          : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-oceanic">{preset.name}</span>
                        <span className="font-mono text-[11px] text-sapphire font-bold">
                          {preset.baseAreaCm2} cm²
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug line-clamp-1">
                        {preset.location} • {preset.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] font-semibold text-slate-600">
                        <span className="text-red-600">R:{preset.defaultRyb.red}%</span>
                        <span className="text-amber-600">Y:{preset.defaultRyb.yellow}%</span>
                        <span className="text-slate-800">B:{preset.defaultRyb.black}%</span>
                        <span className="text-pink-600">P:{preset.defaultRyb.pink}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Slider Tuning for Testing Medical Edge Cases */}
            <div className="rounded-2xl border border-oceanic-100 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-oceanic" />
                  <h3 className="text-xs font-bold text-oceanic uppercase tracking-wider">
                    Hiệu Chỉnh Tham Số RYB & cm²
                  </h3>
                </div>
                <span className="rounded bg-azure-mist px-1.5 py-0.5 text-[10px] font-bold text-oceanic">
                  SIMULATOR
                </span>
              </div>

              {/* Area Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Diện Tích Hiệu Chuẩn:</span>
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

              {/* Red Granulation Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-medical-granulation" />
                    Mô Hạt Đỏ (Granulation):
                  </span>
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

              {/* Yellow Slough Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-medical-slough" />
                    Mô Vảy Vàng (Slough / Bio-film):
                  </span>
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

              {/* Black Necrosis Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-950" />
                    Mô Hoại Tử Đen (Eschar Hazard):
                  </span>
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

              {/* Pink Epithelial Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-medical-epithelial" />
                    Biểu Mô Hóa Rìa Mép (Epithelial):
                  </span>
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

              {/* Live Hazard Alert Banner if threshold reached */}
              {hazard.status === "emergency_critical" && (
                <div className="rounded-xl border border-red-300 bg-red-50 p-3 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-800">
                    <AlertTriangle className="h-4 w-4 text-red-600 animate-bounce" />
                    <span>Kích Hoạt Ngưỡng Cảnh Báo Đỏ!</span>
                  </div>
                  <p className="text-[11px] text-red-700">
                    {hazard.reasons[0]}
                  </p>
                </div>
              )}

              {/* Bottom CTA to Open Intake */}
              <button
                onClick={() => setShowIntakeModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-oceanic text-xs font-bold text-white hover:bg-oceanic-800 shadow-md shadow-oceanic/20 transition-all"
              >
                <Sparkles className="h-4 w-4 text-azure-mist" />
                <span>Tiếp Tục Khảo Sát Bệnh Án & Lưu Vết Thương</span>
                <ArrowRight className="h-4 w-4" />
              </button>

            </div>

          </div>

        </div>

      </main>

      {/* INTAKE SURVEY MODAL */}
      <IntakeSurveyModal
        isOpen={showIntakeModal}
        onClose={() => setShowIntakeModal(false)}
        onSubmit={handleSurveySubmit}
        defaultTitle={selectedPreset.name}
        defaultLocation={selectedPreset.location}
        defaultEtiology={selectedPreset.etiology as any}
      />

      {/* REMINDER MODAL */}
      {showReminderModal && (
        <ReminderModal 
          patientId={patientId}
          onClose={() => setShowReminderModal(false)} 
        />
      )}

      {/* HAZARD MODAL */}
      {showHazardModal && (
        <HazardAlertModal 
          isOpen={showHazardModal}
          onClose={() => setShowHazardModal(false)}
          blackPercent={normalizedRyb.blackPercent}
          yellowPercent={normalizedRyb.yellowPercent}
          hazardReasons={hazard.reasons}
        />
      )}
    </div>
  );
}
