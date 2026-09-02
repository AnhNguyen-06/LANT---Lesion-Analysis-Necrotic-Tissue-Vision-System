"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { DBStore } from "@/lib/db-store";

interface TourStep {
  title: string;
  subtitle: string;
  description: string;
  highlightCategory: string;
  targetTip: string;
}

const PATIENT_STEPS: TourStep[] = [
  {
    title: "1. Cập nhật hồ sơ y tế & Địa chỉ cư trú",
    subtitle: "Thiết lập danh tính y tế cá nhân",
    description: "Nhập thông tin tiền sử dị ứng, đái tháo đường, các bệnh lý nền và địa chỉ hành chính 3 cấp tại Việt Nam để bác sĩ điều phối điều trị chính xác.",
    highlightCategory: "HỒ SƠ CÁ NHÂN",
    targetTip: "Truy cập từ menu Tài khoản → Hồ sơ cá nhân"
  },
  {
    title: "2. Tổng quan bệnh án & Chỉ số WHI",
    subtitle: "Theo dõi diện tích & trạng thái vết thương",
    description: "Bảng điều khiển hiển thị tất cả vết thương đang điều trị, điểm sức khỏe vết thương (Wound Health Index 0-100) và mức độ nguy cơ lâm sàng.",
    highlightCategory: "TỔNG QUAN BỆNH ÁN",
    targetTip: "Rê chuột vào thẻ vết thương để xem nhanh tỷ lệ 4 lớp mô RYB"
  },
  {
    title: "3. Chụp & Đo đạc chuẩn hóa ArUco",
    subtitle: "Hiệu chuẩn kích thước thực với thước 2.0 cm",
    description: "Sử dụng camera hoặc tải ảnh lên. Máy đo độ rọi sáng (Luminance Quality Meter) sẽ tự động báo góc chụp tối ưu và khóa thước ArUco 2.0 cm.",
    highlightCategory: "CHỤP & ĐO ARUCO",
    targetTip: "Luôn đặt thước ArUco cạnh vết thương và giữ ánh sáng màu xanh lá"
  },
  {
    title: "4. Bóc tách mô học 4 lớp RYB",
    subtitle: "Tiêu chuẩn lâm sàng EWMA & WUWHS",
    description: "Hệ thống AI tự động phân tích: Mô hạt Đỏ (Viable), Mô vảy Vàng (Infection risk), Hoại tử Đen (Eschar) và Biểu bì hóa Hồng (Closure).",
    highlightCategory: "PHÂN TÁCH MÔ HỌC",
    targetTip: "Bật/tắt từng lớp màu trên Canvas để quan sát chi tiết"
  },
  {
    title: "5. Đồ thị co nhỏ & Tiến trình hồi phục",
    subtitle: "Trực quan hóa tốc độ lành vết thương",
    description: "Biểu đồ chuỗi thời gian đối chiếu diện tích (cm²) từ Ngày 0 đến hiện tại, giúp bạn và bác sĩ đánh giá phác đồ đang dùng có hiệu quả không.",
    highlightCategory: "BIỂU ĐỒ PHỤC HỒI",
    targetTip: "Chọn từng điểm mốc ngày trên thanh tua thời gian để xem lại ảnh cũ"
  },
  {
    title: "6. Kho hồ sơ ca bệnh đã liền",
    subtitle: "Lưu trữ thành quả điều trị",
    description: "Khi diện tích vết thương thu nhỏ về 0 cm² và biểu bì đóng hoàn toàn, ca bệnh được chuyển sang kho lưu trữ vĩnh viễn với đầy đủ số liệu Before / After.",
    highlightCategory: "KHO ĐÃ LIỀN",
    targetTip: "Truy cập mục 'Kho đã liền' trên thanh điều hướng"
  },
  {
    title: "7. Cổng Bác sĩ, Nhắn tin & Telehealth",
    subtitle: "Hội chẩn trực tuyến & Bệnh án ký số SOAP",
    description: "Nhắn tin 1-on-1 với bác sĩ phụ trách, nhận cuộc gọi video Telehealth và xem bệnh án điện tử đã có chữ ký số xác thực y khoa.",
    highlightCategory: "TELEHEALTH & KÝ SỐ",
    targetTip: "Bác sĩ sẽ trực tiếp kết nối cuộc gọi video khi đến giờ hẹn"
  }
];

const DOCTOR_STEPS: TourStep[] = [
  {
    title: "1. Bảng phân luồng nguy cơ Triage",
    subtitle: "Sàng lọc bệnh nhân ưu tiên cấp cứu",
    description: "Tự động phân loại bệnh nhân theo mức độ nguy kịch: Hoại tử đen ≥10%, Nhiễm trùng vàng ≥35% hoặc Ổn định để bác sĩ can thiệp kịp thời.",
    highlightCategory: "TRIAGE LÂM SÀNG",
    targetTip: "Sử dụng các bộ lọc nhanh ở đầu trang để chọn danh sách bệnh nhân"
  },
  {
    title: "2. Hội chẩn Telehealth trực tuyến",
    subtitle: "Bắt đầu cuộc gọi video 2 chiều",
    description: "Bác sĩ chủ động bấm 'Bắt đầu cuộc gọi Telehealth' để kết nối video thời gian thực, xem live wound canvas và trao đổi phác đồ với bệnh nhân.",
    highlightCategory: "HỘI CHẨN TELEHEALTH",
    targetTip: "Cuộc gọi được mã hóa bảo mật E2EE và hỗ trợ split-screen ghi chú"
  },
  {
    title: "3. Ký số Bệnh án điện tử SOAP",
    subtitle: "Chứng thực y khoa với mã chứng chỉ CCHN",
    description: "Đối chiếu ảnh chuỗi thời gian, chỉnh sửa 4 trường Subjective - Objective - Assessment - Plan và bấm ký số điện tử để đồng bộ ngay sang EMR của bệnh nhân.",
    highlightCategory: "KÝ SỐ ĐIỆN TỬ SOAP",
    targetTip: "Mã chứng chỉ số LANT-CERT được tạo tự động kèm timestamp"
  }
];

export function OnboardingTour() {
  const router = useRouter();
  const { user, completeTour } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const isDoctor = user?.role === "CLINICIAN";
  const steps = isDoctor ? DOCTOR_STEPS : PATIENT_STEPS;

  useEffect(() => {
    // Auto-open if user hasn't completed tour yet
    if (user && user.tourCompleted === false) {
      setIsOpen(true);
      setCurrentStepIndex(0);
    }

    const handleManualTrigger = () => {
      setIsOpen(true);
      setCurrentStepIndex(0);
    };

    window.addEventListener("LANT_TRIGGER_TOUR", handleManualTrigger);
    return () => window.removeEventListener("LANT_TRIGGER_TOUR", handleManualTrigger);
  }, [user]);

  if (!isOpen) return null;

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    completeTour();
    setIsOpen(false);
    if (user && user.role === "PATIENT") {
      const p = DBStore.getPatientById(user.patientId || user.id);
      if (!p || p.wounds.length === 0) {
        router.push("/patient/scan");
      }
    }
  };

  const handleSkip = () => {
    completeTour();
    setIsOpen(false);
    if (user && user.role === "PATIENT") {
      const p = DBStore.getPatientById(user.patientId || user.id);
      if (!p || p.wounds.length === 0) {
        router.push("/patient/scan");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in font-sans">
      <div className="w-full max-w-xl bg-white rounded-3xl p-7 sm:p-8 shadow-2xl border border-oceanic-100 space-y-6 animate-in zoom-in-95 relative overflow-hidden">
        
        {/* Progress Bar Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-oceanic-50 text-oceanic border border-oceanic-200 font-mono">
              {currentStep.highlightCategory}
            </span>
            <span className="text-xs font-mono font-bold text-dusk-500">
              Bước {currentStepIndex + 1} / {steps.length}
            </span>
          </div>

          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-oceanic transition-all duration-300 rounded-full"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-oceanic font-heading tracking-tight">
            {currentStep.title}
          </h2>
          <p className="text-xs font-bold text-sapphire font-heading">
            {currentStep.subtitle}
          </p>
          <p className="text-xs text-slate-600 leading-relaxed pt-1">
            {currentStep.description}
          </p>
        </div>

        {/* Tip Box */}
        <div className="p-3.5 rounded-2xl bg-azure-mist/60 border border-oceanic-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Mẹo sử dụng:</span>
          <span className="text-oceanic font-bold font-heading">{currentStep.targetTip}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Bỏ qua hướng dẫn
          </button>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all"
              >
                ← Quay lại
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-oceanic text-white text-xs font-bold hover:bg-oceanic-800 shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>{isLastStep ? "Hoàn thành & Bắt đầu →" : "Tiếp theo →"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
