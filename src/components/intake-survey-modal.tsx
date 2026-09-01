"use client";

import { useState } from "react";
import { SurveyData, WoundEtiology } from "@/types/medical-schema";

interface IntakeSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (survey: SurveyData, woundTitle: string, anatomicalLocation: string) => void;
  defaultTitle?: string;
  defaultLocation?: string;
  initialTitle?: string;
  initialLocation?: string;
  defaultEtiology?: WoundEtiology;
}

export function IntakeSurveyModal({
  isOpen,
  onClose,
  onSubmit,
  defaultTitle,
  defaultLocation,
  initialTitle,
  initialLocation,
  defaultEtiology = "diabetic_foot",
}: IntakeSurveyModalProps) {
  const [woundTitle, setWoundTitle] = useState(initialTitle || defaultTitle || "Vết thương mới quét");
  const [anatomicalLocation, setAnatomicalLocation] = useState(initialLocation || defaultLocation || "Bàn chân trái (Left Plantar)");
  const [painScore, setPainScore] = useState(5);
  const [etiology, setEtiology] = useState<WoundEtiology>(defaultEtiology);
  const [durationWeeks, setDurationWeeks] = useState(3);
  const [exudateLevel, setExudateLevel] = useState<"none" | "light" | "moderate" | "heavy">("moderate");
  const [exudateType, setExudateType] = useState<"serous" | "sanguineous" | "purulent" | "serosanguineous">("serosanguineous");
  const [odor, setOdor] = useState<"none" | "mild" | "strong">("mild");
  const [selectedComorbidities, setSelectedComorbidities] = useState<string[]>([
    "Đái tháo đường Type 2",
    "Tăng huyết áp"
  ]);
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const comorbiditiesList = [
    "Đái tháo đường Type 2",
    "Tăng huyết áp",
    "Bệnh động mạch ngoại biên (PAD)",
    "Suy van tĩnh mạch chi dưới",
    "Suy thận mạn",
    "Béo phì / Hút thuốc lá",
    "Liệt / Bất động lâu ngày",
    "Bệnh tự miễn / Dùng Corticoid"
  ];

  const toggleComorbidity = (item: string) => {
    if (selectedComorbidities.includes(item)) {
      setSelectedComorbidities(selectedComorbidities.filter(c => c !== item));
    } else {
      setSelectedComorbidities([...selectedComorbidities, item]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const survey: SurveyData = {
      painScore,
      etiology,
      durationWeeks,
      exudateLevel,
      exudateType,
      odor,
      comorbidities: selectedComorbidities,
      notes
    };
    onSubmit(survey, woundTitle, anatomicalLocation);
  };

  const getPainText = (score: number) => {
    if (score <= 2) return "Không đau / Đau nhẹ";
    if (score <= 5) return "Đau vừa phải";
    if (score <= 7) return "Đau nhiều";
    return "Đau dữ dội cần can thiệp";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in font-sans">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-7 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6 border border-oceanic-100/70">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xl font-bold text-oceanic font-heading">
              Khảo sát triệu chứng lâm sàng vết thương
            </h3>
            <p className="text-xs text-dusk-500">
              Cung cấp dữ liệu phục vụ hệ thống đề xuất gạc y khoa tự động
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-mono font-bold text-slate-400 hover:text-slate-700 p-2"
          >
            Đóng
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Title & Anatomical Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block font-heading">
                Tên vết thương / Vùng tổn thương:
              </label>
              <input
                type="text"
                required
                value={woundTitle}
                onChange={(e) => setWoundTitle(e.target.value)}
                placeholder="VD: Loét mu bàn chân trái"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-800 focus:border-oceanic focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block font-heading">
                Vị trí giải phẫu:
              </label>
              <input
                type="text"
                required
                value={anatomicalLocation}
                onChange={(e) => setAnatomicalLocation(e.target.value)}
                placeholder="VD: Gót chân trái (Left Plantar Heel)"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-800 focus:border-oceanic focus:outline-none"
              />
            </div>
          </div>

          {/* Etiology & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block font-heading">
                Nguyên nhân / Phân loại bệnh học:
              </label>
              <select
                value={etiology}
                onChange={(e) => setEtiology(e.target.value as any)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-800 focus:border-oceanic focus:outline-none"
              >
                <option value="diabetic_foot">Loét bàn chân đái tháo đường (DFU)</option>
                <option value="pressure_injury">Loét tì đè (Pressure Injury)</option>
                <option value="venous_ulcer">Loét tĩnh mạch chi dưới (VLU)</option>
                <option value="arterial_ulcer">Loét động mạch (Ischemic Ulcer)</option>
                <option value="surgical_dehiscence">Bung hở / Nhiễm trùng vết mổ</option>
                <option value="burn_trauma">Vết bỏng nhiệt / Chấn thương rách da</option>
                <option value="other">Nguyên nhân khác</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block font-heading">
                Thời gian tồn tại (Tuần):
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-mono font-bold text-slate-800 focus:border-oceanic focus:outline-none"
              />
            </div>
          </div>

          {/* Pain Score (VAS 0-10) */}
          <div className="rounded-2xl bg-slate-50 p-4 space-y-2 border border-slate-200/80">
            <div className="flex justify-between items-center text-xs font-bold text-slate-800">
              <span className="font-heading">Thang điểm đau VAS (0 - 10):</span>
              <span className="font-mono text-sm font-bold text-oceanic">
                {painScore} / 10 — <span className="font-sans text-xs">{getPainText(painScore)}</span>
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={painScore}
              onChange={(e) => setPainScore(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-oceanic"
            />
          </div>

          {/* Exudate Level & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block font-heading">
                Mức độ dịch tiết:
              </label>
              <select
                value={exudateLevel}
                onChange={(e) => setExudateLevel(e.target.value as any)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-oceanic focus:outline-none"
              >
                <option value="none">Khô ráo / Không có dịch</option>
                <option value="light">Ít (Thấm nhẹ gạc trong)</option>
                <option value="moderate">Vừa (Ướt đẫm gạc trong)</option>
                <option value="heavy">Nhiều (Tràn qua băng ngoài)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block font-heading">
                Tính chất dịch:
              </label>
              <select
                value={exudateType}
                onChange={(e) => setExudateType(e.target.value as any)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-oceanic focus:outline-none"
              >
                <option value="serous">Dịch trong (Huyết thanh)</option>
                <option value="serosanguineous">Dịch hồng loãng</option>
                <option value="sanguineous">Dịch máu tươi</option>
                <option value="purulent">Dịch mủ vàng / Đục</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block font-heading">
                Mùi hôi:
              </label>
              <select
                value={odor}
                onChange={(e) => setOdor(e.target.value as any)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-oceanic focus:outline-none"
              >
                <option value="none">Không có mùi</option>
                <option value="mild">Mùi nhẹ</option>
                <option value="strong">Mùi hôi nồng nặc</option>
              </select>
            </div>
          </div>

          {/* Comorbidities */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block font-heading">
              Bệnh lý nền đi kèm:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {comorbiditiesList.map((item) => {
                const isSelected = selectedComorbidities.includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => toggleComorbidity(item)}
                    className={`px-3 py-2 rounded-xl text-left text-xs transition-all ${
                      isSelected
                        ? "bg-oceanic-50 text-oceanic font-bold border border-oceanic"
                        : "bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-white"
                    }`}
                  >
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clinical Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block font-heading">
              Ghi chú bổ sung:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Cảm giác châm chích, tê bì gót chân sau khi ngâm nước ấm..."
              className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-xs text-slate-800 focus:border-oceanic focus:outline-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <span>Hủy</span>
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-oceanic text-xs font-bold text-white hover:bg-oceanic-800 shadow-xs transition-all"
            >
              <span>Hoàn tất & lưu bệnh án →</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
