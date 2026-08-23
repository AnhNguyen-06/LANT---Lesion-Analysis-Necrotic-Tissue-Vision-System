# LANT — PROJECT MANIFEST & TRUTH BASELINE
# Lesion Analysis & Necrotic Tissue Vision System
# ==============================================================================

## 1. MISSION STATEMENT
"Phát triển LANT — Hệ thống Thị giác Máy tính Y tế cá nhân hóa và bảo mật, sử dụng các mô hình AI tiên tiến để tự động phân tích hình thái, đo kích thước cm²/cm³ và theo dõi tiến trình của đa dạng các loại vết thương hở. Hệ thống cung cấp cảnh báo nhiễm trùng sớm và khuyến nghị phác đồ chăm sóc tại gia cho người dùng, đồng thời hỗ trợ y tế cơ sở thông qua nền tảng Telehealth y khoa được chuẩn hóa."

---

## 2. BESPOKE VIETNAMESE TYPOGRAPHY & DESIGN SYSTEM
- **Hero & Elegant Accents**: `Playfair Display` (font-serif font-playfair italic) — Nét thẩm mỹ bay bổng, thanh thoát, uyển chuyển.
- **Headings & Navigation**: `Montserrat` (font-sans font-montserrat tracking-tight font-bold/semibold) — Hiện đại, sắc nét, hỗ trợ 100% tiếng Việt không lỗi font.
- **Body & Clinical Data**: `Poppins` (font-sans font-poppins) — Rõ ràng, dễ đọc trên mọi thiết bị.
- **Telemetry & Numbers**: `JetBrains Mono` (font-mono font-mono-data) — Tọa độ, cm², WHI, % mô học.

### Clinical Monochrome Blue Palette
- **Oceanic Azure (Brand / Primary CTA)**: `#002B8C`
- **Dusk Blue (Secondary Accents / Borders)**: `#3E5D8E`
- **Sapphire (Interactive Links & Charts)**: `#0F52BA`
- **Azure Mist (Card Fills / Backdrops)**: `#F0FFFF`
- **Indigo Contrast (Doctor Portal Accents)**: `#282888`
- **Medical RYB**: Red `#DC2626`, Yellow `#F59E0B`, Black `#111827`, Pink `#EC4899`, Safe Green `#10B981`.

---

## 3. STRICT ROUTE MAP & ROLE SEPARATION (RBAC)

```
                       ┌──────────────────────────────────────────────┐
                       │          ROOT GATEWAY: /                     │
                       │     "Chọn vai trò của bạn để tiếp tục"       │
                       └──────────────────────┬───────────────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
         [ROLE: BỆNH NHÂN]                                [ROLE: BÁC SĨ / CHUYÊN GIA]
  ┌─────────────────────────────────────┐         ┌─────────────────────────────────────┐
  │ Auth: /auth/login?role=patient      │         │ Auth: /auth/login?role=doctor       │
  │ Route Group: /patient/*             │         │ Route Group: /doctor/*              │
  ├─────────────────────────────────────┤         ├─────────────────────────────────────┤
  │ PATIENT WORKSPACE:                  │         │ DOCTOR WORKSPACE:                   │
  │ • /patient/dashboard (Tổng quan)    │         │ • /doctor/dashboard (Triage Rủi ro) │
  │ • /patient/scan (Chụp & Đo ArUco)   │         │ • /doctor/telehealth (Hội chẩn)     │
  │ • /patient/archive (Kho đã liền)    │         │ • /doctor/patient/[id] (Ký SOAP)    │
  │ • /patient/telehealth (Liên hệ BS)  │         │ ──> KHÔNG CÓ nút Chụp ArUco         │
  │ ──> Bị chặn tuyệt đối khỏi /doctor/*│         │ ──> KHÔNG CÓ nút Kho đã liền        │
  └─────────────────────────────────────┘         └─────────────────────────────────────┘
```

---

## 4. CLINICAL MATHEMATICAL FORMULAS

### 1. Pixel-to-Physical Calibration
$$
\text{Ratio} = \frac{\text{Known Dimension (cm)}}{\text{Marker Pixels (px)}}
$$

$$
\text{Area (cm}^2\text{)} = \text{Wound Mask Pixels} \times \text{Ratio}^2
$$

### 2. Tissue RYB Composition
$$
\text{Total Mask Area} = P_{\text{Red}} + P_{\text{Yellow}} + P_{\text{Black}} + P_{\text{Pink}} = 100
$$

### 3. Wound Health Index (WHI)
$$
\text{WHI} = \text{Clamp}_{0}^{100}\left( (P_{\text{Red}} \times 1.0) + (P_{\text{Pink}} \times 1.2) - (P_{\text{Yellow}} \times 1.5) - (P_{\text{Black}} \times 3.0) \right)
$$

### 4. Recovery Delta
$$
\Delta_{\text{Prev}} = \frac{\text{Area}_{t-1} - \text{Area}_t}{\text{Area}_{t-1}} \times 100
$$

$$
\Delta_{\text{Base}} = \frac{\text{Area}_0 - \text{Area}_t}{\text{Area}_0} \times 100
$$

### 5. Smart Critical Alert Thresholds
- **EMERGENCY CRITICAL**: $P_{\text{Black}} \ge 10\%$ OR $P_{\text{Yellow}} \ge 35\%$
- **WARNING ALERT**: $\Delta_{\text{Prev}} < -10\%$
