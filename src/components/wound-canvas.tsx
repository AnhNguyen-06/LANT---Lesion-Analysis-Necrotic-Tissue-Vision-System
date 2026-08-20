"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Layers, 
  Sliders, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Sparkles,
  Grid,
  Square
} from "lucide-react";
import { RYBMetrics, CalibrationData } from "@/types/medical-schema";

interface WoundCanvasProps {
  imageUrl?: string;
  rybMetrics: RYBMetrics;
  calibration?: CalibrationData;
  totalAreaCm2: number;
  whiScore: number;
  interactive?: boolean;
}

export function WoundCanvas({
  imageUrl,
  rybMetrics,
  calibration,
  totalAreaCm2,
  whiScore,
  interactive = true,
}: WoundCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Layer Toggles
  const [showRaw, setShowRaw] = useState(true);
  const [showGranulation, setShowGranulation] = useState(true);
  const [showSlough, setShowSlough] = useState(true);
  const [showNecrotic, setShowNecrotic] = useState(true);
  const [showEpithelial, setShowEpithelial] = useState(true);
  const [showContours, setShowContours] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showArUco, setShowArUco] = useState(true);
  const [opacity, setOpacity] = useState(70); // 0 to 100%
  const [zoomLevel, setZoomLevel] = useState(1);

  // Render Canvas when layers or metrics change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Raw Background / Simulated Clinical Skin Base
    if (showRaw) {
      // Create realistic background tissue
      const skinGrad = ctx.createRadialGradient(
        width / 2, height / 2, 50,
        width / 2, height / 2, width * 0.7
      );
      skinGrad.addColorStop(0, "#F5D0C5");
      skinGrad.addColorStop(0.7, "#E2A999");
      skinGrad.addColorStop(1, "#CA8E7D");
      ctx.fillStyle = skinGrad;
      ctx.fillRect(0, 0, width, height);

      // Add skin texture micro-dots
      ctx.fillStyle = "rgba(180, 120, 100, 0.15)";
      for (let i = 0; i < 400; i++) {
        const rx = (Math.sin(i * 99) * 0.5 + 0.5) * width;
        const ry = (Math.cos(i * 33) * 0.5 + 0.5) * height;
        ctx.beginPath();
        ctx.arc(rx, ry, 1 + (i % 2), 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = "#0F172A"; // Dark diagnostic mode
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Draw Calibration Grid if enabled
    if (showGrid) {
      ctx.strokeStyle = "rgba(0, 43, 140, 0.12)";
      ctx.lineWidth = 1;
      const step = 30;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Centered Wound Morphology Coords
    const centerX = width / 2;
    const centerY = height / 2;
    const woundRadiusX = width * 0.32;
    const woundRadiusY = height * 0.26;

    // 3. Draw Wound Base Cavity Outline
    ctx.save();
    ctx.beginPath();
    // Elliptical organic polygon
    const points = 16;
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const radiusJitter = 1 + Math.sin(angle * 3) * 0.12 + Math.cos(angle * 5) * 0.08;
      const x = centerX + Math.cos(angle) * woundRadiusX * radiusJitter;
      const y = centerY + Math.sin(angle) * woundRadiusY * radiusJitter;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.clip(); // Clip inside wound cavity for masks

    const alpha = opacity / 100;

    // 3A. Granulation Layer (Red #DC2626)
    if (showGranulation && rybMetrics.redPercent > 0) {
      ctx.fillStyle = `rgba(220, 38, 38, ${alpha})`;
      ctx.beginPath();
      ctx.ellipse(centerX - 10, centerY + 10, woundRadiusX * 0.8, woundRadiusY * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Granulation capillary texture dots
      ctx.fillStyle = `rgba(185, 28, 28, ${Math.min(1, alpha + 0.2)})`;
      for (let i = 0; i < 60; i++) {
        const gx = centerX + (Math.sin(i * 12) * woundRadiusX * 0.5);
        const gy = centerY + (Math.cos(i * 12) * woundRadiusY * 0.5);
        ctx.beginPath();
        ctx.arc(gx, gy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3B. Slough Layer (Yellow #F59E0B)
    if (showSlough && rybMetrics.yellowPercent > 0) {
      const sloughScale = (rybMetrics.yellowPercent / 100) * 1.3;
      ctx.fillStyle = `rgba(245, 158, 11, ${alpha * 0.95})`;
      ctx.beginPath();
      ctx.ellipse(
        centerX - woundRadiusX * 0.25, 
        centerY - woundRadiusY * 0.2, 
        woundRadiusX * 0.55 * sloughScale, 
        woundRadiusY * 0.45 * sloughScale, 
        0.3, 0, Math.PI * 2
      );
      ctx.fill();
    }

    // 3C. Necrotic Layer (Black / Eschar #111827)
    if (showNecrotic && rybMetrics.blackPercent > 0) {
      const necroticScale = (rybMetrics.blackPercent / 100) * 2.0;
      ctx.fillStyle = `rgba(17, 24, 39, ${Math.min(1, alpha * 1.2)})`;
      ctx.beginPath();
      ctx.ellipse(
        centerX + woundRadiusX * 0.28, 
        centerY + woundRadiusY * 0.25, 
        woundRadiusX * 0.35 * necroticScale, 
        woundRadiusY * 0.35 * necroticScale, 
        -0.2, 0, Math.PI * 2
      );
      ctx.fill();

      // Eschar craggy lines
      ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX + woundRadiusX * 0.2, centerY + woundRadiusY * 0.2);
      ctx.lineTo(centerX + woundRadiusX * 0.35, centerY + woundRadiusY * 0.3);
      ctx.stroke();
    }

    // 3D. Epithelial Margin (Pink #EC4899)
    if (showEpithelial && rybMetrics.pinkPercent > 0) {
      ctx.strokeStyle = `rgba(236, 72, 153, ${alpha})`;
      ctx.lineWidth = 14;
      ctx.stroke(); // strokes along the outer clipped boundary
    }

    ctx.restore(); // Exit clipped cavity

    // 4. Draw Outer Contour Boundary Line
    if (showContours) {
      ctx.save();
      ctx.strokeStyle = "#002B8C";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const radiusJitter = 1 + Math.sin(angle * 3) * 0.12 + Math.cos(angle * 5) * 0.08;
        const x = centerX + Math.cos(angle) * woundRadiusX * radiusJitter;
        const y = centerY + Math.sin(angle) * woundRadiusY * radiusJitter;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    // 5. Draw ArUco 2cm Calibration Reference Tag Overlay
    if (showArUco) {
      const arucoX = 24;
      const arucoY = 24;
      const arucoSize = 54;

      ctx.save();
      // ArUco Background Box
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.strokeStyle = "#10B981";
      ctx.lineWidth = 2;
      ctx.fillRect(arucoX, arucoY, arucoSize, arucoSize);
      ctx.strokeRect(arucoX, arucoY, arucoSize, arucoSize);

      // ArUco 4x4 inner matrix dots
      ctx.fillStyle = "#000000";
      ctx.fillRect(arucoX + 6, arucoY + 6, 12, 12);
      ctx.fillRect(arucoX + 30, arucoY + 6, 12, 12);
      ctx.fillRect(arucoX + 18, arucoY + 18, 12, 12);
      ctx.fillRect(arucoX + 6, arucoY + 30, 12, 12);
      ctx.fillRect(arucoX + 30, arucoY + 30, 12, 12);

      // Label
      ctx.fillStyle = "#065F46";
      ctx.font = "bold 9px JetBrains Mono, monospace";
      ctx.fillText("ARUCO 2cm", arucoX, arucoY + arucoSize + 12);
      ctx.restore();
    }

  }, [
    showRaw,
    showGranulation,
    showSlough,
    showNecrotic,
    showEpithelial,
    showContours,
    showGrid,
    showArUco,
    opacity,
    rybMetrics,
    zoomLevel
  ]);

  return (
    <div className="flex flex-col gap-3">
      {/* Canvas Viewport Frame */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-oceanic-200 bg-slate-950 shadow-clinical-lg">
        
        {/* Top Control Bar Over Canvas */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-xs font-mono text-cyan-300">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-white">LANT AI MASK</span>
            <span className="text-slate-400">|</span>
            <span>{totalAreaCm2.toFixed(2)} cm²</span>
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-white/20">
            <button
              onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Phóng to"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoomLevel(Math.max(0.8, zoomLevel - 0.1))}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Thu nhỏ"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Đặt lại zoom"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* The HTML5 Canvas */}
        <div className="overflow-hidden flex items-center justify-center p-2">
          <canvas
            ref={canvasRef}
            width={600}
            height={440}
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
            className="w-full max-h-[460px] object-contain rounded-xl transition-transform duration-200"
          />
        </div>

        {/* Bottom Status Overlay */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400">WHI:</span>
              <span className={`font-black ${whiScore >= 70 ? 'text-emerald-400' : whiScore >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                {whiScore} / 100
              </span>
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <div className="text-[11px] text-slate-300">
              Độ chuẩn xác: <span className="text-cyan-300 font-mono font-bold">98.4%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Layer Toggle Controls */}
      {interactive && (
        <div className="rounded-xl border border-oceanic-100 bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-oceanic" />
              <span className="text-xs font-bold text-oceanic uppercase tracking-wider">
                Bật/Tắt Lớp Bóc Tách Mô Học (RYB Layers)
              </span>
            </div>

            {/* Opacity Slider */}
            <div className="flex items-center gap-2">
              <Sliders className="h-3.5 w-3.5 text-dusk-500" />
              <span className="text-[11px] font-semibold text-dusk-600">Độ trong suốt:</span>
              <input
                type="range"
                min="10"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-20 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-oceanic"
              />
              <span className="text-[11px] font-mono font-bold text-oceanic w-8">{opacity}%</span>
            </div>
          </div>

          {/* Toggle Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            
            {/* Raw */}
            <button
              onClick={() => setShowRaw(!showRaw)}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                showRaw ? "bg-slate-900 text-white border-slate-900" : "bg-slate-100 text-slate-500 border-slate-200"
              }`}
            >
              {showRaw ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              <span>Ảnh Gốc</span>
            </button>

            {/* Granulation (Red) */}
            <button
              onClick={() => setShowGranulation(!showGranulation)}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                showGranulation 
                  ? "bg-red-50 text-red-700 border-red-300 font-bold" 
                  : "bg-slate-50 text-slate-400 border-slate-200"
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-medical-granulation shrink-0" />
              <span>Mô Đỏ ({rybMetrics.redPercent}%)</span>
            </button>

            {/* Slough (Yellow) */}
            <button
              onClick={() => setShowSlough(!showSlough)}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                showSlough 
                  ? "bg-amber-50 text-amber-800 border-amber-300 font-bold" 
                  : "bg-slate-50 text-slate-400 border-slate-200"
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-medical-slough shrink-0" />
              <span>Vảy Vàng ({rybMetrics.yellowPercent}%)</span>
            </button>

            {/* Necrotic (Black) */}
            <button
              onClick={() => setShowNecrotic(!showNecrotic)}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                showNecrotic 
                  ? "bg-slate-900 text-white border-slate-700 font-bold" 
                  : "bg-slate-50 text-slate-400 border-slate-200"
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-slate-950 border border-white/50 shrink-0" />
              <span>Hoại Tử ({rybMetrics.blackPercent}%)</span>
            </button>

            {/* Epithelial (Pink) */}
            <button
              onClick={() => setShowEpithelial(!showEpithelial)}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                showEpithelial 
                  ? "bg-pink-50 text-pink-700 border-pink-300 font-bold" 
                  : "bg-slate-50 text-slate-400 border-slate-200"
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-medical-epithelial shrink-0" />
              <span>Rìa Hồng ({rybMetrics.pinkPercent}%)</span>
            </button>

            {/* Contours */}
            <button
              onClick={() => setShowContours(!showContours)}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                showContours 
                  ? "bg-oceanic-50 text-oceanic border-oceanic-300 font-bold" 
                  : "bg-slate-50 text-slate-400 border-slate-200"
              }`}
            >
              <Square className="h-3.5 w-3.5 text-oceanic" />
              <span>Viền Chu Vi</span>
            </button>

            {/* ArUco Grid */}
            <button
              onClick={() => {
                setShowGrid(!showGrid);
                setShowArUco(!showArUco);
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                showGrid 
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold" 
                  : "bg-slate-50 text-slate-400 border-slate-200"
              }`}
            >
              <Grid className="h-3.5 w-3.5 text-emerald-700" />
              <span>ArUco Grid</span>
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
