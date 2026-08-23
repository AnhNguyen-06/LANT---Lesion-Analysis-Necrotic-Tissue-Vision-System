"use client";

import { useState, useEffect } from "react";
import { MockStorageService } from "@/lib/mock-storage";
import { ReminderConfig } from "@/types/medical-schema";

interface ReminderModalProps {
  patientId: string;
  onClose: () => void;
}

export function ReminderModal({ patientId, onClose }: ReminderModalProps) {
  const [config, setConfig] = useState<ReminderConfig | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState("09:00");
  const [frequency, setFrequency] = useState<"daily" | "every_2_days" | "weekly">("daily");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const data = MockStorageService.getReminders(patientId);
    setConfig(data);
    setEnabled(data.enabled);
    setTimeOfDay(data.timeOfDay || "09:00");
    setFrequency(data.frequency || "daily");
  }, [patientId]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ReminderConfig = {
      patientId,
      enabled,
      timeOfDay,
      frequency,
      channels: config?.channels || { sms: true, email: true, push: true },
      streakDays: config?.streakDays || 5,
      lastCaptureDate: config?.lastCaptureDate || "2026-08-18"
    };
    MockStorageService.saveReminders(updated);
    setConfig(updated);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in font-sans">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-7 sm:p-8 shadow-2xl space-y-6 border border-oceanic-100/70">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xl font-bold text-oceanic font-heading">
              Cài đặt lịch nhắc chụp & thay băng
            </h3>
            <p className="text-xs text-dusk-500">
              Duy trì chuỗi tuân thủ ghi nhận vết thương định kỳ
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-mono font-bold text-slate-400 hover:text-slate-700 p-2"
          >
            Đóng
          </button>
        </div>

        {/* Streak Tracker Banner */}
        <div className="rounded-2xl bg-amber-50/70 p-4 flex items-center justify-between border border-amber-200">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
              Chuỗi tuân thủ ghi nhận
            </span>
            <p className="text-base font-bold text-amber-950 font-heading">
              Đã ghi nhận liên tục 5 ngày
            </p>
          </div>
          <span className="font-mono text-xs font-bold text-amber-900 bg-white px-3 py-1.5 rounded-xl border border-amber-200">
            5 / 7 ngày
          </span>
        </div>

        {/* Form Settings */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-xs font-bold text-slate-800 block font-heading">Bật thông báo nhắc nhở</span>
              <span className="text-[11px] text-slate-500">Nhận thông báo qua SMS / Zalo / Email</span>
            </div>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-5 w-5 rounded text-oceanic focus:ring-oceanic"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block font-heading">
                Giờ nhắc hàng ngày:
              </label>
              <input
                type="time"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-mono font-bold text-slate-800 focus:border-oceanic focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block font-heading">
                Tần suất theo dõi:
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-oceanic focus:outline-none"
              >
                <option value="daily">Mỗi ngày 1 lần</option>
                <option value="every_2_days">Mỗi 2 ngày 1 lần</option>
                <option value="weekly">Mỗi tuần 1 lần</option>
              </select>
            </div>
          </div>

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
              className="px-6 py-2.5 rounded-2xl bg-oceanic text-xs font-bold text-white hover:bg-oceanic-800 shadow-xs transition-all"
            >
              <span>{isSaved ? "Đã lưu cài đặt!" : "Lưu cài đặt nhắc nhở"}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
