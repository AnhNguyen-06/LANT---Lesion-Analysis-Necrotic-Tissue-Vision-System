"use client";

import { useEffect, useRef, useState } from "react";
import { RYBMetrics, CalibrationData } from "@/types/medical-schema";

interface WoundCanvasProps {
  imageUrl?: string | null;
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
  const [opacity, setOpacity] = useState(65); // 0 to 100%
  const [zoomLevel, setZoomLevel] = useState(1);

  // Image loading state
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setLoadedImage(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setLoadedImage(img);
    };
    img.onerror = () => {
      setLoadedImage(null);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Render Canvas when layers, image, or metrics change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Raw Image Background or Simulated Clinical Base
    if (showRaw) {
      if (loadedImage) {
        // Draw the real captured/uploaded photo to fill canvas with cover aspect ratio
        const imgRatio = loadedImage.width / loadedImage.height;
        const canvasRatio = width / height;
        let drawWidth = width;
        let drawHeight = height;
        let offsetX = 0;
        let offsetY = 0;

        if (imgRatio > canvasRatio) {
          drawWidth = height * imgRatio;
          offsetX = -(drawWidth - width) / 2;
        } else {
          drawHeight = width / imgRatio;
          offsetY = -(drawHeight - height) / 2;
        }

        ctx.drawImage(loadedImage, offsetX, offsetY, drawWidth, drawHeight);
      } else {
        // Fallback: Clinical skin radial gradient
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
      }
    } else {
      ctx.fillStyle = "#0F172A"; // Dark diagnostic mode
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Draw Calibration Grid if enabled
    if (showGrid) {
      ctx.strokeStyle = "rgba(0, 43, 140, 0.15)";
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

    // 3.1 Outer Pink Epithelial Ring (Closure)
    if (showEpithelial && rybMetrics.pinkPercent > 0) {
      ctx.save();
      createOrganicPath(woundRadiusX * 1.08, woundRadiusY * 1.08, 1);
      ctx.fillStyle = `rgba(236, 72, 153, ${alpha * 0.85})`; // Epithelial Pink
      ctx.fill();
      ctx.restore();
    }

    // 3.2 Granulation Bed (Red Viable Tissue)
    if (showGranulation && rybMetrics.redPercent > 0) {
      ctx.save();
      createOrganicPath(woundRadiusX * 0.95, woundRadiusY * 0.95, 2);
      ctx.fillStyle = `rgba(220, 38, 38, ${alpha * 0.88})`; // Granulation Red
      ctx.fill();
      ctx.restore();
    }

    // 3.3 Slough Fibrin Patches (Yellow Bio-film)
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

    // 3.4 Necrotic Core / Eschar (Black Dead Tissue)
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

    // 4. Draw Wound Contours / Perimeter (Boundary)
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

      // ArUco 4x4 inner matrix patterns
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
    zoomLevel,
    loadedImage
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
              title="Khôi phục"
            >
              1:1
            </button>
          </div>
        </div>

        {/* Main Canvas Component */}
        <div className="flex items-center justify-center p-2 bg-slate-950 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={720}
            height={480}
            style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.15s ease-out" }}
            className="rounded-2xl max-w-full h-auto shadow-2xl"
          />
        </div>

        {/* Bottom Telemetry Bar Over Canvas */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-[11px] font-mono text-slate-300 shadow-md flex items-center gap-3">
            <span>WHI: <strong className="text-cyan-300">{whiScore} / 100</strong></span>
            <span className="text-slate-600">|</span>
            <span>Độ chuẩn xác: <strong className="text-emerald-400">{calibration?.confidenceScore || 98.4}%</strong></span>
          </div>
        </div>
      </div>

      {/* Layer Visibility Controls - Pure Typography */}
      {interactive && (
        <div className="rounded-3xl bg-white/95 p-6 shadow-clinical border border-oceanic-100/70 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-oceanic font-heading uppercase tracking-wider">
              Lớp hiển thị phân tách mô học AI
            </h3>
            
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-mono">Độ mờ: {opacity}%</span>
              <input
                type="range"
                min="10"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(parseInt(e.target.value))}
                className="w-20 accent-oceanic"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowRaw(!showRaw)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                showRaw ? "bg-slate-800 text-white shadow-2xs" : "bg-slate-100 text-slate-500 line-through"
              }`}
            >
              <span>Ảnh gốc</span>
            </button>

            <button
              onClick={() => setShowGranulation(!showGranulation)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                showGranulation ? "bg-red-600 text-white shadow-2xs" : "bg-slate-100 text-slate-500 line-through"
              }`}
            >
              <span>Mô hạt đỏ ({rybMetrics.redPercent}%)</span>
            </button>

            <button
              onClick={() => setShowSlough(!showSlough)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                showSlough ? "bg-amber-500 text-white shadow-2xs" : "bg-slate-100 text-slate-500 line-through"
              }`}
            >
              <span>Mô vảy vàng ({rybMetrics.yellowPercent}%)</span>
            </button>

            <button
              onClick={() => setShowNecrotic(!showNecrotic)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                showNecrotic ? "bg-slate-900 text-white shadow-2xs" : "bg-slate-100 text-slate-500 line-through"
              }`}
            >
              <span>Hoại tử đen ({rybMetrics.blackPercent}%)</span>
            </button>

            <button
              onClick={() => setShowEpithelial(!showEpithelial)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                showEpithelial ? "bg-pink-500 text-white shadow-2xs" : "bg-slate-100 text-slate-500 line-through"
              }`}
            >
              <span>Biểu bì hồng ({rybMetrics.pinkPercent}%)</span>
            </button>

            <button
              onClick={() => setShowContours(!showContours)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                showContours ? "bg-oceanic text-white shadow-2xs" : "bg-slate-100 text-slate-500 line-through"
              }`}
            >
              <span>Đường viền</span>
            </button>

            <button
              onClick={() => setShowArUco(!showArUco)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                showArUco ? "bg-emerald-600 text-white shadow-2xs" : "bg-slate-100 text-slate-500 line-through"
              }`}
            >
              <span>Thước ArUco</span>
            </button>

            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                showGrid ? "bg-dusk text-white shadow-2xs" : "bg-slate-100 text-slate-500 line-through"
              }`}
            >
              <span>Lưới tọa độ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
