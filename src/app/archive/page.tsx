"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { 
  Archive, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  TrendingDown, 
  Award, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers
} from "lucide-react";
import { MockStorageService } from "@/lib/mock-storage";
import { Patient, WoundProfile } from "@/types/medical-schema";

export default function ArchivePage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [healedWounds, setHealedWounds] = useState<{ wound: WoundProfile; patient: Patient }[]>([]);
  const [selectedCase, setSelectedCase] = useState<{ wound: WoundProfile; patient: Patient } | null>(null);

  useEffect(() => {
    const list = MockStorageService.getPatients();
    setPatients(list);

    const healed: { wound: WoundProfile; patient: Patient }[] = [];
    list.forEach(p => {
      p.wounds.forEach(w => {
        if (w.status === "healed") {
          healed.push({ wound: w, patient: p });
        }
      });
    });

    setHealedWounds(healed);
    if (healed.length > 0) {
      setSelectedCase(healed[0]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-oceanic-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                HEALED CASES ARCHIVE
              </span>
              <span className="text-xs font-mono text-slate-500">TASK 4.1</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-oceanic mt-1">
              Kho Lưu Trữ Ca Đã Liền Hoàn Toàn & Dữ Liệu Lâm Sàng
            </h1>
            <p className="text-xs sm:text-sm text-dusk-600">
              Tổng hợp các ca đã đạt 100% tái tạo biểu mô (Epithelialization) hoặc diện tích $\le 0.1cm^2$
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-bold">
            <Award className="h-4 w-4 text-emerald-600" />
            <span>Đã Phục Hồi: {healedWounds.length} Ca Bệnh</span>
          </div>
        </div>

        {/* 3 Benchmark Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-oceanic-100 bg-white p-5 shadow-xs">
            <span className="text-xs font-bold text-dusk-500 uppercase tracking-wider">Thời Gian Liền Sẹo TB</span>
            <div className="text-3xl font-black text-oceanic mt-1 font-mono">
              28 <span className="text-sm font-semibold text-slate-400">Ngày</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Nhanh hơn 18% so với điều trị truyền thống
            </p>
          </div>

          <div className="rounded-2xl border border-oceanic-100 bg-white p-5 shadow-xs">
            <span className="text-xs font-bold text-dusk-500 uppercase tracking-wider">Tỷ Lệ Tái Phát Sau 60 Ngày</span>
            <div className="text-3xl font-black text-emerald-600 mt-1 font-mono">
              0.0 <span className="text-sm font-semibold text-slate-400">%</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Nhờ tuân thủ phác đồ đệm xốp và giải áp
            </p>
          </div>

          <div className="rounded-2xl border border-oceanic-100 bg-white p-5 shadow-xs">
            <span className="text-xs font-bold text-dusk-500 uppercase tracking-wider">Điểm WHI Trung Bình Kết Thúc</span>
            <div className="text-3xl font-black text-oceanic mt-1 font-mono">
              98.5 <span className="text-sm font-semibold text-slate-400">/ 100</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              Phục hồi cấu trúc tế bào biểu mô 100%
            </p>
          </div>
        </div>

        {/* Main Grid: Healed List & Detailed Before-After Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Healed Cases List (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold text-oceanic uppercase tracking-wider">
              Danh Sách Hồ Sơ Đã Khép Miệng
            </h3>

            {healedWounds.map(({ wound, patient }) => {
              const isSelected = selectedCase?.wound.id === wound.id;
              const firstSnap = wound.snapshots[0];
              const lastSnap = wound.snapshots[wound.snapshots.length - 1];

              return (
                <button
                  key={wound.id}
                  onClick={() => setSelectedCase({ wound, patient })}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? "border-oceanic bg-oceanic-50/80 shadow-sm ring-1 ring-oceanic"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-oceanic">{wound.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      100% ĐÃ LIỀN
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Bệnh nhân: <strong>{patient.fullName}</strong> ({patient.medicalRecordNumber})
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-t border-slate-100 pt-2 text-slate-700">
                    <div>Ban đầu: <strong className="text-red-600">{wound.baselineAreaCm2} cm²</strong></div>
                    <div>Hiện tại: <strong className="text-emerald-600">0.00 cm² (Liền)</strong></div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Deep Comparison Before & After (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {selectedCase ? (
              <div className="rounded-2xl border border-oceanic-100 bg-white p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-oceanic">{selectedCase.wound.title}</h3>
                    <p className="text-[11px] text-slate-500">
                      Bệnh nhân: {selectedCase.patient.fullName} • Vị trí: {selectedCase.wound.anatomicalLocation}
                    </p>
                  </div>
                  <span className="rounded bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                    CHỨNG NHẬN LIỀN SẸO
                  </span>
                </div>

                {/* Before & After Visual Split */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Day 0 (Before) */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Ngày 0 (Mới Tiếp Nhận)</span>
                      <span className="text-[10px] font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        {selectedCase.wound.baselineAreaCm2} cm²
                      </span>
                    </div>

                    <div className="aspect-[4/3] rounded-lg bg-slate-900 overflow-hidden flex items-center justify-center relative border border-slate-800">
                      <div className="w-28 h-20 rounded-[40%] bg-red-800 border-2 border-red-500/50 flex items-center justify-center">
                        <div className="w-12 h-10 rounded-full bg-amber-500/60 blur-[1px]" />
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] text-cyan-300 font-mono">
                        WHI: {selectedCase.wound.snapshots[0]?.whiScore || 50}/100
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-1">
                      <div>Mô đỏ: <strong>{selectedCase.wound.snapshots[0]?.rybMetrics.redPercent}%</strong></div>
                      <div>Vảy vàng: <strong>{selectedCase.wound.snapshots[0]?.rybMetrics.yellowPercent}%</strong></div>
                      <div>Cảm giác đau VAS: <strong>{selectedCase.wound.snapshots[0]?.survey.painScore}/10</strong></div>
                    </div>
                  </div>

                  {/* Final Day (After) */}
                  <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-950">Ngày 28 (Liền Hoàn Toàn)</span>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                        0.00 cm² (Khép miệng)
                      </span>
                    </div>

                    <div className="aspect-[4/3] rounded-lg bg-slate-900 overflow-hidden flex items-center justify-center relative border border-emerald-500/40">
                      <div className="w-24 h-16 rounded-[40%] bg-pink-300/30 border border-pink-400/40 flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] text-emerald-400 font-mono font-bold">
                        WHI: 100/100 (Tối Đa)
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-1">
                      <div>Biểu mô hóa: <strong className="text-pink-600">95%</strong></div>
                      <div>Hoại tử & Vảy vàng: <strong className="text-emerald-700">0% (Sạch)</strong></div>
                      <div>Cảm giác đau VAS: <strong className="text-emerald-700">0/10 (Hết đau)</strong></div>
                    </div>
                  </div>

                </div>

                {/* Clinical Closure Summary */}
                <div className="rounded-xl bg-azure-mist/60 border border-oceanic-200 p-4 text-xs text-dusk-700 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-oceanic">
                    <ShieldCheck className="h-4 w-4 text-sapphire" />
                    <span>Kết Luận Lâm Sàng Của Bác Sĩ Điều Trị:</span>
                  </div>
                  <p className="leading-relaxed">
                    Vết thương đã liền sẹo sinh lý hoàn toàn, lớp sừng bề mặt đã tái tạo vững chắc. Khuyến cáo bệnh nhân bôi kem dưỡng ẩm chống sẹo phì đại và tránh cọ xát cơ học trong 30 ngày tiếp theo.
                  </p>
                </div>

              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-dashed border-slate-200">
                Chưa chọn ca bệnh để xem chi tiết.
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
