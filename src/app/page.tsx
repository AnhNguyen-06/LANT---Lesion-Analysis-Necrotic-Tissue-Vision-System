"use client";

import Link from "next/link";
import { 
  Activity, 
  Camera, 
  Stethoscope, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  TrendingUp, 
  HeartPulse, 
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  Lock,
  Cpu
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useState } from "react";
import { ReminderModal } from "@/components/reminder-modal";
import { HazardAlertModal } from "@/components/hazard-alert";

export default function LandingPage() {
  const [showReminder, setShowReminder] = useState(false);
  const [showHazard, setShowHazard] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar 
        onOpenReminderModal={() => setShowReminder(true)} 
        onOpenHazardModal={() => setShowHazard(true)} 
      />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-oceanic-50/70 via-azure-mist/40 to-white py-16 lg:py-24 border-b border-oceanic-100">
          {/* Subtle medical grid background */}
          <div className="absolute inset-0 bg-calibration-grid opacity-60 pointer-events-none" />
          
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Mission & Main CTA */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-oceanic-200 bg-white/80 px-3.5 py-1.5 shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-sapphire animate-ping" />
                  <span className="text-xs font-bold text-oceanic-800 tracking-wide uppercase">
                    LANT MEDICAL COMPUTER VISION • GEMINI 3.7 AGENTIC
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-oceanic leading-tight">
                  Thị Giác Y Khoa Tự Động Phân Tích & Giám Sát Vết Thương Hở
                </h1>

                <p className="text-base sm:text-lg text-dusk-600 leading-relaxed max-w-2xl">
                  Chuẩn hóa quy trình đo đạc diện tích thực tế (<span className="font-semibold text-oceanic">cm²</span>), 
                  tự động bóc tách thành phần mô <span className="font-bold text-medical-granulation">Đỏ</span> / <span className="font-bold text-amber-600">Vàng</span> / <span className="font-bold text-slate-900">Đen</span> / <span className="font-bold text-pink-600">Hồng</span>, 
                  tính toán chỉ số lành thương <span className="font-semibold text-oceanic">WHI</span> và kết nối Bác sĩ chuyên khoa qua Telehealth tức thì.
                </p>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/scan"
                    className="inline-flex items-center gap-2.5 rounded-xl bg-oceanic px-6 py-3.5 text-sm font-bold text-white shadow-clinical hover:bg-oceanic-800 hover:shadow-clinical-lg transition-all duration-200 group"
                  >
                    <Camera className="h-5 w-5 text-azure-mist group-hover:scale-110 transition-transform" />
                    <span>Quét & Đo Vết Thương Ngay</span>
                    <ArrowRight className="h-4 w-4 text-azure-mist group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-xl border border-oceanic-300 bg-white px-5 py-3.5 text-sm font-bold text-oceanic shadow-sm hover:bg-oceanic-50 transition-all duration-200"
                  >
                    <Activity className="h-5 w-5 text-sapphire" />
                    <span>Bảng Theo Dõi Bệnh Án</span>
                  </Link>

                  <Link
                    href="/clinician"
                    className="inline-flex items-center gap-2 rounded-xl bg-indigoContrast-800 px-5 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-indigoContrast-900 transition-all duration-200"
                  >
                    <Stethoscope className="h-5 w-5 text-azure-mist" />
                    <span>Cổng Bác Sĩ & Hội Chẩn</span>
                  </Link>
                </div>

                {/* Clinical Trust Badges */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-oceanic-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-medical-safe shrink-0" />
                    <span className="text-xs font-semibold text-slate-700">Chuẩn Đo ArUco 0.1mm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-sapphire shrink-0" />
                    <span className="text-xs font-semibold text-slate-700">Phác Đồ EWMA Chuẩn Y Khoa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-oceanic shrink-0" />
                    <span className="text-xs font-semibold text-slate-700">Mã Hóa Dữ Liệu Y Tế</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Diagnostic Mockup Card */}
              <div className="lg:col-span-5">
                <div className="relative rounded-2xl border border-oceanic-200 bg-white p-5 shadow-clinical-lg">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-medical-granulation" />
                      <div className="h-3 w-3 rounded-full bg-medical-slough" />
                      <div className="h-3 w-3 rounded-full bg-medical-safe" />
                      <span className="text-xs font-mono text-dusk-500 ml-1">LANT-VISION-CORE v2.4</span>
                    </div>
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                      LIVE CALIBRATION
                    </span>
                  </div>

                  {/* Simulated Wound Scanner Visual */}
                  <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 aspect-[4/3] flex items-center justify-center">
                    {/* Background Simulated Tissue */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-950/60 via-amber-950/40 to-slate-950 flex items-center justify-center">
                      <div className="relative w-48 h-36 rounded-[40%] bg-gradient-to-br from-red-700 via-rose-900 to-amber-800 shadow-inner border-2 border-red-500/40 flex items-center justify-center overflow-hidden">
                        <div className="w-24 h-20 rounded-full bg-amber-500/70 blur-[2px] absolute -top-2 left-6" />
                        <div className="w-14 h-12 rounded-full bg-slate-950/90 absolute bottom-3 right-6" />
                        <div className="w-20 h-16 rounded-full bg-rose-400/40 blur-[1px] absolute top-4 right-4" />
                      </div>
                    </div>

                    {/* ArUco Calibration Box Overlay */}
                    <div className="absolute top-4 left-4 w-12 h-12 border-2 border-dashed border-emerald-400 bg-emerald-950/40 rounded flex items-center justify-center">
                      <span className="text-[8px] font-mono font-bold text-emerald-300">ARUCO 2cm</span>
                    </div>

                    {/* Animated Scanning Beam */}
                    <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-laser-scan" />

                    {/* Telemetry floating overlays */}
                    <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur border border-white/20 rounded-lg px-2.5 py-1 text-[11px] font-mono text-cyan-300">
                      <div>AREA: <span className="font-bold text-white">8.45 cm²</span></div>
                      <div>WHI: <span className="font-bold text-emerald-400">74 / 100</span></div>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur border border-white/20 rounded-lg px-2.5 py-1 text-[10px] font-mono text-slate-300">
                      <span className="text-red-400 font-bold">R:62%</span> • <span className="text-amber-300 font-bold">Y:20%</span> • <span className="text-slate-400 font-bold">B:0%</span>
                    </div>
                  </div>

                  {/* Realtime Clinical Breakdown Bar */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Phân Bố Mô Sinh Học (RYB)</span>
                      <span className="text-oceanic font-bold">Đang Phục Hồi Tốt</span>
                    </div>
                    <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-100 border border-slate-200">
                      <div style={{ width: "62%" }} className="bg-medical-granulation h-full" title="Mô hạt (62%)" />
                      <div style={{ width: "20%" }} className="bg-medical-slough h-full" title="Mô vảy vàng (20%)" />
                      <div style={{ width: "0%" }} className="bg-medical-necrotic h-full" title="Mô hoại tử (0%)" />
                      <div style={{ width: "18%" }} className="bg-medical-epithelial h-full" title="Biểu mô hóa (18%)" />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-medical-granulation" /> Mô đỏ 62%</span>
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-medical-slough" /> Vảy vàng 20%</span>
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-medical-necrotic" /> Hoại tử 0%</span>
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-medical-epithelial" /> Rìa hồng 18%</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 4 CORE CLINICAL PILLARS */}
        <section className="py-16 bg-white border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-xs font-bold uppercase tracking-widest text-sapphire mb-2">
                KIẾN TRÚC TOÁN HỌC & Y SINH
              </h2>
              <p className="text-2xl sm:text-3xl font-extrabold text-oceanic">
                Giải Pháp Toàn Diện Từ Chụp Ảnh Đến Can Thiệp Lâm Sàng
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Pillar 1 */}
              <div className="rounded-xl border border-oceanic-100 bg-azure-mist/30 p-6 hover:shadow-clinical transition-all duration-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-oceanic text-white mb-4 shadow-sm">
                  <Cpu className="h-6 w-6 text-azure-mist" />
                </div>
                <h3 className="text-base font-bold text-oceanic mb-2">Hiệu Chuẩn Vật Lý ArUco</h3>
                <p className="text-xs text-dusk-600 leading-relaxed mb-3">
                  Tự động nhận diện vật chuẩn 2cm/đồng xu, quy đổi chính xác tỷ lệ pixel sang cm² và kiểm định góc nghiêng / độ chiếu sáng.
                </p>
                <div className="text-[11px] font-mono font-semibold text-sapphire bg-white p-2 rounded border border-oceanic-100">
                  Area = Pixels × (cm/px)²
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="rounded-xl border border-oceanic-100 bg-azure-mist/30 p-6 hover:shadow-clinical transition-all duration-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sapphire text-white mb-4 shadow-sm">
                  <Layers className="h-6 w-6 text-azure-mist" />
                </div>
                <h3 className="text-base font-bold text-oceanic mb-2">Phân Tích RYB & WHI</h3>
                <p className="text-xs text-dusk-600 leading-relaxed mb-3">
                  Bóc tách phân đoạn mô hạt, mô hoại tử eschar và fibrin. Tính toán chỉ số sức khỏe vết thương WHI theo thang điểm 0-100.
                </p>
                <div className="text-[11px] font-mono font-semibold text-sapphire bg-white p-2 rounded border border-oceanic-100">
                  WHI = Clamp(R + 1.2P - 1.5Y - 3B)
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="rounded-xl border border-oceanic-100 bg-azure-mist/30 p-6 hover:shadow-clinical transition-all duration-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigoContrast text-white mb-4 shadow-sm">
                  <TrendingUp className="h-6 w-6 text-azure-mist" />
                </div>
                <h3 className="text-base font-bold text-oceanic mb-2">Đường Cong Giảm Diện Tích</h3>
                <p className="text-xs text-dusk-600 leading-relaxed mb-3">
                  Theo dõi biến thiên phục hồi qua từng mốc ngày (Day-0, Day-5, Day-14), tính toán % giảm so với ban đầu (Delta Base) và kỳ trước.
                </p>
                <div className="text-[11px] font-mono font-semibold text-sapphire bg-white p-2 rounded border border-oceanic-100">
                  ΔBase = (Area₀ - Areaₜ) / Area₀
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="rounded-xl border border-oceanic-100 bg-azure-mist/30 p-6 hover:shadow-clinical transition-all duration-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-dusk text-white mb-4 shadow-sm">
                  <FileCheck2 className="h-6 w-6 text-azure-mist" />
                </div>
                <h3 className="text-base font-bold text-oceanic mb-2">Khuyến Nghị Băng Gạc & Telehealth</h3>
                <p className="text-xs text-dusk-600 leading-relaxed mb-3">
                  Hệ thống suy luận lâm sàng tự động gợi ý gạc Hydrogel, Silver Alginate, Foam Polyurethane và hỗ trợ Bác sĩ ký số SOAP note.
                </p>
                <div className="text-[11px] font-mono font-semibold text-sapphire bg-white p-2 rounded border border-oceanic-100">
                  Phác Đồ EWMA & WUWHS Chuẩn
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* WORKFLOW NAVIGATION CARDS */}
        <section className="py-16 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-oceanic mb-8 text-center">
              Chọn Điểm Truy Cập Theo Nhu Cầu
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Scan & Calibration */}
              <Link
                href="/scan"
                className="group relative rounded-2xl border-2 border-oceanic-200 bg-white p-6 shadow-sm hover:border-oceanic hover:shadow-clinical-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-oceanic-50 text-oceanic group-hover:bg-oceanic group-hover:text-white transition-colors">
                      <Camera className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold text-oceanic-600 bg-oceanic-50 px-2.5 py-1 rounded-full">
                      Bước 1
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-oceanic mb-2">Không Gian Chụp & Khảo Sát Bệnh Án</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tải lên ảnh hoặc bật camera trực tiếp, căn chỉnh khung ArUco 2cm, đo góc nghiêng ánh sáng và điền bảng đánh giá đau VAS.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-oceanic group-hover:text-sapphire">
                  <span>Bắt đầu phiên quét</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Card 2: Patient Dashboard */}
              <Link
                href="/dashboard"
                className="group relative rounded-2xl border-2 border-oceanic-200 bg-white p-6 shadow-sm hover:border-oceanic hover:shadow-clinical-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sapphire-50 text-sapphire group-hover:bg-sapphire group-hover:text-white transition-colors">
                      <Activity className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold text-sapphire-600 bg-sapphire-50 px-2.5 py-1 rounded-full">
                      Bệnh Nhân
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-oceanic mb-2">Bảng Theo Dõi & Lớp Mask AI</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Xem ảnh phân đoạn RYB đa tầng, biểu đồ tiến trình giảm cm², khuyến nghị thay băng gạc tại gia và cảnh báo nguy cơ hoại tử.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-oceanic group-hover:text-sapphire">
                  <span>Mở bảng điều khiển</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Card 3: Clinician Portal */}
              <Link
                href="/clinician"
                className="group relative rounded-2xl border-2 border-indigoContrast-200 bg-white p-6 shadow-sm hover:border-indigoContrast hover:shadow-clinical-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigoContrast-50 text-indigoContrast group-hover:bg-indigoContrast group-hover:text-white transition-colors">
                      <Stethoscope className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold text-indigoContrast-800 bg-indigoContrast-50 px-2.5 py-1 rounded-full">
                      Bác Sĩ
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-oceanic mb-2">Cổng Phân Luồng & Cuộc Gọi Telehealth</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Danh sách bệnh nhân phân theo mức độ rủi ro (Risk Tier), thanh tua thời gian lịch sử vết thương và gọi video tư vấn trực tiếp.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-oceanic group-hover:text-indigoContrast">
                  <span>Truy cập cổng Telehealth</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-oceanic-100 bg-white py-8 text-xs text-dusk-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-oceanic text-white flex items-center justify-center font-extrabold text-xs">
              L
            </div>
            <span className="font-bold text-oceanic">LANT System</span>
            <span>— Lesion Analysis & Necrotic Tissue Vision System</span>
          </div>
          <p className="text-slate-500 text-[11px]">
            Hệ thống hỗ trợ quyết định y khoa dựa trên chuẩn EWMA & WUWHS. Bản quyền © 2026.
          </p>
        </div>
      </footer>

      {/* GLOBAL MODALS */}
      {showReminder && (
        <ReminderModal 
          patientId="PAT-10842" 
          onClose={() => setShowReminder(false)} 
        />
      )}
      {showHazard && (
        <HazardAlertModal 
          isOpen={showHazard}
          onClose={() => setShowHazard(false)}
          blackPercent={28}
          yellowPercent={48}
          hazardReasons={[
            "Mô hoại tử đen (Eschar) chiếm 28% vượt ngưỡng an toàn lâm sàng (>10%).",
            "Mô vảy vàng tiết dịch chiếm 48% có nguy cơ nhiễm trùng sinh mủ lan rộng."
          ]}
        />
      )}
    </div>
  );
}
