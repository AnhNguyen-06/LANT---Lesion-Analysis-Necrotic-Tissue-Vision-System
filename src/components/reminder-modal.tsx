"use client";

import { useState, useEffect } from "react";
import { 
  Bell, 
  Clock, 
  Flame, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  X, 
  Send,
  CalendarCheck
} from "lucide-react";
import { MockStorageService } from "@/lib/mock-storage";
import { ReminderConfig } from "@/types/medical-schema";

interface ReminderModalProps {
  patientId: string;
  onClose: () => void;
}

export function ReminderModal({ patientId, onClose }: ReminderModalProps) {
  const [config, setConfig] = useState<ReminderConfig | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  useEffect(() => {
    const current = MockStorageService.getReminderConfig(patientId);
    setConfig(current);
  }, [patientId]);

  if (!config) return null;

  const handleSave = () => {
    MockStorageService.saveReminderConfig(config);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleSendTestPush = () => {
    setTestNotificationSent(true);
    setTimeout(() => setTestNotificationSent(false), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-oceanic-200 bg-white p-6 sm:p-8 shadow-clinical-lg animate-in zoom-in-95 duration-200">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-oceanic text-white shadow-md">
            <Bell className="h-6 w-6 text-azure-mist" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-oceanic">Lịch Nhắc Chụp & Chuỗi Tuân Thủ</h2>
            <p className="text-xs text-dusk-500">Thiết lập thông báo tự động theo dõi tiến trình lành thương</p>
          </div>
        </div>

        {/* Streak Banner */}
        <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
              <Flame className="h-6 w-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-amber-900">
                  Chuỗi {config.streakDays} Ngày Liên Tiếp
                </span>
                <span className="rounded bg-amber-200 px-1.5 py-0.2 text-[10px] font-bold text-amber-800">
                  XUẤT SẮC
                </span>
              </div>
              <p className="text-xs text-amber-700">Lần chụp gần nhất: {config.lastCaptureDate}</p>
            </div>
          </div>
          <CalendarCheck className="h-8 w-8 text-amber-400 opacity-60" />
        </div>

        {/* Configuration Form */}
        <div className="space-y-4">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-800">Kích hoạt thông báo tự động</p>
              <p className="text-[11px] text-slate-500">Gửi lời nhắc định kỳ để không bỏ lỡ ngày thay băng</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-oceanic"></div>
            </label>
          </div>

          {/* Time and Frequency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giờ Nhắc Trong Ngày
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={config.timeOfDay}
                  onChange={(e) => setConfig({ ...config, timeOfDay: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-oceanic focus:outline-none"
                />
                <Clock className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tần Suất Quét
              </label>
              <select
                value={config.frequency}
                onChange={(e) => setConfig({ ...config, frequency: e.target.value as any })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-oceanic focus:outline-none"
              >
                <option value="daily">Hàng ngày (Khuyến nghị)</option>
                <option value="every_2_days">Mỗi 2 ngày (Khi thay băng)</option>
                <option value="weekly">Mỗi tuần 1 lần</option>
              </select>
            </div>
          </div>

          {/* Notification Channels */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Kênh Tiếp Nhận
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setConfig({
                  ...config,
                  channels: { ...config.channels, push: !config.channels.push }
                })}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                  config.channels.push
                    ? "border-oceanic bg-oceanic-50 text-oceanic"
                    : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                <Smartphone className="h-4 w-4 mb-1" />
                <span>Push App</span>
              </button>

              <button
                type="button"
                onClick={() => setConfig({
                  ...config,
                  channels: { ...config.channels, email: !config.channels.email }
                })}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                  config.channels.email
                    ? "border-oceanic bg-oceanic-50 text-oceanic"
                    : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                <Mail className="h-4 w-4 mb-1" />
                <span>Email</span>
              </button>

              <button
                type="button"
                onClick={() => setConfig({
                  ...config,
                  channels: { ...config.channels, sms: !config.channels.sms }
                })}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                  config.channels.sms
                    ? "border-oceanic bg-oceanic-50 text-oceanic"
                    : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                <MessageSquare className="h-4 w-4 mb-1" />
                <span>SMS Zalo</span>
              </button>
            </div>
          </div>

          {/* Test Push simulation button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSendTestPush}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-dashed border-oceanic-300 text-xs font-semibold text-oceanic hover:bg-oceanic-50 transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Gửi Thử Thông Báo Mẫu Đến Thiết Bị</span>
            </button>
          </div>

          {/* Interactive Test Notification Banner Preview */}
          {testNotificationSent && (
            <div className="rounded-xl bg-slate-900 text-white p-3 shadow-lg border border-slate-700 animate-in slide-in-from-top duration-300">
              <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-800">
                <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-bold">
                  <Bell className="h-3 w-3" />
                  <span>LANT VISION MEDICAL</span>
                </div>
                <span className="text-[10px] text-slate-400">Vừa xong</span>
              </div>
              <p className="text-xs font-bold text-white">Đã đến giờ chụp cập nhật vết thương! 📸</p>
              <p className="text-[11px] text-slate-300">
                Chào {patientId === "PAT-10842" ? "chú An" : "bạn"}, hãy dành 2 phút quét lại vết loét gót chân để AI tính toán % lành thương hôm nay nhé.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Hủy Bỏ
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-oceanic text-xs font-bold text-white hover:bg-oceanic-800 shadow-sm"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Đã Lưu Cài Đặt!</span>
              </>
            ) : (
              <span>Lưu Lịch Nhắc</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
