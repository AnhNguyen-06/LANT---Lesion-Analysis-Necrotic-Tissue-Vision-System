"use client";

import { useState } from "react";
import { DressingRecommendation, RYBMetrics } from "@/types/medical-schema";

interface DressingRecommenderProps {
  recommendation: DressingRecommendation;
  rybMetrics: RYBMetrics;
}

export function DressingRecommender({ recommendation, rybMetrics }: DressingRecommenderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-3xl bg-white/95 p-7 shadow-clinical space-y-5 font-sans border border-oceanic-100/70">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-oceanic font-heading">
            Hệ thống đề xuất băng gạc lâm sàng <span className="font-editorial italic font-normal text-sapphire">(CDSS)</span>
          </h3>
          <p className="text-[11px] text-dusk-500">
            Phác đồ tương thích theo tiêu chuẩn EWMA & WUWHS
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800 border border-emerald-200 uppercase font-mono self-start sm:self-auto">
          Phác đồ chuẩn y khoa
        </span>
      </div>

      {/* Primary & Secondary Dressing Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Primary Dressing */}
        <div className="rounded-2xl bg-azure-mist/50 p-5 space-y-2 border border-oceanic-100/70">
          <span className="text-xs font-bold text-oceanic font-heading block">
            Gạc tiếp xúc trực tiếp (Primary)
          </span>
          <h4 className="text-sm font-bold text-oceanic font-heading">
            {recommendation.primaryDressing}
          </h4>
          <p className="text-xs text-dusk-600 leading-relaxed font-sans">
            {recommendation.clinicalRationale}
          </p>
        </div>

        {/* Secondary Dressing & Frequency */}
        <div className="rounded-2xl bg-slate-50/70 p-5 space-y-2 border border-slate-100">
          <span className="text-xs font-bold text-slate-700 font-heading block">
            Gạc phụ & tần suất thay
          </span>
          <h4 className="text-sm font-bold text-slate-800 font-heading">
            {recommendation.secondaryDressing}
          </h4>
          <p className="text-xs text-slate-600 font-medium pt-1">
            Tần suất khuyến nghị: <strong className="text-oceanic font-bold">{recommendation.changeFrequency}</strong>
          </p>
        </div>

      </div>

      {/* Progressive Disclosure Toggle Button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-oceanic-50/70 hover:bg-oceanic-50 text-xs font-bold text-oceanic transition-colors border border-oceanic-100"
        >
          <span>{isExpanded ? "Thu gọn quy trình rửa vết thương" : "Xem chi tiết quy trình 4 bước rửa vết thương & thuốc đề xuất"}</span>
          <span className="text-xs font-mono">{isExpanded ? "▲" : "▼"}</span>
        </button>
      </div>

      {/* Expanded Clinical Protocols */}
      {isExpanded && (
        <div className="space-y-4 pt-2 animate-in fade-in duration-200">
          
          {/* Cleaning Protocol */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-oceanic font-heading">
              Quy trình 4 bước vệ sinh & thay băng tại nhà:
            </h5>
            <ol className="space-y-1.5 pl-4 text-xs text-slate-700 list-decimal">
              {recommendation.cleaningProtocol.map((step, idx) => (
                <li key={idx} className="leading-relaxed">
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Warning Notices */}
          <div className="rounded-2xl bg-red-50/70 p-4 space-y-1.5 border border-red-200">
            <h5 className="text-xs font-bold text-red-800 font-heading">
              Lưu ý an toàn quan trọng:
            </h5>
            <ul className="space-y-1 pl-4 text-xs text-red-700 list-disc">
              {recommendation.warningNotices.map((notice, idx) => (
                <li key={idx} className="leading-relaxed font-medium">
                  {notice}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended OTC Brands */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <span className="text-xs font-bold text-slate-600 font-heading block">
              Sản phẩm tham khảo trên thị trường:
            </span>
            <div className="flex flex-wrap gap-2">
              {recommendation.otcProducts.map((prod, idx) => (
                <span
                  key={idx}
                  className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 font-mono"
                >
                  {prod}
                </span>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
