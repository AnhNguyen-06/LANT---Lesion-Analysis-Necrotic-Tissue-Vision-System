"use client";

interface HazardAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  blackPercent: number;
  yellowPercent: number;
  hazardReasons: string[];
}

export function HazardAlertModal({
  isOpen,
  onClose,
  blackPercent,
  yellowPercent,
  hazardReasons,
}: HazardAlertModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in font-sans">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-7 sm:p-8 shadow-2xl space-y-6 border border-red-200">
        
        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="rounded-full bg-red-100 text-red-700 px-3 py-0.5 text-[10px] font-bold font-mono">
              Cảnh báo nguy cơ đỏ
            </span>
            <h3 className="text-xl font-bold text-red-700 font-heading">
              Phát hiện nguy cơ hoại tử / nhiễm trùng nặng
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-mono font-bold text-slate-400 hover:text-slate-700 p-2"
          >
            Đóng
          </button>
        </div>

        {/* Warning Metrics Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-slate-900 text-white p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Mô hoại tử đen (Eschar)
            </span>
            <p className="text-2xl font-black font-mono text-red-400">{blackPercent}%</p>
            <p className="text-[10px] text-slate-300">Ngưỡng báo động: ≥ 10%</p>
          </div>

          <div className="rounded-2xl bg-amber-50 p-4 space-y-1 border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              Mô vảy vàng (Slough)
            </span>
            <p className="text-2xl font-black font-mono text-amber-700">{yellowPercent}%</p>
            <p className="text-[10px] text-amber-800">Ngưỡng nhiễm trùng: ≥ 35%</p>
          </div>
        </div>

        {/* Clinical Reasons */}
        <div className="rounded-2xl bg-red-50/70 p-5 space-y-2 border border-red-200">
          <h4 className="text-xs font-bold text-red-900 font-heading">
            Khuyến nghị xử trí khẩn cấp chuẩn y khoa:
          </h4>
          <ul className="space-y-1.5 text-xs text-red-800 leading-relaxed">
            {hazardReasons.map((reason, idx) => (
              <li key={idx}>
                • {reason}
              </li>
            ))}
            <li>
              • Cần được bác sĩ ngoại khoa thăm khám trực tiếp để chỉ định cắt lọc mô hoại tử (Surgical Debridement) hoặc cấy khuẩn đồ.
            </li>
          </ul>
        </div>

        {/* Action Direct Buttons */}
        <div className="space-y-2.5 pt-1">
          <a
            href="tel:115"
            className="w-full flex items-center justify-center py-3.5 rounded-2xl bg-red-600 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-all"
          >
            <span>Gọi cấp cứu 115 ngay lập tức</span>
          </a>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span>Tôi đã hiểu & đóng cảnh báo</span>
          </button>
        </div>

      </div>
    </div>
  );
}
