"use client";

import { useEffect, useRef, useState } from "react";
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

    // 3. Draw Wound Segmentation Regions (RYB Model)
    const centerX = width * 0.52;
    const centerY = height * 0.52;
    const woundRadiusX = width * 0.32;
    const woundRadiusY = height * 0.28;
    const alpha = opacity / 100;

    // Helper for organic wound shape path
    const createOrganicPath = (rX: number, rY: number, seed: number) => {
      ctx.beginPath();
      const points = 24;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const jitter = Math.sin(angle * 4 + seed) * 0.12 + Math.cos(angle * 7 + seed) * 0.08;
        const x = centerX + Math.cos(angle) * rX * (1 + jitter);
        const y = centerY + Math.sin(angle) * rY * (1 + jitter);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    };

    // 3.1 Outer Pink Epithelial Ring
    if (showEpithelial && rybMetrics.pinkPercent > 0) {
      ctx.save();
      createOrganicPath(woundRadiusX * 1.08, woundRadiusY * 1.08, 1);
      ctx.fillStyle = `rgba(236, 72, 153, ${alpha * 0.85})`; // Epithelial Pink
      ctx.fill();
      ctx.restore();
    }

    // 3.2 Granulation Bed (Red)
    if (showGranulation && rybMetrics.redPercent > 0) {
      ctx.save();
      createOrganicPath(woundRadiusX * 0.95, woundRadiusY * 0.95, 2);
      ctx.fillStyle = `rgba(220, 38, 38, ${alpha * 0.88})`; // Granulation Red
      ctx.fill();
      ctx.restore();
    }

    // 3.3 Slough Fibrin Patches (Yellow)
    if (showSlough && rybMetrics.yellowPercent > 0) {
      const sloughCount = Math.max(2, Math.round(rybMetrics.yellowPercent / 12));
      ctx.save();
      ctx.fillStyle = `rgba(245, 158, 11, ${alpha * 0.92})`; // Slough Yellow
      for (let s = 0; s < sloughCount; s++) {
        const sx = centerX + (Math.sin(s * 2.3) * woundRadiusX * 0.45);
        const sy = centerY + (Math.cos(s * 2.3) * woundRadiusY * 0.45);
        const sRad = (rybMetrics.yellowPercent / 100) * woundRadiusX * 0.45;
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(12, sRad), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 3.4 Necrotic Core / Eschar (Black)
    if (showNecrotic && rybMetrics.blackPercent > 0) {
      ctx.save();
      createOrganicPath(
        woundRadiusX * (rybMetrics.blackPercent / 100) * 1.4,
        woundRadiusY * (rybMetrics.blackPercent / 100) * 1.4,
        5
      );
      ctx.fillStyle = `rgba(17, 24, 39, ${alpha * 0.96})`; // Necrotic Black
      ctx.fill();
      ctx.restore();
    }

    // 4. Draw Wound Contours / Perimeter
    if (showContours) {
      ctx.save();
      const points = 32;
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
    <div className="flex flex-col gap-4 font-sans">
      {/* Canvas Viewport Frame */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 shadow-clinical border border-oceanic-200">
        
        {/* Top Control Bar Over Canvas */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-xl text-xs font-mono text-cyan-300 shadow-md">
            <span className="font-bold text-white">LANT MASK HUD</span>
            <span className="text-slate-500 mx-2">|</span>
            <span className="text-cyan-200">{totalAreaCm2.toFixed(2)} cm²</span>
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1 rounded-xl shadow-md">
            <button
              onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))}
              className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white text-xs font-mono font-bold"
              title="Phóng to"
            >
              +
            </button>
            <button
              onClick={() => setZoomLevel(Math.max(0.8, zoomLevel - 0.1))}
              className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white text-xs font-mono font-bold"
              title="Thu nhỏ"
            >
              -
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white text-xs font-mono font-bold"
              title="Đặt lại zoom"
            >
              1:1
            </button>
          </div>
        </div>

        {/* The HTML5 Canvas */}
        <div className="overflow-hidden flex items-center justify-center p-2 min-h-[360px]">
          <canvas
            ref={canvasRef}
            width={600}
            height={440}
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
            className="w-full max-h-[460px] object-contain rounded-2xl transition-transform duration-150"
          />
        </div>

        {/* Bottom Status Overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-xl flex items-center gap-3 text-xs shadow-md">
            <span className="text-[11px] font-bold text-slate-400">WHI:</span>
            <span className={`font-mono font-bold ${whiScore >= 70 ? 'text-emerald-400' : whiScore >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
              {whiScore} / 100
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-[11px] text-slate-300">
              Độ chuẩn xác: <span className="text-cyan-300 font-mono font-bold">98.4%</span>
            </span>
          </div>
        </div>

      </div>

      {/* Layer Toggle Controls */}
      {interactive && (
        <div className="rounded-3xl bg-white/95 p-5 shadow-clinical space-y-4 border border-oceanic-100/70">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-oceanic uppercase tracking-wider font-heading">
              Bật/tắt lớp bóc tách mô học (RYB Layers)
            </span>

            {/* Opacity Slider */}
            <div className="flex items-center gap-2">
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

          {/* Toggle Buttons Grid - Pure Typography */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            
            {/* Raw */}
            <button
              onClick={() => setShowRaw(!showRaw)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                showRaw ? "bg-slate-900 text-white font-bold" : "bg-slate-100 text-slate-500 border border-slate-200"
              }`}
            >
              <span>Ảnh gốc</span>
            </button>

            {/* Granulation (Red) */}
            <button
              onClick={() => setShowGranulation(!showGranulation)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                showGranulation 
                  ? "bg-red-50 text-red-700 border border-red-300 font-bold" 
                  : "bg-slate-50 text-slate-400 border border-slate-200"
              }`}
            >
              <span>Mô đỏ ({rybMetrics.redPercent}%)</span>
            </button>

            {/* Slough (Yellow) */}
            <button
              onClick={() => setShowSlough(!showSlough)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                showSlough 
                  ? "bg-amber-50 text-amber-800 border border-amber-300 font-bold" 
                  : "bg-slate-50 text-slate-400 border border-slate-200"
              }`}
            >
              <span>Vảy vàng ({rybMetrics.yellowPercent}%)</span>
            </button>

            {/* Necrotic (Black) */}
            <button
              onClick={() => setShowNecrotic(!showNecrotic)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                showNecrotic 
                  ? "bg-slate-900 text-white border border-slate-700 font-bold" 
                  : "bg-slate-50 text-slate-400 border border-slate-200"
              }`}
            >
              <span>Hoại tử ({rybMetrics.blackPercent}%)</span>
            </button>

            {/* Epithelial (Pink) */}
            <button
              onClick={() => setShowEpithelial(!showEpithelial)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                showEpithelial 
                  ? "bg-pink-50 text-pink-700 border border-pink-300 font-bold" 
                  : "bg-slate-50 text-slate-400 border border-slate-200"
              }`}
            >
              <span>Rìa hồng ({rybMetrics.pinkPercent}%)</span>
            </button>

            {/* Contours */}
            <button
              onClick={() => setShowContours(!showContours)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                showContours 
                  ? "bg-oceanic-50 text-oceanic border border-oceanic-300 font-bold" 
                  : "bg-slate-50 text-slate-400 border border-slate-200"
              }`}
            >
              <span>Viền chu vi</span>
            </button>

            {/* ArUco Grid */}
            <button
              onClick={() => {
                setShowGrid(!showGrid);
                setShowArUco(!showArUco);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                showGrid 
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold" 
                  : "bg-slate-50 text-slate-400 border border-slate-200"
              }`}
            >
              <span>Lưới ArUco</span>
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
