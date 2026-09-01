"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { DBStore } from "@/lib/db-store";
import { ChatMessage } from "@/types/medical-schema";

interface ChatRoomProps {
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
}

export function ChatRoom({ doctorId, doctorName, patientId, patientName }: ChatRoomProps) {
  const { user } = useAuth();
  const threadId = `chat_${doctorId}_${patientId}`;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load and subscribe to messages
  useEffect(() => {
    const loadMessages = () => {
      const msgs = DBStore.getMessages(threadId);
      setMessages(msgs);
      if (user) {
        DBStore.markMessagesAsRead(threadId, user.id);
      }
    };

    loadMessages();

    const handleNewMessage = (e: CustomEvent<ChatMessage>) => {
      if (e.detail.threadId === threadId) {
        loadMessages();
      }
    };

    window.addEventListener("LANT_NEW_MESSAGE" as any, handleNewMessage);
    const interval = setInterval(loadMessages, 2500);

    return () => {
      window.removeEventListener("LANT_NEW_MESSAGE" as any, handleNewMessage);
      clearInterval(interval);
    };
  }, [threadId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachmentUrl) return;
    if (!user) return;

    const isDoctor = user.role === "CLINICIAN";
    const newMsg: ChatMessage = {
      id: `MSG-${Date.now()}`,
      threadId,
      senderId: user.id,
      senderName: user.fullName,
      receiverId: isDoctor ? patientId : doctorId,
      content: inputText.trim(),
      attachmentUrl: attachmentUrl || undefined,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    DBStore.sendMessage(newMsg);
    setMessages(prev => [...prev, newMsg]);
    setInputText("");
    setAttachmentUrl(null);
  };

  const handleAttachPresetImage = (url: string) => {
    setAttachmentUrl(url);
  };

  return (
    <div className="flex flex-col h-[520px] rounded-3xl bg-white/95 border border-oceanic-100/70 shadow-clinical overflow-hidden">
      
      {/* Chat Thread Header */}
      <div className="p-4 border-b border-oceanic-100/70 bg-azure-mist/50 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-oceanic font-heading">
              {user?.role === "CLINICIAN" ? `Trao đổi với: ${patientName}` : `Bác sĩ phụ trách: ${doctorName}`}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <p className="text-[10px] text-dusk-500 font-mono">
            Mã hội thoại: {threadId} • Cách ly bảo mật y tế
          </p>
        </div>

        <span className="px-2.5 py-1 bg-white rounded-full text-[10px] font-bold text-sapphire border border-oceanic-200">
          Kênh 1-on-1 trực tiếp
        </span>
      </div>

      {/* Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <p className="text-xs font-medium">Chưa có tin nhắn nào trong kênh này.</p>
            <p className="text-[11px] mt-1 text-slate-400">Hãy gửi tin nhắn đầu tiên để bắt đầu trao đổi về vết thương.</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMine = m.senderId === user?.id;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
              >
                <span className="text-[10px] text-slate-400 font-mono mb-0.5 px-1">
                  {m.senderName} • {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                <div
                  className={`max-w-[80%] rounded-2xl p-3.5 text-xs font-medium shadow-2xs leading-relaxed ${
                    isMine
                      ? "bg-oceanic text-white rounded-tr-xs"
                      : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs"
                  }`}
                >
                  {m.attachmentUrl && (
                    <div className="mb-2 rounded-xl overflow-hidden border border-white/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.attachmentUrl} alt="Ảnh đính kèm" className="max-h-48 w-full object-cover" />
                    </div>
                  )}
                  <p>{m.content}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview Bar */}
      {attachmentUrl && (
        <div className="px-4 py-2 bg-azure-mist/80 border-t border-oceanic-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-oceanic font-bold">Đã đính kèm ảnh:</span>
            <span className="text-[10px] text-slate-600 truncate max-w-xs">{attachmentUrl}</span>
          </div>
          <button
            type="button"
            onClick={() => setAttachmentUrl(null)}
            className="text-[10px] text-red-600 hover:underline font-bold"
          >
            Gỡ bỏ
          </button>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-oceanic-100 flex items-center gap-2">
        
        {/* Quick Attachment Preset Button */}
        <button
          type="button"
          onClick={() => handleAttachPresetImage("/presets/sample_1.jpg")}
          className="px-3 py-2 bg-slate-100 text-slate-600 hover:text-oceanic hover:bg-oceanic-50 rounded-xl text-xs font-bold transition-colors shrink-0"
          title="Đính kèm ảnh vết thương mẫu"
        >
          <span>Đính kèm ảnh</span>
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Nhập nội dung trao đổi lâm sàng..."
          className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-oceanic focus:outline-none"
        />

        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-oceanic text-white text-xs font-bold hover:bg-oceanic-800 shadow-xs transition-colors shrink-0"
        >
          <span>Gửi tin</span>
        </button>
      </form>

    </div>
  );
}
