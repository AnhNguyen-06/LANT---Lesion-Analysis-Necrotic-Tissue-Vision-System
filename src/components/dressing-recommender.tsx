"use client";

import { 
  DressingRecommendation, 
  RYBMetrics 
} from "@/types/medical-schema";
import { 
  Sparkles, 
  Bandage, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShoppingBag, 
  HelpCircle,
  FileText
} from "lucide-react";

interface DressingRecommenderProps {
  recommendation: DressingRecommendation;
  rybMetrics: RYBMetrics;
}

export function DressingRecommender({
  recommendation,
  rybMetrics
}: DressingRecommenderProps) {
  // Determine dominant tissue type
  const dominant = rybMetrics.blackPercent >= 10
    ? "necrotic"
    : rybMetrics.yellowPercent >= 30
    ? "slough"
    : rybMetrics.redPercent >= 50
    ? "granulation"
    : "epithelial";

  return (
    <div className="rounded-2xl border border-oceanic-100 bg-white p-5 shadow-sm space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-oceanic text-white shadow-sm">
            <Bandage className="h-5 w-5 text-azure-mist" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-oceanic">Phác Đồ Băng Gạc & Chăm Sóc Tại Gia</h3>
              <span className="rounded bg-azure-mist px-2 py-0.5 text-[10px] font-bold text-oceanic-800 border border-oceanic-200">
                EWMA PROTOCOL
              </span>
            </div>
            <p className="text-[11px] text-dusk-500">Khuyến nghị tự động tối ưu hóa theo mô học RYB hiện tại</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700">
          <Clock className="h-3.5 w-3.5 text-sapphire" />
          <span>Tần suất: <strong className="text-oceanic">{recommendation.changeFrequency}</strong></span>
        </div>
      </div>

      {/* Primary & Secondary Dressing Hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Primary Dressing */}
        <div className="rounded-xl border-2 border-oceanic-200 bg-oceanic-50/50 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-oceanic-700 bg-white px-2 py-0.5 rounded border border-oceanic-200">
              Băng Tiếp Xúc Trực Tiếp (Primary)
            </span>
            <span className="flex h-2 w-2 rounded-full bg-oceanic" />
          </div>
          <h4 className="text-sm font-bold text-oceanic-900 leading-snug">
            {recommendation.primaryDressing}
          </h4>
          <p className="text-xs text-dusk-700 mt-2 leading-relaxed">
            {recommendation.clinicalRationale}
          </p>
        </div>

        {/* Secondary Dressing */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
              Băng Phụ Bảo Vệ Bên Ngoài (Secondary)
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 leading-snug">
            {recommendation.secondaryDressing}
          </h4>
          <div className="mt-3">
            <p className="text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <ShoppingBag className="h-3.5 w-3.5 text-sapphire" />
              Sản phẩm y tế khuyên dùng tại hiệu thuốc:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {recommendation.otcProducts.map((p, i) => (
                <span key={i} className="rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-oceanic-800 border border-oceanic-100 shadow-2xs">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Cleaning Protocol Steps */}
      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Quy Trình 4 Bước Vệ Sinh & Thay Băng Đúng Chuẩn Y Khoa
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {recommendation.cleaningProtocol.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200 text-xs text-slate-700">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-oceanic-100 text-[10px] font-bold text-oceanic">
                {idx + 1}
              </span>
              <span className="leading-snug">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Warning Notices */}
      {recommendation.warningNotices && recommendation.warningNotices.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-amber-900">Lưu Ý Cảnh Báo An Toàn:</h5>
            <ul className="list-disc pl-4 text-xs text-amber-800 space-y-0.5">
              {recommendation.warningNotices.map((warn, i) => (
                <li key={i}>{warn}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

    </div>
  );
}
