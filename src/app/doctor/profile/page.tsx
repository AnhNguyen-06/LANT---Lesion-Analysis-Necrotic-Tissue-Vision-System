"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { VIETNAM_PROVINCES } from "@/lib/vietnam-address-data";

export default function DoctorProfilePage() {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [dob, setDob] = useState("1983-09-15");
  const [gender, setGender] = useState<"Nam" | "Nữ" | "Khác">("Nam");
  const [avatarUrl, setAvatarUrl] = useState<string>("/presets/avatar_duc.jpg");

  // Address Cascading State
  const [province, setProvince] = useState("Thành phố Hồ Chí Minh");
  const [district, setDistrict] = useState("Quận 5");
  const [ward, setWard] = useState("Phường 12");
  const [street, setStreet] = useState("201 Đường Nguyễn Chí Thanh");

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
      if (user.licenseNumber) setLicenseNumber(user.licenseNumber);
      if (user.specialty) setSpecialty(user.specialty);
      if (user.avatarUrl) setAvatarUrl(user.avatarUrl);

      if (user.address) {
        setProvince(user.address.province || "Thành phố Hồ Chí Minh");
        setDistrict(user.address.district || "Quận 5");
        setWard(user.address.ward || "Phường 12");
        setStreet(user.address.street || "");
      }
    }
  }, [user]);

  // Derived Districts and Wards
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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName,
      phone,
      dob,
      gender,
      licenseNumber,
      specialty,
      avatarUrl,
      address: {
        province,
        district,
        ward,
        street
      }
    });

    setToastMessage("Hồ sơ bác sĩ / chuyên gia đã được lưu thành công!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans max-w-5xl mx-auto space-y-8 pb-32">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-oceanic-100/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-dusk-500 font-mono mb-1">
            <Link href="/doctor/dashboard" className="hover:text-oceanic font-medium">Bảng điều phối</Link>
            <span>/</span>
            <span className="text-oceanic font-bold">Hồ sơ bác sĩ</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-oceanic font-heading tracking-tight">
            Quản lý hồ sơ bác sĩ & Chuyên môn
          </h1>
          <p className="text-xs text-dusk-500 mt-0.5">
            Thông tin chứng chỉ hành nghề CCHN và chữ ký số điện tử trên bệnh án EMR
          </p>
        </div>

        <div className="text-right">
          <span className="inline-block px-3 py-1 bg-indigoContrast/10 text-indigoContrast rounded-full text-xs font-mono font-bold border border-indigoContrast/20">
            {licenseNumber || "CCHN-2021-8842"}
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSaveProfile} className="space-y-8">
        
        {/* Section 1: Avatar */}
        <div className="bg-white/95 rounded-3xl p-6 sm:p-8 shadow-clinical border border-oceanic-100/70 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-oceanic font-heading">
              1. Ảnh chân dung bác sĩ
            </h2>
            <p className="text-xs text-slate-500">Hiển thị trong phòng hội chẩn Telehealth và trên con dấu bệnh án điện tử SOAP</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-indigoContrast/30 shadow-md bg-slate-100 shrink-0 flex items-center justify-center">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigoContrast text-white text-3xl font-black font-heading">
                  {fullName ? fullName.trim().charAt(0).toUpperCase() : "D"}
                </div>
              )}
            </div>

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
                      className="px-4 py-2 bg-indigoContrast text-white text-xs font-bold rounded-xl hover:bg-indigo-950 transition-colors shadow-xs"
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
                    className="px-4 py-2.5 bg-indigoContrast/10 text-indigoContrast border border-indigoContrast/20 text-xs font-bold rounded-xl hover:bg-indigoContrast/20 transition-all shadow-2xs"
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
                Định dạng hỗ trợ: JPG, PNG. Ảnh trang phục blouse y tế chính quy.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Clinical Details */}
        <div className="bg-white/95 rounded-3xl p-6 sm:p-8 shadow-clinical border border-oceanic-100/70 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-oceanic font-heading">
              2. Thông tin bác sĩ & Chứng chỉ hành nghề
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-heading">
                Họ và tên bác sĩ:
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="BS. CKI Trần Minh Đức"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-oceanic focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-heading">
                Số chứng chỉ hành nghề (CCHN):
              </label>
              <input
                type="text"
                required
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="CCHN-2021-8842"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-oceanic focus:outline-none font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1 font-heading">
                Chuyên khoa & Bệnh viện công tác:
              </label>
              <input
                type="text"
                required
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Chuyên khoa Chăm sóc Vết thương & Phẫu thuật Chấn thương — Bệnh viện Chợ Rẫy"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-oceanic focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-heading">
                Số điện thoại liên hệ chuyên môn:
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0908 765 432"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-oceanic focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-heading">
                Email bệnh viện:
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-500 font-mono cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Clinic Location */}
        <div className="bg-white/95 rounded-3xl p-6 sm:p-8 shadow-clinical border border-oceanic-100/70 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-oceanic font-heading">
              3. Cơ sở y tế / Phòng khám phụ trách
            </h2>
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
                Địa chỉ cụ thể:
              </label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="201 Đường Nguyễn Chí Thanh, Khoa Ngoại Chấn Thương"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-oceanic focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6 z-40">
          <button
            type="submit"
            className="px-6 py-3.5 bg-indigoContrast text-white text-xs font-bold rounded-2xl shadow-xl hover:bg-indigo-950 hover:shadow-2xl transition-all flex items-center gap-2 border border-white/20 backdrop-blur-md"
          >
            <span>Cập nhật hồ sơ bác sĩ</span>
          </button>
        </div>
      </form>

      {/* Toast */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold font-heading border border-emerald-400/40 animate-fade-in flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
