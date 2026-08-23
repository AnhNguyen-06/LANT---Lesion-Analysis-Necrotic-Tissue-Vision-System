"use client";

import { useState, useEffect } from "react";
import { WoundCanvas } from "./wound-canvas";
import { Patient, WoundProfile, SnapshotLog } from "@/types/medical-schema";

interface TelehealthCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  wound: WoundProfile;
  activeSnapshot: SnapshotLog;
  onSignSoap: (assessment: string, plan: string) => void;
}

export function TelehealthCallModal({
  isOpen,
  onClose,
  patient,
  wound,
  activeSnapshot,
  onSignSoap,
}: TelehealthCallModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [activeTab, setActiveTab] = useState<"canvas" | "chat" | "soap">("canvas");
  const [callDuration, setCallDuration] = useState(0);

  // SOAP state inside consultation
  const [assessment, setAssessment] = useState(
    `Vết thương ${wound.title} tiến triển khả quan, diện tích hiện tại ${activeSnapshot.totalAreaCm2} cm² (giảm so với ban đầu). Tỷ lệ mô hạt đỏ ${activeSnapshot.rybMetrics.redPercent}% chiếm ưu thế.`
  );
  const [plan, setPlan] = useState(
    `Tiếp tục dùng ${activeSnapshot.recommendation.primaryDressing}. Rửa vết thương bằng nước muối sinh lý 0.9%, thay băng ${activeSnapshot.recommendation.changeFrequency}. Tái khám sau 7 ngày.`
  );
  const [isSigned, setIsSigned] = useState(false);

  // Chat message state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: "Hệ thống", text: "Phiên hội chẩn telehealth bảo mật E2EE đã bắt đầu.", time: "10:00" },
    { sender: patient.fullName, text: "Chào bác sĩ, hôm nay chân em đỡ đau hơn rồi ạ.", time: "10:01" },
    { sender: "BS. CKI Trần Minh Đức", text: "Chào bác An, tôi đang xem hình ảnh quét mới nhất của bác đây.", time: "10:02" }
  ]);
  const [inputMessage, setInputMessage] = useState("");

  // Timer
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60).toString().padStart(2, "0");
    const secs = (sec % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    setChatMessages(prev => [
      ...prev,
      {
        sender: "BS. CKI Trần Minh Đức",
        text: inputMessage,
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    setInputMessage("");
  };

  const handleApprove = () => {
    onSignSoap(assessment, plan);
    setIsSigned(true);
    setTimeout(() => {
      setIsSigned(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in font-sans">
      <div className="relative w-full max-w-6xl h-[88vh] rounded-3xl bg-white shadow-2xl flex flex-col overflow-hidden border border-oceanic-100/70">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/95">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-oceanic font-heading">
              Phòng hội chẩn telehealth: {patient.fullName}
            </span>
            <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-0.5 text-xs font-mono font-bold">
              {formatDuration(callDuration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isMuted ? "bg-red-50 text-red-700 border border-red-200" : "bg-slate-100 text-slate-700"
              }`}
            >
              <span>{isMuted ? "Đã tắt mic" : "Mic bật"}</span>
            </button>

            <button
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isVideoOff ? "bg-red-50 text-red-700 border border-red-200" : "bg-slate-100 text-slate-700"
              }`}
            >
              <span>{isVideoOff ? "Camera tắt" : "Camera bật"}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all"
            >
              <span>Kết thúc cuộc gọi</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Video Stream + Clinical Toolset */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Left: Video Streams (6 Cols) */}
          <div className="lg:col-span-6 bg-slate-950 p-6 flex flex-col justify-between space-y-4 overflow-y-auto">
            
            {/* Main Patient Video View */}
            <div className="relative flex-1 rounded-2xl bg-slate-900 overflow-hidden flex items-center justify-center min-h-[220px]">
              {!isVideoOff ? (
                <div className="text-center space-y-2 p-6">
                  <div className="h-16 w-16 rounded-2xl bg-oceanic text-white text-2xl font-bold flex items-center justify-center mx-auto">
                    {patient.fullName.charAt(0)}
                  </div>
                  <p className="text-xs font-bold text-white font-heading">{patient.fullName} (Bệnh nhân)</p>
                  <span className="text-[10px] text-emerald-400 font-mono">Đang truyền video trực tiếp (720p)</span>
                </div>
              ) : (
                <div className="text-center text-slate-500 text-xs">Camera bệnh nhân đang tắt</div>
              )}
            </div>

            {/* Doctor Self View */}
            <div className="h-28 rounded-2xl bg-slate-900/80 p-3 flex items-center justify-between border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigoContrast text-white text-xs font-bold flex items-center justify-center">
                  BS
                </div>
                <div>
                  <p className="text-xs font-bold text-white">BS. CKI Trần Minh Đức</p>
                  <span className="text-[10px] text-slate-400 font-mono">Bác sĩ chủ trì</span>
                </div>
              </div>

              <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60">
                E2EE Kết nối tốt
              </span>
            </div>

          </div>

          {/* Right: Interactive Tabs (Canvas, SOAP, Chat) (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col bg-white overflow-hidden border-l border-slate-100">
            
            {/* Tabs Selector */}
            <div className="flex items-center border-b border-slate-100 p-2 gap-2 bg-slate-50">
              <button
                onClick={() => setActiveTab("canvas")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "canvas" ? "bg-white text-oceanic shadow-xs" : "text-slate-600 hover:text-oceanic"
                }`}
              >
                <span>Thị giác AI vết thương</span>
              </button>

              <button
                onClick={() => setActiveTab("soap")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "soap" ? "bg-white text-oceanic shadow-xs" : "text-slate-600 hover:text-oceanic"
                }`}
              >
                <span>Bệnh án SOAP & Ký số</span>
              </button>

              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "chat" ? "bg-white text-oceanic shadow-xs" : "text-slate-600 hover:text-oceanic"
                }`}
              >
                <span>Tin nhắn ({chatMessages.length})</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              
              {/* Tab 1: Synchronized Canvas */}
              {activeTab === "canvas" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-oceanic font-heading">{wound.title}</span>
                    <span className="font-mono text-slate-500">Mốc quét: Ngày {activeSnapshot.dayIndex}</span>
                  </div>

                  <WoundCanvas
                    imageUrl={activeSnapshot.imageUrl}
                    rybMetrics={activeSnapshot.rybMetrics}
                    calibration={activeSnapshot.calibration}
                    totalAreaCm2={activeSnapshot.totalAreaCm2}
                    whiScore={activeSnapshot.whiScore}
                    interactive={true}
                  />
                </div>
              )}

              {/* Tab 2: SOAP Editor & Electronic Signing */}
              {activeTab === "soap" && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Đánh giá của Bác sĩ (Assessment):
                    </label>
                    <textarea
                      rows={3}
                      value={assessment}
                      onChange={(e) => setAssessment(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 text-xs text-slate-800 focus:border-oceanic focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Kế hoạch điều trị & Gạc chỉ định (Plan):
                    </label>
                    <textarea
                      rows={3}
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-3 text-xs text-slate-800 focus:border-oceanic focus:bg-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleApprove}
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs transition-all"
                  >
                    <span>{isSigned ? "Đã ký số thành công!" : "Ký số SOAP Note & gửi máy bệnh nhân"}</span>
                  </button>
                </div>
              )}

              {/* Tab 3: Direct Consultation Chat */}
              {activeTab === "chat" && (
                <div className="h-full flex flex-col justify-between space-y-4">
                  <div className="space-y-3 overflow-y-auto max-h-[300px] p-2">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                          <span className="font-bold text-oceanic">{msg.sender}</span>
                          <span>{msg.time}</span>
                        </div>
                        <p className="text-slate-800">{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 rounded-2xl border border-slate-300 px-4 py-2.5 text-xs text-slate-800 focus:border-oceanic focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-2xl bg-oceanic text-xs font-bold text-white hover:bg-oceanic-800"
                    >
                      <span>Gửi</span>
                    </button>
                  </form>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
