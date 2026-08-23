"use client";

import Link from "next/link";

export default function RootRoleGatewayPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-oceanic-100 selection:text-oceanic-900">
      
      {/* MINIMALIST TOP BRAND BAR */}
      <header className="w-full border-b border-oceanic-100/60 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl font-black tracking-tight text-oceanic font-heading">
              LANT
            </span>
            <span className="rounded-full bg-oceanic-50 px-2 py-0.5 text-[10px] font-bold text-oceanic-700 tracking-wider border border-oceanic-200 font-mono">
              Vision AI
            </span>
          </div>

          <div className="text-xs text-dusk-600 font-medium">
            <span>Chuẩn y khoa EWMA & WUWHS</span>
          </div>
        </div>
      </header>

      {/* MAIN HERO ROLE GATEWAY */}
      <main className="flex-1 flex flex-col justify-center py-12 lg:py-16">
        <div className="mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header Accent Title */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-block rounded-full bg-white px-3.5 py-1 shadow-2xs border border-oceanic-100/80">
              <span className="text-[11px] font-bold text-oceanic uppercase tracking-widest font-heading">
                Hệ thống thị giác y khoa giám sát vết thương
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-oceanic font-heading tracking-tight leading-tight">
              Chọn vai trò <span className="font-editorial italic font-normal text-sapphire">để bắt đầu</span>
            </h1>

            <p className="text-xs sm:text-sm text-dusk-600 leading-relaxed font-sans">
              Nền tảng phân tách mô học <strong className="text-medical-granulation">RYB</strong>, đo đạc diện tích thực tế (<span className="font-mono font-bold text-oceanic">cm²</span>) 
              và kết nối hội chẩn telehealth chuyên khoa chuẩn hóa.
            </p>
          </div>

          {/* DUAL ROLE CARDS - Pure Typography & Airy Spacing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* CARD 1: PATIENT */}
            <div className="group relative rounded-3xl bg-white/95 p-8 lg:p-10 shadow-clinical hover:shadow-clinical-lg transition-all duration-300 flex flex-col justify-between border border-oceanic-100/70">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-oceanic font-mono">
                    Dành cho bệnh nhân
                  </span>
                  <span className="rounded-full bg-oceanic-50 px-2.5 py-0.5 text-[10px] font-bold text-oceanic-700 font-mono">
                    Không gian cá nhân
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-black text-oceanic font-heading group-hover:text-sapphire transition-colors">
                    Bệnh nhân / Người chăm sóc
                  </h2>
                  <p className="text-xs sm:text-sm text-dusk-600 mt-2.5 leading-relaxed font-sans">
                    Tự chụp và đo diện tích vết thương tại nhà, theo dõi tiến trình lành thương và nhận hướng dẫn băng gạc.
                  </p>
                </div>

                {/* Key Features */}
                <div className="space-y-2.5 pt-4 text-xs text-slate-700 font-medium">
                  <p className="leading-relaxed">
                    • Chụp ảnh vết thương & hiệu chuẩn thước đo ArUco 2cm
                  </p>
                  <p className="leading-relaxed">
                    • Xem biểu đồ phân tách mô hạt đỏ, vảy vàng & điểm phục hồi WHI
                  </p>
                  <p className="leading-relaxed">
                    • Liên hệ bác sĩ phụ trách qua cổng telehealth trực tuyến
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100">
                <Link
                  href="/auth/login?role=patient"
                  className="w-full flex items-center justify-center rounded-2xl bg-oceanic px-6 py-3.5 text-xs font-bold text-white shadow-xs hover:bg-oceanic-800 transition-all duration-150"
                >
                  <span>Đăng nhập / Vào bảng bệnh nhân</span>
                </Link>
              </div>
            </div>

            {/* CARD 2: DOCTOR */}
            <div className="group relative rounded-3xl bg-white/95 p-8 lg:p-10 shadow-clinical hover:shadow-clinical-lg transition-all duration-300 flex flex-col justify-between border border-indigoContrast-100/70">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigoContrast font-mono">
                    Dành cho bác sĩ
                  </span>
                  <span className="rounded-full bg-indigoContrast-50 px-2.5 py-0.5 text-[10px] font-bold text-indigoContrast font-mono">
                    Phân luồng y tế
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl font-black text-oceanic font-heading group-hover:text-indigoContrast transition-colors">
                    Bác sĩ / Chuyên gia y tế
                  </h2>
                  <p className="text-xs sm:text-sm text-dusk-600 mt-2.5 leading-relaxed font-sans">
                    Phân loại rủi ro hoại tử (Triage), quản lý hàng đợi, hội chẩn telehealth trực tuyến và ký duyệt bệnh án SOAP.
                  </p>
                </div>

                {/* Key Features */}
                <div className="space-y-2.5 pt-4 text-xs text-slate-700 font-medium">
                  <p className="leading-relaxed">
                    • Hàng đợi triage ưu tiên các ca cảnh báo hoại tử đen
                  </p>
                  <p className="leading-relaxed">
                    • Thanh tua thời gian đối chiếu diễn tiến Day 0 vs Day N
                  </p>
                  <p className="leading-relaxed">
                    • Tự động tạo bệnh án SOAP & ký số điện tử phác đồ điều trị
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100">
                <Link
                  href="/auth/login?role=doctor"
                  className="w-full flex items-center justify-center rounded-2xl bg-indigoContrast px-6 py-3.5 text-xs font-bold text-white shadow-xs hover:bg-indigoContrast-900 transition-all duration-150"
                >
                  <span>Đăng nhập / Vào cổng bác sĩ</span>
                </Link>
              </div>
            </div>

          </div>

          {/* MINIMALIST TRUST BAR - Pure Typography */}
          <div className="grid grid-cols-3 gap-6 pt-6 max-w-3xl mx-auto text-center text-xs text-slate-600">
            <div>
              <p className="font-bold text-slate-800 font-heading">Chuẩn đo ArUco</p>
              <p className="text-[11px] text-slate-500 font-mono">Độ phân giải 0.1 mm</p>
            </div>

            <div>
              <p className="font-bold text-slate-800 font-heading">Bảo mật y tế E2EE</p>
              <p className="text-[11px] text-slate-500 font-mono">Mã hóa chuẩn HIPAA</p>
            </div>

            <div>
              <p className="font-bold text-slate-800 font-heading">Phác đồ EWMA</p>
              <p className="text-[11px] text-slate-500 font-mono">Khuyến nghị băng gạc</p>
            </div>
          </div>

        </div>
      </main>

      {/* MINIMALIST FOOTER */}
      <footer className="border-t border-oceanic-100/60 bg-white/80 py-4 text-center text-[11px] text-dusk-500">
        Bản quyền © 2026 LANT — Lesion Analysis & Necrotic Tissue Vision System.
      </footer>
    </div>
  );
}
