# LANT — PROJECT MANIFEST & TRUTH BASELINE
# Lesion Analysis & Necrotic Tissue Vision System
# ==============================================================================

## 1. MISSION STATEMENT
"Phát triển LANT — Hệ thống Thị giác Máy tính Y tế cá nhân hóa và bảo mật, sử dụng các mô hình AI tiên tiến để tự động phân tích hình thái, đo kích thước cm²/cm³ và theo dõi tiến trình của đa dạng các loại vết thương hở. Hệ thống nhằm mục đích cung cấp cảnh báo nhiễm trùng sớm và khuyến nghị phác đồ chăm sóc tại gia cho người dùng, đồng thời hỗ trợ y tế cơ sở thông qua nền tảng Telehealth y khoa được chuẩn hóa."

---

## 2. CLINICAL DESIGN TOKENS (MONOCHROMATIC CLINICAL BLUE)
- **Primary Brand / Oceanic Azure**: `#002B8C` (Hero components, main CTA, active borders, brand headers)
- **Secondary Accent / Dusk Blue**: `#3E5D8E` (Subheaders, secondary actions, soft borders, card labels)
- **Interactive Accent / Sapphire**: `#0F52BA` (Links, tabs, highlights, active chart lines, focus states)
- **Surface Light / Azure Mist**: `#F0FFFF` (Card background highlights, badge fills, soft alerts, tint backgrounds)
- **Deep Contrast / Indigo Blue**: `#282888` (Dark text, deep contrast containers, sidebar accents)
- **Medical Semantic Flags**:
  - **Granulation (Red)**: `#DC2626` (Viable healing tissue, capillary loops)
  - **Slough (Yellow)**: `#F59E0B` (Fibrinous slough, bio-burden / infection risk)
  - **Necrotic (Black)**: `#111827` (Eschar / devitalized tissue hazard)
  - **Epithelial (Pink)**: `#EC4899` (Marginal re-epithelialization / closure)
  - **Safe Healing (Green)**: `#10B981` (Positive delta, reduction on track)

---

## 3. CLINICAL MATHEMATICAL FORMULAS
1. **Pixel-to-Physical Calibration**:
   $$\text{Ratio} = \frac{\text{Known Dimension (cm)}}{\text{Marker Pixels (px)}} \quad (\text{cm/px})$$
   $$\text{Area } (\text{cm}^2) = \text{Wound Mask Pixels} \times \text{Ratio}^2$$

2. **Tissue RYB Composition**:
   $$\text{Total Mask Area} = P_{\text{Red}} + P_{\text{Yellow}} + P_{\text{Black}} + P_{\text{Pink}} = 100\%$$

3. **Wound Health Index (WHI)**:
   $$\text{WHI} = \operatorname{Clamp}_{0}^{100}\left( (P_{\text{Red}} \times 1.0) + (P_{\text{Pink}} \times 1.2) - (P_{\text{Yellow}} \times 1.5) - (P_{\text{Black}} \times 3.0) \right)$$

4. **Recovery Delta**:
   $$\Delta_{\text{Prev}} = \frac{\text{Area}_{t-1} - \text{Area}_t}{\text{Area}_{t-1}} \times 100\%$$
   $$\Delta_{\text{Base}} = \frac{\text{Area}_0 - \text{Area}_t}{\text{Area}_0} \times 100\%$$

5. **Smart Critical Alert Thresholds**:
   - **EMERGENCY CRITICAL**: $P_{\text{Black}} \ge 10\%$ OR $P_{\text{Yellow}} \ge 35\%$
   - **WARNING ALERT**: $\Delta_{\text{Prev}} < -10\%$ (Wound area expanding)

---

## 4. SYSTEM ROUTES & APPLICATION MAP
- `/` - Portal Gateway (Patient vs Clinician entry)
- `/scan` - Wound Capture, Perspective/Lighting Check, ArUco Calibration & Clinical Intake Survey
- `/dashboard` - Patient Clinical Dashboard, RYB Multi-layer Canvas, Recovery Curves & Dressing Recommender
- `/archive` - Resolved/Healed Cases Archive with time-to-closure metrics
- `/clinician` - Clinician Risk Triage Queue (sorted by severity)
- `/clinician/[patientId]` - Remote Case Review, Time-Series Scrubber & Live Telehealth Video Call Consultation
