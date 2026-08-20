"use client";

import { 
  AlertOctagon, 
  PhoneCall, 
  Hospital, 
  ShieldAlert, 
  X, 
  Stethoscope, 
  ArrowRight,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";

interface HazardAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  blackPercent: number;
  yellowPercent: number;
  hazardReasons: string[];
  patientName?: string;
  woundTitle?: string;
}

export function HazardAlertModal({
  isOpen,
  onClose,
  blackPercent,
  yellowPercent,
  hazardReasons,
  patientName = "Nguyễn Văn An",
  woundTitle = "Loét Vùng Chi / Tì Đè"
}: HazardAlertModalProps) {
  if (!isOpen) return null;

  const isSevereBlack = blackPercent >= 10;
  const isSevereYellow = yellowPercent >= 35;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border-2 border-red-500/80 bg-white p-6 sm:p-8 shadow-hazard animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Emergency Alert Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-500/30 animate-pulse">
            <AlertOctagon className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-red-100 px-2.5 py-0.5 text-xs font-black text-red-700 uppercase tracking-wider border border-red-300">
                CẢNH BÁO NGUY HIỂM CẤP ĐỘ ĐỎ
              </span>
              <span className="text-xs font-mono text-slate-500">TRIAGE-CODE: RED-HAZARD</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Phát Hiện Nguy Cơ Hoại Tử & Nhiễm Trùng Vượt Ngưỡng
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Bệnh nhân: <span className="font-bold text-slate-800">{patientName}</span> • Vết thương: <span className="font-semibold text-slate-800">{woundTitle}</span>
            </p>
          </div>
        </div>

        {/* Real-time Metric Indicators */}
        <div className="grid grid-cols-2 gap-3 my-6">
          <div className={`p-4 rounded-xl border ${isSevereBlack ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Mô Hoại Tử Đen (Eschar)</span>
              <span className="text-[10px] font-semibold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">Ngưỡng: &lt;10%</span>
            </div>
            <div className="text-2xl font-black text-slate-950 mt-1">
              {blackPercent.toFixed(1)}%
            </div>
            <p className="text-[11px] text-red-700 mt-1 font-medium">
              {isSevereBlack ? "⚠️ Vượt ngưỡng nguy cơ hoại tử tế bào chết lan tỏa." : "Trong giới hạn an toàn."}
            </p>
          </div>

          <div className={`p-4 rounded-xl border ${isSevereYellow ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Mô Vảy Vàng (Slough)</span>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">Ngưỡng: &lt;35%</span>
            </div>
            <div className="text-2xl font-black text-amber-700 mt-1">
              {yellowPercent.toFixed(1)}%
            </div>
            <p className="text-[11px] text-amber-800 mt-1 font-medium">
              {isSevereYellow ? "⚠️ Dịch tiết sinh mủ & màng biofilm dày đặc." : "Trong mức kiểm soát."}
            </p>
          </div>
        </div>

        {/* Clinical Explanations */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 mb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <ShieldAlert className="h-4 w-4 text-red-600" />
            <span>Khuyến Nghị Xử Trí Khẩn Cấp Từ Hệ Thống</span>
          </div>
          <ul className="space-y-1.5 pl-5 list-disc text-xs text-slate-700 leading-relaxed">
            {hazardReasons.map((reason, idx) => (
              <li key={idx} className="font-medium text-red-900">{reason}</li>
            ))}
            <li>KHÔNG tự ý dùng vật nhọn hoặc kéo chưa vô trùng để cắt bóc lớp da đen.</li>
            <li>Giữ vết thương khô thoáng, dùng băng Hydrogel hoặc Alginate bạc tạm thời và đến cơ sở y tế gần nhất để Bác sĩ ngoại khoa cắt lọc (Surgical Debridement).</li>
          </ul>
        </div>

        {/* Emergency Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="tel:115"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-red-600/30 hover:bg-red-700 transition-colors"
          >
            <PhoneCall className="h-4 w-4 animate-bounce" />
            <span>Gọi Cấp Cứu 115 Ngay</span>
          </a>

          <Link
            href="/clinician"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-oceanic px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-oceanic/30 hover:bg-oceanic-800 transition-colors"
          >
            <Stethoscope className="h-4 w-4" />
            <span>Chuyển Hồ Sơ Bác Sĩ Hội Chẩn</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
