# LANT — ENTERPRISE PROJECT MANIFEST & ARCHITECTURAL BASELINE
# Lesion Analysis & Necrotic Tissue Vision System (Clinical Telehealth Platform)
# ==============================================================================

## 1. MISSION STATEMENT
"Phát triển LANT — Hệ thống Thị giác Máy tính Y tế và Nền tảng Telehealth Chăm sóc Vết thương Hở Đa Người Dùng (Multi-User Clinical Wound Telehealth Platform). Sử dụng các mô hình AI tiên tiến để tự động phân tích hình thái, hiệu chuẩn kích thước thực tế cm²/cm³ qua thước ArUco 2.0 cm, đo lường độ rọi sáng (Luminance Quality Meter), tính toán chỉ số sức khỏe vết thương (WHI) và phân tách 4 lớp mô học RYB theo tiêu chuẩn EWMA & WUWHS. Tích hợp phân quyền nghiêm ngặt giữa Bệnh nhân và Bác sĩ chuyên khoa, hệ thống gọi Telehealth bất đối xứng, phòng hội chẩn WebRTC, nhắn tin 1-on-1 cách ly và ký số bệnh án điện tử SOAP chuẩn hóa."

---

## 2. BRAND AESTHETICS & VIETNAMESE TYPOGRAPHY RULES
- **No AI Clichés**: Tuyệt đối không dùng icon `Sparkles`, `Wand2` hay từ ngữ "AI Magic/Gemini Agentic". Tất cả là công cụ thị giác y khoa chuyên nghiệp (**LANT Vision AI**).
- **Typography Pairing**:
  * **Hero & Elegant Accents**: `Playfair Display` (font-editorial italic) — Thẩm mỹ bay bổng, thanh lịch.
  * **Headings & Navigation**: `Montserrat` (font-heading font-bold/semibold) — Hiện đại, sắc nét, hỗ trợ 100% tiếng Việt không lỗi font.
  * **Body & Clinical Text**: `Poppins` (font-sans) — Dễ đọc, thoáng đãng.
  * **Telemetry & Data**: `JetBrains Mono` (font-mono) — Số đo cm², WHI, Lux, tọa độ, mã MRN/CCHN.
- **Palette**:
  * Oceanic Azure (Primary Brand CTA): `#002B8C`
  * Dusk Blue (Borders / Accents): `#3E5D8E`
  * Sapphire (Interactive Data): `#0F52BA`
  * Azure Mist (Surface Fill): `#F0FFFF`
  * Deep Indigo (Doctor Clinical Space): `#282888`
  * Semantic RYB: Granulation Red `#DC2626`, Slough Yellow `#F59E0B`, Necrotic Black `#111827`, Epithelial Pink `#EC4899`, Safe Green `#10B981`.

---

## 3. MULTI-TENANT ISOLATED RELATIONAL PERSISTENCE (DB-STORE)
- **Engine**: `/src/lib/db-store.ts` (LocalStorage with JSON Schema Validation & In-Memory Fallback).
- **Entities**:
  * `users`: `id`, `email`, `phone`, `passwordHash`, `role` ('PATIENT' | 'DOCTOR'), `fullName`, `dob`, `gender`, `avatarUrl`, `address` { street, ward, district, province }, `medicalHistory`, `assignedDoctorId`, `tourCompleted`, `createdAt`.
  * `wound_profiles`: `id`, `patientId`, `name`, `bodyLocation`, `status` ('ACTIVE' | 'HEALED' | 'CRITICAL'), `createdAt`, `updatedAt`, `baselineAreaCm2`, `currentAreaCm2`, `currentWHI`.
  * `snapshot_logs`: `id`, `woundId`, `patientId`, `imageUrl`, `maskOverlayUrl`, `areaCm2`, `whiScore`, `rybRatio` { red, yellow, black, pink }, `painScale`, `notes`, `timestamp`, `calibration`, `hazardStatus`, `hazardReasons`, `recommendation`, `survey`.
  * `appointments`: `id`, `doctorId`, `patientId`, `scheduledAt`, `status` ('SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'), `notes`, `woundTitle`.
  * `messages`: `id`, `threadId` (`chat_{doctorId}_{patientId}`), `senderId`, `receiverId`, `content`, `attachmentUrl`, `timestamp`, `isRead`.
  * `signed_soap_records`: `id`, `woundId`, `patientId`, `doctorId`, `subjective`, `objective`, `assessment`, `plan`, `doctorSignature` { signedAt, certificateId, doctorName, licenseNumber }, `status` ('SIGNED' | 'AMENDED').

---

## 4. SEED DEMO ACCOUNTS
- **Patients**:
  * `patient.an@lant.med` / `patient123` (Nguyễn Văn An - PAT-10842 - Loét bàn chân đái tháo đường Wagner II)
  * `patient.mai@lant.med` / `patient123` (Trần Thị Mai - PAT-20931 - Loét tì đè vùng cùng cụt Độ III - Critical)
  * `patient.long@lant.med` / `patient123` (Lê Hoàng Long - PAT-30419 - Vết mổ hở thành bụng)
- **Doctors**:
  * `doctor.duc@lant.med` / `doctor123` (BS. CKI Trần Minh Đức - CCHN-2021-8842 - BV Chợ Rẫy)
  * `doctor.huong@lant.med` / `doctor123` (BS. CKII Nguyễn Thu Hương - CCHN-2018-5521 - BV Bạch Mai)
- **New Registered Users**: Hoàn toàn cách ly trong sandbox riêng biệt.

---

## 5. ROUTE MAP & ROLE SEPARATION (RBAC)
- **Public**: `/` (Root Role Gateway), `/auth/login`, `/auth/register`.
- **Patient Portal (`/patient/*`)**:
  * `/patient/dashboard`: Tổng quan bệnh án cá nhân, EMR đã ký SOAP, biểu đồ phục hồi.
  * `/patient/scan`: Live camera + Máy đo độ rọi sáng Luminance Analyzer + Hiệu chuẩn ArUco 2.0 cm.
  * `/patient/archive`: Kho ca bệnh đã liền 100%.
  * `/patient/telehealth`: Đặt lịch hẹn, phòng Telehealth nhận cuộc gọi đến, Chat 1-on-1 với bác sĩ.
  * `/patient/profile`: Quản lý hồ sơ, chụp webcam avatar, địa chỉ Việt Nam 3 cấp, tiền sử bệnh.
- **Doctor Portal (`/doctor/*`)**:
  * `/doctor/dashboard`: Bảng phân luồng nguy cơ Triage, hàng đợi bệnh nhân, danh sách lịch hẹn hôm nay.
  * `/doctor/telehealth`: Quản lý phiên hội chẩn từ xa, kích hoạt cuộc gọi Telehealth đến bệnh nhân.
  * `/doctor/patient/[id]`: Trình xem bệnh án đối chiếu Day 0 vs Day N, thanh tua thời gian, trình soạn & ký số điện tử SOAP.
  * `/doctor/profile`: Hồ sơ bác sĩ, chứng chỉ hành nghề CCHN, chuyên khoa.
