"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { VIETNAM_PROVINCES } from "@/lib/vietnam-address-data";

export default function PatientProfilePage() {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("1964-04-12");
  const [gender, setGender] = useState<"Nam" | "Nữ" | "Khác">("Nam");
  const [medicalRecordNumber, setMedicalRecordNumber] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>("/presets/avatar_an.jpg");

  // Address Cascading State
  const [province, setProvince] = useState("Thành phố Hồ Chí Minh");
  const [district, setDistrict] = useState("Quận 1");
  const [ward, setWard] = useState("Phường Bến Thành");
  const [street, setStreet] = useState("128 Đường Nguyễn Trãi");

  // Webcam Capture State
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Toast Notification State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Sync initial user data
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      if (user.dob) setDob(user.dob);
      if (user.gender) setGender(user.gender);
      if (user.medicalRecordNumber) setMedicalRecordNumber(user.medicalRecordNumber);
      if (user.medicalHistory) setMedicalHistory(user.medicalHistory);
      if (user.avatarUrl) setAvatarUrl(user.avatarUrl);

      if (user.address) {
        setProvince(user.address.province || "Thành phố Hồ Chí Minh");
        setDistrict(user.address.district || "Quận 1");
        setWard(user.address.ward || "Phường Bến Thành");
        setStreet(user.address.street || "");
      }
    }
  }, [user]);

  // Derived Districts and Wards based on selections
  const currentProvinceObj = VIETNAM_PROVINCES.find((p) => p.name === province) || VIETNAM_PROVINCES[0];
  const districtList = currentProvinceObj?.districts || [];
  const currentDistrictObj = districtList.find((d) => d.name === district) || districtList[0];
  const wardList = currentDistrictObj?.wards || [];

  const handleProvinceChange = (newProvince: string) => {
    setProvince(newProvince);
    const prov = VIETNAM_PROVINCES.find((p) => p.name === newProvince);
    if (prov && prov.districts.length > 0) {
      setDistrict(prov.districts[0].name);
      setWard(prov.districts[0].wards[0] || "");
    }
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    const dist = districtList.find((d) => d.name === newDistrict);
    if (dist && dist.wards.length > 0) {
      setWard(dist.wards[0]);
    }
  };

  // Webcam Controls
  const startWebcam = async () => {
    setIsWebcamActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      alert("Không thể kết nối webcam. Vui lòng kiểm tra quyền truy cập camera.");
      setIsWebcamActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 400;
      canvas.height = videoRef.current.videoHeight || 400;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setAvatarUrl(dataUrl);
      }
      stopWebcam();
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsWebcamActive(false);
  };

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Phone auto-formatter (+84 / 09xx)
  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/[^\d+]/g, "");
    setPhone(cleaned);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName,
      phone,
      dob,
      gender,
      medicalHistory,
      avatarUrl,
      address: {
        province,
        district,
        ward,
        street
      }
    });

    setToastMessage("Hồ sơ bệnh nhân đã được cập nhật thành công!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans max-w-5xl mx-auto space-y-8 pb-32">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-oceanic-100/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-dusk-500 font-mono mb-1">
            <Link href="/patient/dashboard" className="hover:text-oceanic font-medium">Bảng điều khiển</Link>
            <span>/</span>
            <span className="text-oceanic font-bold">Hồ sơ cá nhân</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-oceanic font-heading tracking-tight">
            Quản lý hồ sơ y tế bệnh nhân
          </h1>
          <p className="text-xs text-dusk-500 mt-0.5">
            Cập nhật thông tin hành chính, địa chỉ và tiền sử bệnh để bác sĩ theo dõi chính xác
          </p>
        </div>

        <div className="text-right">
          <span className="inline-block px-3 py-1 bg-oceanic-50 text-oceanic rounded-full text-xs font-mono font-bold border border-oceanic-200">
            {medicalRecordNumber || "MRN-2024-8841"}
          </span>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-8">
        
        {/* Section 1: Avatar & Identity */}
        <div className="bg-white/95 rounded-3xl p-6 sm:p-8 shadow-clinical border border-oceanic-100/70 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-oceanic font-heading">
              1. Ảnh chân dung & Nhận diện
            </h2>
            <p className="text-xs text-slate-500">Chụp ảnh trực tiếp từ webcam hoặc tải lên từ thiết bị</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar Preview */}
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-oceanic/30 shadow-md bg-slate-100 shrink-0 flex items-center justify-center">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-oceanic text-white text-3xl font-black font-heading">
                  {fullName ? fullName.trim().charAt(0).toUpperCase() : "A"}
                </div>
              )}
            </div>

            {/* Webcam / Upload Actions */}
            <div className="space-y-3 flex-1">
              {isWebcamActive ? (
                <div className="space-y-3">
                  <div className="relative w-64 h-48 rounded-2xl overflow-hidden bg-black border border-slate-300 shadow-inner">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-4 py-2 bg-oceanic text-white text-xs font-bold rounded-xl hover:bg-oceanic-800 transition-colors shadow-xs"
                    >
                      Chụp ảnh này
                    </button>
                    <button
                      type="button"
                      onClick={stopWebcam}
                      className="px-3 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      Hủy bỏ
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={startWebcam}
                    className="px-4 py-2.5 bg-oceanic-50 text-oceanic border border-oceanic-200 text-xs font-bold rounded-xl hover:bg-oceanic-100 transition-all shadow-2xs"
                  >
                    Chụp ảnh từ webcam
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 bg-white text-slate-700 border border-slate-300 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all shadow-2xs"
                  >
                    Tải ảnh từ máy tính
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}
              <p className="text-[11px] text-slate-400 font-mono">
                Định dạng hỗ trợ: JPG, PNG. Ảnh chân dung rõ mặt để xác thực y tế.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Personal Information */}
        <div className="bg-white/95 rounded-3xl p-6 sm:p-8 shadow-clinical border border-oceanic-100/70 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-oceanic font-heading">
              2. Thông tin hành chính & Liên lạc
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-heading">
                Họ và tên đầy đủ:
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn An"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-oceanic focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-heading">
                Ngày tháng năm sinh:
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-oceanic focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 font-heading">
                Giới tính:
              </label>
              <div className="flex gap-4">
                {(["Nam", "Nữ", "Khác"] as const).map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={gender === g}
                      onChange={() => setGender(g)}
                      className="accent-oceanic"
                    />
                    <span>{g}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-heading">
                Số điện thoại (Nhận thông báo lịch tái khám):
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="0918 234 567"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-oceanic focus:outline-none font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1 font-heading">
                Địa chỉ email:
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-500 font-mono cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">Email được dùng làm tài khoản đăng nhập cố định.</span>
            </div>
          </div>
        </div>

        {/* Section 3: Cascading Vietnam Address Selector */}
        <div className="bg-white/95 rounded-3xl p-6 sm:p-8 shadow-clinical border border-oceanic-100/70 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-oceanic font-heading">
              3. Địa chỉ cư trú (Việt Nam)
            </h2>
            <p className="text-xs text-slate-500">Phục vụ điều phối bác sĩ và gửi đơn thuốc/băng gạc tại gia</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-heading">
                Tỉnh / Thành phố:
              </label>
              <select
                value={province}
                onChange={(e) => handleProvinceChange(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-medium text-slate-800 focus:border-oceanic focus:outline-none"
              >
                {VIETNAM_PROVINCES.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-heading">
                Quận / Huyện:
              </label>
              <select
                value={district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-medium text-slate-800 focus:border-oceanic focus:outline-none"
              >
                {districtList.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-heading">
                Phường / Xã:
              </label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-medium text-slate-800 focus:border-oceanic focus:outline-none"
              >
                {wardList.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1 font-heading">
                Số nhà, tên đường, khu phố:
              </label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="128 Đường Nguyễn Trãi, Khu phố 4"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-oceanic focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Medical History & Comorbidities */}
        <div className="bg-white/95 rounded-3xl p-6 sm:p-8 shadow-clinical border border-oceanic-100/70 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-oceanic font-heading">
              4. Tiền sử y khoa & Bệnh lý nền
            </h2>
            <p className="text-xs text-slate-500">Các yếu tố ảnh hưởng trực tiếp đến tốc độ tưới máu và liền sẹo vết thương</p>
          </div>

          <div>
            <textarea
              rows={4}
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              placeholder="Ví dụ: Đái tháo đường Type 2 (12 năm, HbA1c 7.8%), Tăng huyết áp đang uống Amlodipine 5mg. Dị ứng thuốc kháng sinh nhóm Penicillin và cồn đỏ Povidone Iodine..."
              className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-xs font-medium text-slate-800 focus:border-oceanic focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Floating Action Bar at Bottom Right */}
        <div className="fixed bottom-6 right-6 z-40">
          <button
            type="submit"
            className="px-6 py-3.5 bg-oceanic text-white text-xs font-bold rounded-2xl shadow-xl hover:bg-oceanic-800 hover:shadow-2xl transition-all flex items-center gap-2 border border-white/20 backdrop-blur-md"
          >
            <span>Cập nhật hồ sơ y tế</span>
          </button>
        </div>
      </form>

      {/* Instant Toast Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold font-heading border border-emerald-400/40 animate-fade-in flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
