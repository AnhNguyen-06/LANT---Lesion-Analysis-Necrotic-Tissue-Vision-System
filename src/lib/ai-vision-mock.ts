import { 
  CalibrationData, 
  DressingRecommendation, 
  HazardSeverity, 
  LightingStatus, 
  RYBMetrics, 
  SnapshotLog, 
  SurveyData 
} from "@/types/medical-schema";

/**
 * Calculates the Wound Health Index (WHI) using the strict clinical formula:
 * WHI = Clamp_0_100( (%Red * 1.0) + (%Pink * 1.2) - (%Yellow * 1.5) - (%Black * 3.0) )
 */
export function calculateWHI(metrics: {
  redPercent: number;
  yellowPercent: number;
  blackPercent: number;
  pinkPercent: number;
}): number {
  const rawScore = 
    (metrics.redPercent * 1.0) + 
    (metrics.pinkPercent * 1.2) - 
    (metrics.yellowPercent * 1.5) - 
    (metrics.blackPercent * 3.0);
  
  return Math.round(Math.max(0, Math.min(100, rawScore)));
}

/**
 * Calculates physical area in cm^2 based on calibration ratio and mask pixel count
 */
export function calculatePhysicalArea(maskPixels: number, cmPerPixel: number): number {
  return Number((maskPixels * Math.pow(cmPerPixel, 2)).toFixed(2));
}

/**
 * Evaluates clinical hazard level based on RYB percentages and recovery delta
 */
export function evaluateHazardStatus(
  ryb: { blackPercent: number; yellowPercent: number; redPercent: number },
  deltaPrevPercent: number
): { status: HazardSeverity; reasons: string[] } {
  const reasons: string[] = [];

  if (ryb.blackPercent >= 10) {
    reasons.push(`Cảnh báo hoại tử nguy hiểm: Mô hoại tử đen (Eschar) đạt ${ryb.blackPercent.toFixed(1)}% (ngưỡng an toàn < 10%). Cần can thiệp cắt lọc y tế khẩn.`);
  }
  if (ryb.yellowPercent >= 35) {
    reasons.push(`Nguy cơ nhiễm trùng cao: Mô vảy vàng (Slough / bio-film) chiếm ${ryb.yellowPercent.toFixed(1)}% (ngưỡng an toàn < 35%).`);
  }

  if (reasons.length > 0) {
    return { status: "emergency_critical", reasons };
  }

  if (deltaPrevPercent < -10) {
    reasons.push(`Tiến triển xấu: Diện tích vết thương đang mở rộng thêm ${Math.abs(deltaPrevPercent).toFixed(1)}% so với lần quét trước.`);
    return { status: "warning", reasons };
  }

  return { status: "safe", reasons: ["Vết thương đang trong pha tăng sinh và tái tạo biểu mô ổn định."] };
}

/**
 * Generates Evidence-Based Clinical Dressing Recommendations based on RYB Tissue Dominance
 */
export function generateDressingRecommendation(ryb: RYBMetrics, exudate: string): DressingRecommendation {
  if (ryb.blackPercent >= 10) {
    return {
      primaryDressing: "Băng gel thủy ngân (Hydrogel / Purilon Gel) kết hợp băng film bán thấm",
      secondaryDressing: "Gạc vô trùng đệm xốp foam không dính (Bordered Foam)",
      changeFrequency: "Mỗi 24 - 48 giờ hoặc khi gel hút no dịch",
      clinicalRationale: "Mô hoại tử đen (Eschar) cần cơ chế tự tiêu (Autolytic Debridement) nhờ độ ẩm từ hydrogel làm mềm mô chết mà không tổn hại mô hạt lành lân cận.",
      cleaningProtocol: [
        "Rửa nhẹ bằng nước muối sinh lý NaCl 0.9% hoặc dung dịch Betadine pha loãng 1:10.",
        "Không dùng oxy già (H2O2) trực tiếp lên mô non.",
        "Bôi lớp hydrogel dày 3-5mm phủ trọn vùng mô đen.",
        "Cố định bằng gạc xốp và dán băng keo y tế không gây dị ứng."
      ],
      warningNotices: [
        "Không tự ý bóc vảy đen bằng tay hoặc kéo chưa qua tiệt trùng.",
        "Đến bệnh viện ngay nếu xuất hiện sốt cao (>38.5°C) hoặc vệt đỏ lan ra xung quanh mép da."
      ],
      otcProducts: ["Purilon Gel (Coloplast)", "Duoderm Hydroactive Gel", "Biatain Non-Adhesive Foam"]
    };
  }

  if (ryb.yellowPercent >= 25) {
    return {
      primaryDressing: "Băng gạc alginate bạc kháng khuẩn (Silver Alginate / Aquacel Ag+)",
      secondaryDressing: "Băng dán bọt xốp hydrocellular foam hấp thụ dịch cao",
      changeFrequency: "Mỗi 24 - 48 giờ (tùy lượng dịch tiết rỉ ra băng)",
      clinicalRationale: "Mô vảy vàng chứa sợi fibrin, vi khuẩn và dịch viêm. Alginate chiết xuất từ rong biển kết hợp ion bạc (Ag+) giúp kháng khuẩn tại chỗ, hút dịch xuất tiết tạo gel mềm bảo vệ nền vết thương.",
      cleaningProtocol: [
        "Bơm rửa vết thương bằng dung dịch sát khuẩn chuyên dụng Prontosan hoặc Hypochlorous Acid.",
        "Dùng gạc ẩm lau nhẹ nhàng để lấy bớt lớp dịch nhầy lỏng.",
        "Đặt miếng gạc Silver Alginate vừa vặn vào lòng vết thương (không đè lên rìa da lành).",
        "Phủ băng ngoài bằng hydrocellular foam."
      ],
      warningNotices: [
        "Theo dõi màu sắc dịch rỉ (nếu có mủ xanh, mùi hôi đậm cần hội chẩn bác sĩ).",
        "Nếu băng phụ bị thấm ướt quá 80%, cần thay băng sớm hơn chu kỳ."
      ],
      otcProducts: ["Aquacel Ag+ Extra", "UrgoClean Ag", "Mepilex Border Ag"]
    };
  }

  if (ryb.redPercent >= 50) {
    return {
      primaryDressing: "Băng dán bọt xốp polyurethane (Hydrocellular Foam / Allevyn)",
      secondaryDressing: "Màng phim PU chống nước bảo vệ bên ngoài (Opsite Flexigrid)",
      changeFrequency: "Mỗi 3 - 5 ngày (hạn chế thay băng quá nhiều để tránh xáo trộn nền mô hạt)",
      clinicalRationale: "Mô hạt đỏ giàu mao mạch mới rất nhạy cảm. Foam dressing duy trì nhiệt độ và vi khí hậu ẩm sinh lý lý tưởng, kích thích các tế bào biểu mô di chuyển khép miệng vết thương.",
      cleaningProtocol: [
        "Rửa rất nhẹ nhàng bằng nước muối sinh lý ấm.",
        "Thấm khô nhẹ mép da xung quanh (không chà xát nền mô đỏ).",
        "Dán băng xốp trực tiếp, đảm bảo mép băng chườm qua mép vết thương ít nhất 2cm."
      ],
      warningNotices: [
        "Tránh tì đè lực cơ học trực tiếp lên vùng mô hạt.",
        "Bổ sung chế độ ăn giàu đạm (Protein), Vitamin C và kẽm để tăng tổng hợp collagen."
      ],
      otcProducts: ["Allevyn Gentle Border", "Mepilex Lite", "DuoDERM Extra Thin"]
    };
  }

  return {
    primaryDressing: "Băng hydrocolloid mỏng (Hydrocolloid Thin) hoặc gạc silicon không dính",
    secondaryDressing: "Băng dán vô trùng chống thấm",
    changeFrequency: "Mỗi 4 - 7 ngày (giữ băng đến khi tự bong nhẹ)",
    clinicalRationale: "Vết thương ở pha biểu mô hóa cuối cùng. Băng dán hydrocolloid mỏng bảo vệ tế bào vảy mới sinh và ngăn ngừa sẹo phì đại.",
    cleaningProtocol: [
      "Vệ sinh bằng nước sạch hoặc xà phòng trung tính dịu nhẹ.",
      "Thoa kem dưỡng ẩm rào cản da nếu mép ngoài bị khô rát.",
      "Dán băng hydrocolloid cố định."
    ],
    warningNotices: [
      "Không bóc gỡ vảy mới mọc non.",
      "Thoa kem chống nắng bảo vệ vùng da mới liền sẹo khỏi tăng sắc tố PIH."
    ],
    otcProducts: ["Duoderm CGF Thin", "UrgoTul Absorb", "Hansaplast Silicone Soft"]
  };
}

/**
 * Pre-set clinical presets for demonstration and camera simulation
 */
export interface ClinicalPresetCase {
  id: string;
  name: string;
  location: string;
  etiology: string;
  rawImage: string;
  defaultRyb: { red: number; yellow: number; black: number; pink: number };
  baseAreaCm2: number;
  description: string;
}

export const CLINICAL_PRESETS: ClinicalPresetCase[] = [
  {
    id: "case-dfu",
    name: "Loét bàn chân đái tháo đường (Wagner độ II)",
    location: "Gót chân trái (Left Plantar Heel)",
    etiology: "diabetic_foot",
    rawImage: "/presets/diabetic_foot.jpg",
    defaultRyb: { red: 45, yellow: 35, black: 15, pink: 5 },
    baseAreaCm2: 8.45,
    description: "Vết loét bàn chân tiểu đường kèm vảy vàng fibrin và viền hoại tử khô quanh bờ mép."
  },
  {
    id: "case-surgical",
    name: "Hở vết mổ sau phẫu thuật thành bụng",
    location: "Thành bụng dưới (Lower Abdominal Midline)",
    etiology: "surgical_dehiscence",
    rawImage: "/presets/surgical_wound.jpg",
    defaultRyb: { red: 70, yellow: 18, black: 2, pink: 10 },
    baseAreaCm2: 12.20,
    description: "Hở mép mổ sau phẫu thuật 10 ngày, nền mô hạt tăng sinh tốt, ít dịch tiết."
  },
  {
    id: "case-pressure",
    name: "Loét tì đè vùng xương cùng (Giai đoạn III)",
    location: "Vùng cùng cụt (Sacral Region)",
    etiology: "pressure_injury",
    rawImage: "/presets/pressure_injury.jpg",
    defaultRyb: { red: 30, yellow: 45, black: 20, pink: 5 },
    baseAreaCm2: 15.60,
    description: "Loét tì đè độ 3 ở bệnh nhân bất động lâu ngày, bio-film dính chắc, cần giải áp lực."
  },
  {
    id: "case-burn",
    name: "Bỏng nước sôi độ II nông đang biểu mô hóa",
    location: "Cẳng tay phải (Right Forearm)",
    etiology: "burn_trauma",
    rawImage: "/presets/burn_wound.jpg",
    defaultRyb: { red: 35, yellow: 5, black: 0, pink: 60 },
    baseAreaCm2: 4.80,
    description: "Bỏng nhiệt độ 2 đang biểu mô hóa tích cực, rìa hồng lan tỏa tốt, WHI cao."
  }
];
