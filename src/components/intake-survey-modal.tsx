"use client";

import { useState } from "react";
import { 
  ClipboardList, 
  Smile, 
  Meh, 
  Frown, 
  Flame, 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  Sparkles,
  AlertCircle
} from "lucide-react";
import { SurveyData, WoundEtiology } from "@/types/medical-schema";

interface IntakeSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (survey: SurveyData, woundTitle: string, location: string) => void;
  defaultTitle?: string;
  defaultLocation?: string;
  defaultEtiology?: WoundEtiology;
}

export function IntakeSurveyModal({
  isOpen,
  onClose,
  onSubmit,
  defaultTitle = "Vết Loét Bàn Chân Giai Đoạn Mới",
  defaultLocation = "Gót chân trái (Left Plantar Heel)",
  defaultEtiology = "diabetic_foot",
}: IntakeSurveyModalProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [location, setLocation] = useState(defaultLocation);
  const [painScore, setPainScore] = useState(5);
  const [etiology, setEtiology] = useState<WoundEtiology>(defaultEtiology);
  const [durationWeeks, setDurationWeeks] = useState(3);
  const [exudateLevel, setExudateLevel] = useState<'none' | 'light' | 'moderate' | 'heavy'>("moderate");
  const [exudateType, setExudateType] = useState<'serous' | 'sanguineous' | 'purulent' | 'serosanguineous'>("serosanguineous");
  const [odor, setOdor] = useState<'none' | 'mild' | 'strong'>("none");
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
    "Suy giãn tĩnh mạch chi dưới",
    "Liệt/Bất động lâu ngày",
    "Béo phì (BMI > 30)",
    "Hút thuốc lá kéo dài",
    "Suy giảm miễn dịch / Đang dùng Corticoid"
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
      notes: notes.trim() || undefined
    };
    onSubmit(survey, title, location);
  };

  const getPainColor = (val: number) => {
    if (val <= 2) return "text-emerald-600 bg-emerald-50 border-emerald-300";
    if (val <= 5) return "text-amber-600 bg-amber-50 border-amber-300";
    if (val <= 8) return "text-orange-600 bg-orange-50 border-orange-300";
    return "text-red-600 bg-red-50 border-red-300";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-oceanic-200 bg-white p-6 sm:p-8 shadow-clinical-lg my-8 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-oceanic text-white shadow-md">
            <ClipboardList className="h-6 w-6 text-azure-mist" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-oceanic">Khảo Sát Lâm Sàng & Đăng Ký Vết Thương</h2>
              <span className="rounded bg-oceanic-50 px-2 py-0.5 text-[10px] font-bold text-oceanic-700 border border-oceanic-200">
                INTAKE FORM
              </span>
            </div>
            <p className="text-xs text-dusk-500">Cung cấp triệu chứng đau, dịch tiết và bệnh nền để AI tối ưu phác đồ</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* General Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên Vết Thương / Chẩn Đoán <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Loét Bàn Chân Trái Wagner II"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-oceanic focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Vị Trí Giải Phẫu Học <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ví dụ: Gót chân trái, xương cùng..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-oceanic focus:outline-none"
              />
            </div>
          </div>

          {/* Etiology & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nguyên Nhân Bệnh Sinh (Etiology)
              </label>
              <select
                value={etiology}
                onChange={(e) => setEtiology(e.target.value as WoundEtiology)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-oceanic focus:outline-none"
              >
                <option value="diabetic_foot">Loét Bàn Chân Đái Tháo Đường (DFU)</option>
                <option value="pressure_injury">Loét Tì Đè / Loét Tỳ (Pressure Injury)</option>
                <option value="surgical_dehiscence">Bung / Hở Vết Mổ Sau Phẫu Thuật</option>
                <option value="venous_ulcer">Loét Tĩnh Mạch Mãn Tính</option>
                <option value="burn_trauma">Bỏng Nhiệt / Chấn Thương Hở</option>
                <option value="arterial_ulcer">Loét Động Mạch Thiếu Máu Cục Bộ</option>
                <option value="other">Nguyên nhân khác</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Thời Gian Tồn Tại (Tuần)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-oceanic focus:outline-none"
              />
            </div>
          </div>

          {/* Pain Score VAS Slider */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">
                Thang Điểm Đau VAS (Visual Analog Scale 0 - 10)
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${getPainColor(painScore)}`}>
                Điểm: {painScore}/10 ({painScore === 0 ? "Không đau" : painScore <= 3 ? "Đau nhẹ" : painScore <= 6 ? "Đau vừa" : "Đau dữ dội"})
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

            <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-semibold">
              <span className="flex items-center gap-1"><Smile className="h-3 w-3 text-emerald-600" /> 0: Êm dịu</span>
              <span className="flex items-center gap-1"><Meh className="h-3 w-3 text-amber-600" /> 5: Đau vừa</span>
              <span className="flex items-center gap-1"><Frown className="h-3 w-3 text-red-600" /> 10: Cực độ</span>
            </div>
          </div>

          {/* Exudate & Odor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lượng Dịch Tiết (Exudate)
              </label>
              <select
                value={exudateLevel}
                onChange={(e) => setExudateLevel(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-oceanic focus:outline-none"
              >
                <option value="none">Không có dịch (Khô)</option>
                <option value="light">Ít (&lt; 25% gạc)</option>
                <option value="moderate">Vừa (25% - 75% gạc)</option>
                <option value="heavy">Nhiều (&gt; 75% gạc ướt)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Màu Sắc Dịch Tiết
              </label>
              <select
                value={exudateType}
                onChange={(e) => setExudateType(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-oceanic focus:outline-none"
              >
                <option value="serous">Thanh dịch trong (Serous)</option>
                <option value="serosanguineous">Dịch hồng lẫn máu nhẹ</option>
                <option value="sanguineous">Máu đỏ tươi (Sanguineous)</option>
                <option value="purulent">Dịch mủ đục vàng/xanh (Purulent)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mùi Vết Thương
              </label>
              <select
                value={odor}
                onChange={(e) => setOdor(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-oceanic focus:outline-none"
              >
                <option value="none">Không có mùi</option>
                <option value="mild">Mùi nhẹ thoang thoảng</option>
                <option value="strong">Mùi hôi nồng khó chịu</option>
              </select>
            </div>
          </div>

          {/* Comorbidities Checklist */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Bệnh Lý Nền Đi Kèm (Comorbidities)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {comorbiditiesList.map((item) => {
                const checked = selectedComorbidities.includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => toggleComorbidity(item)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                      checked
                        ? "border-oceanic-400 bg-oceanic-50/70 text-oceanic-900 font-bold"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      checked ? "bg-oceanic border-oceanic text-white" : "border-slate-300 bg-white"
                    }`}>
                      {checked && <CheckCircle2 className="h-3 w-3" />}
                    </div>
                    <span className="truncate">{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clinical Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ghi Chú Triệu Chứng Bổ Sung
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Cảm giác nóng rát, thời điểm xuất hiện vảy mới..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-oceanic focus:outline-none"
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-oceanic text-xs font-bold text-white hover:bg-oceanic-800 shadow-md shadow-oceanic/20 transition-all"
            >
              <Sparkles className="h-4 w-4 text-azure-mist" />
              <span>Xác Nhận & Lưu Bệnh Án</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
