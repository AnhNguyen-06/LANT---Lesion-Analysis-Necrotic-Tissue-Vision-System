import { 
  Patient, 
  WoundProfile, 
  SnapshotLog, 
  ClinicianReview, 
  TelehealthSession, 
  ReminderConfig, 
  RYBMetrics, 
  CalibrationData, 
  SurveyData,
  UserAccount
} from "@/types/medical-schema";
import { calculateWHI, evaluateHazardStatus, generateDressingRecommendation } from "./ai-vision-mock";

const STORAGE_KEY_PATIENTS = "LANT_STORAGE_PATIENTS_V1";
const STORAGE_KEY_REVIEWS = "LANT_STORAGE_REVIEWS_V1";
const STORAGE_KEY_TELEHEALTH = "LANT_STORAGE_TELEHEALTH_V1";
const STORAGE_KEY_REMINDERS = "LANT_STORAGE_REMINDERS_V1";

// Pre-seeded User Accounts
export const SEED_USERS: UserAccount[] = [
  {
    id: "USR-PAT-01",
    email: "an.nguyen62@gmail.com",
    fullName: "Nguyễn Văn An",
    role: "PATIENT",
    phone: "0918 234 567",
    medicalRecordNumber: "MRN-2024-8841",
    patientId: "PAT-10842"
  },
  {
    id: "USR-DOC-01",
    email: "dr.duc@hospital.med.vn",
    fullName: "BS. CKI Trần Minh Đức",
    role: "CLINICIAN",
    phone: "0908 765 432",
    licenseNumber: "CCHN-2021-8842",
    specialty: "Chuyên khoa Chăm sóc Vết thương & Phẫu thuật Chấn thương"
  }
];

// Helper to generate seed snapshots
function createSeedSnapshot(params: {
  id: string;
  woundId: string;
  timestamp: string;
  dayIndex: number;
  areaCm2: number;
  ryb: { red: number; yellow: number; black: number; pink: number };
  baseArea: number;
  prevArea?: number;
  survey: SurveyData;
}): SnapshotLog {
  const { id, woundId, timestamp, dayIndex, areaCm2, ryb, baseArea, prevArea = areaCm2, survey } = params;

  const rybMetrics: RYBMetrics = {
    redPercent: ryb.red,
    yellowPercent: ryb.yellow,
    blackPercent: ryb.black,
    pinkPercent: ryb.pink,
    granulationAreaCm2: Number(((ryb.red / 100) * areaCm2).toFixed(2)),
    sloughAreaCm2: Number(((ryb.yellow / 100) * areaCm2).toFixed(2)),
    necroticAreaCm2: Number(((ryb.black / 100) * areaCm2).toFixed(2)),
    epithelialAreaCm2: Number(((ryb.pink / 100) * areaCm2).toFixed(2)),
  };

  const whiScore = calculateWHI(rybMetrics);
  const deltaPrevPercent = prevArea > 0 ? Number((((prevArea - areaCm2) / prevArea) * 100).toFixed(1)) : 0;
  const deltaBasePercent = baseArea > 0 ? Number((((baseArea - areaCm2) / baseArea) * 100).toFixed(1)) : 0;

  const hazard = evaluateHazardStatus(rybMetrics, deltaPrevPercent);
  const recommendation = generateDressingRecommendation(rybMetrics, survey.exudateLevel);

  const calibration: CalibrationData = {
    markerDetected: true,
    markerType: "aruco_4x4",
    knownDimensionCm: 2.0,
    markerPixelWidth: 120,
    ratioCmPerPixel: 2.0 / 120,
    perspectiveSkewAngle: 2.4,
    lightingStatus: "optimal",
    luxLevel: 450,
    confidenceScore: 98.4
  };

  return {
    id,
    woundId,
    timestamp,
    dayIndex,
    imageUrl: `/presets/sample_${(dayIndex % 4) + 1}.jpg`,
    calibration,
    totalAreaCm2: areaCm2,
    estimatedVolumeCm3: Number((areaCm2 * 0.35).toFixed(2)),
    rybMetrics,
    whiScore,
    deltaPrevPercent,
    deltaBasePercent,
    hazardStatus: hazard.status,
    hazardReasons: hazard.reasons,
    recommendation,
    survey,
    clinicianNotesCount: dayIndex > 0 ? 1 : 0
  };
}

// Initial Realistic Seed Patients with Sentence Case Titles
export const SEED_PATIENTS: Patient[] = [
  {
    id: "PAT-10842",
    fullName: "Nguyễn Văn An",
    age: 62,
    gender: "Male",
    phone: "0918 234 567",
    email: "an.nguyen62@gmail.com",
    medicalRecordNumber: "MRN-2024-8841",
    riskTier: "moderate",
    allergies: ["Penicillin", "Latex"],
    primaryPhysician: "BS. CKI Trần Minh Đức (BV Chợ Rẫy)",
    wounds: [
      {
        id: "WND-849201",
        patientId: "PAT-10842",
        title: "Loét bàn chân đái tháo đường (Wagner II)",
        anatomicalLocation: "Gót chân trái (Left Plantar Heel)",
        status: "active",
        createdAt: "2026-08-01T08:30:00Z",
        updatedAt: "2026-08-18T09:15:00Z",
        baselineAreaCm2: 12.80,
        currentAreaCm2: 8.45,
        currentWHI: 56,
        snapshots: [
          createSeedSnapshot({
            id: "SNP-849201-01",
            woundId: "WND-849201",
            timestamp: "2026-08-01T08:30:00Z",
            dayIndex: 0,
            areaCm2: 12.80,
            baseArea: 12.80,
            ryb: { red: 30, yellow: 45, black: 20, pink: 5 },
            survey: {
              painScore: 7,
              etiology: "diabetic_foot",
              durationWeeks: 4,
              exudateLevel: "moderate",
              exudateType: "serosanguineous",
              odor: "mild",
              comorbidities: ["Đái tháo đường Type 2", "Tăng huyết áp", "Bệnh động mạch ngoại biên (PAD)"],
              notes: "Phát hiện vết chai chân vỡ loét sau khi đi bộ dài, tê bì bàn chân giảm cảm giác."
            }
          }),
          createSeedSnapshot({
            id: "SNP-849201-02",
            woundId: "WND-849201",
            timestamp: "2026-08-06T09:00:00Z",
            dayIndex: 5,
            areaCm2: 11.20,
            baseArea: 12.80,
            prevArea: 12.80,
            ryb: { red: 40, yellow: 40, black: 12, pink: 8 },
            survey: {
              painScore: 5,
              etiology: "diabetic_foot",
              durationWeeks: 5,
              exudateLevel: "moderate",
              exudateType: "serosanguineous",
              odor: "none",
              comorbidities: ["Đái tháo đường Type 2", "Tăng huyết áp"]
            }
          }),
          createSeedSnapshot({
            id: "SNP-849201-03",
            woundId: "WND-849201",
            timestamp: "2026-08-12T08:45:00Z",
            dayIndex: 11,
            areaCm2: 9.60,
            baseArea: 12.80,
            prevArea: 11.20,
            ryb: { red: 52, yellow: 32, black: 4, pink: 12 },
            survey: {
              painScore: 4,
              etiology: "diabetic_foot",
              durationWeeks: 6,
              exudateLevel: "light",
              exudateType: "serous",
              odor: "none",
              comorbidities: ["Đái tháo đường Type 2"]
            }
          }),
          createSeedSnapshot({
            id: "SNP-849201-04",
            woundId: "WND-849201",
            timestamp: "2026-08-18T09:15:00Z",
            dayIndex: 17,
            areaCm2: 8.45,
            baseArea: 12.80,
            prevArea: 9.60,
            ryb: { red: 62, yellow: 20, black: 0, pink: 18 },
            survey: {
              painScore: 3,
              etiology: "diabetic_foot",
              durationWeeks: 7,
              exudateLevel: "light",
              exudateType: "serous",
              odor: "none",
              comorbidities: ["Đái tháo đường Type 2"]
            }
          })
        ]
      }
    ]
  },
  {
    id: "PAT-20931",
    fullName: "Trần Thị Mai",
    age: 78,
    gender: "Female",
    phone: "0903 891 029",
    email: "mai.tran78@gmail.com",
    medicalRecordNumber: "MRN-2024-9102",
    riskTier: "high_critical",
    allergies: ["Sulfonamides"],
    primaryPhysician: "BS. CKI Lê Hoàng Hà (Khoa Bỏng - Tạo Hình)",
    wounds: [
      {
        id: "WND-991204",
        patientId: "PAT-20931",
        title: "Loét tì đè vùng cùng cụt (Giai đoạn III)",
        anatomicalLocation: "Vùng xương cùng (Sacrum)",
        status: "critical_triage",
        createdAt: "2026-08-10T10:00:00Z",
        updatedAt: "2026-08-19T14:20:00Z",
        baselineAreaCm2: 18.50,
        currentAreaCm2: 19.80,
        currentWHI: 14,
        snapshots: [
          createSeedSnapshot({
            id: "SNP-991204-01",
            woundId: "WND-991204",
            timestamp: "2026-08-10T10:00:00Z",
            dayIndex: 0,
            areaCm2: 18.50,
            baseArea: 18.50,
            ryb: { red: 25, yellow: 45, black: 25, pink: 5 },
            survey: {
              painScore: 8,
              etiology: "pressure_injury",
              durationWeeks: 6,
              exudateLevel: "heavy",
              exudateType: "purulent",
              odor: "strong",
              comorbidities: ["Liệt nửa người sau tai biến", "Suy dinh dưỡng đạm"],
              notes: "Bệnh nhân nằm liệt giường 2 tháng, vùng cùng cụt tì đè xuất hiện mảng vảy đen cứng."
            }
          }),
          createSeedSnapshot({
            id: "SNP-991204-02",
            woundId: "WND-991204",
            timestamp: "2026-08-19T14:20:00Z",
            dayIndex: 9,
            areaCm2: 19.80,
            baseArea: 18.50,
            prevArea: 18.50,
            ryb: { red: 20, yellow: 48, black: 28, pink: 4 },
            survey: {
              painScore: 9,
              etiology: "pressure_injury",
              durationWeeks: 7,
              exudateLevel: "heavy",
              exudateType: "purulent",
              odor: "strong",
              comorbidities: ["Liệt nửa người sau tai biến"]
            }
          })
        ]
      }
    ]
  },
  {
    id: "PAT-30419",
    fullName: "Lê Hoàng Long",
    age: 45,
    gender: "Male",
    phone: "0977 654 321",
    email: "long.le45@yahoo.com",
    medicalRecordNumber: "MRN-2024-5501",
    riskTier: "low",
    allergies: [],
    primaryPhysician: "BS. CKI Trần Minh Đức",
    wounds: [
      {
        id: "WND-551028",
        patientId: "PAT-30419",
        title: "Vết mổ hở thành bụng sau cắt ruột thừa viêm",
        anatomicalLocation: "Hố chậu phải (Right Iliac Fossa)",
        status: "active",
        createdAt: "2026-08-05T07:00:00Z",
        updatedAt: "2026-08-19T16:00:00Z",
        baselineAreaCm2: 8.50,
        currentAreaCm2: 3.20,
        currentWHI: 88,
        snapshots: [
          createSeedSnapshot({
            id: "SNP-551028-01",
            woundId: "WND-551028",
            timestamp: "2026-08-05T07:00:00Z",
            dayIndex: 0,
            areaCm2: 8.50,
            baseArea: 8.50,
            ryb: { red: 60, yellow: 30, black: 0, pink: 10 },
            survey: {
              painScore: 6,
              etiology: "surgical_dehiscence",
              durationWeeks: 1,
              exudateLevel: "moderate",
              exudateType: "serous",
              odor: "none",
              comorbidities: []
            }
          }),
          createSeedSnapshot({
            id: "SNP-551028-02",
            woundId: "WND-551028",
            timestamp: "2026-08-19T16:00:00Z",
            dayIndex: 14,
            areaCm2: 3.20,
            baseArea: 8.50,
            prevArea: 8.50,
            ryb: { red: 75, yellow: 5, black: 0, pink: 20 },
            survey: {
              painScore: 2,
              etiology: "surgical_dehiscence",
              durationWeeks: 3,
              exudateLevel: "none",
              exudateType: "serous",
              odor: "none",
              comorbidities: []
            }
          })
        ]
      },
      {
        id: "WND-110294",
        patientId: "PAT-30419",
        title: "Bỏng nước sôi cẳng tay phải (Đã liền hoàn toàn)",
        anatomicalLocation: "Cẳng tay phải (Right Forearm)",
        status: "healed",
        createdAt: "2026-06-10T14:00:00Z",
        updatedAt: "2026-07-08T10:00:00Z",
        baselineAreaCm2: 9.80,
        currentAreaCm2: 0.00,
        currentWHI: 100,
        snapshots: [
          createSeedSnapshot({
            id: "SNP-110294-01",
            woundId: "WND-110294",
            timestamp: "2026-06-10T14:00:00Z",
            dayIndex: 0,
            areaCm2: 9.80,
            baseArea: 9.80,
            ryb: { red: 50, yellow: 20, black: 0, pink: 30 },
            survey: {
              painScore: 7,
              etiology: "burn_trauma",
              durationWeeks: 1,
              exudateLevel: "light",
              exudateType: "serous",
              odor: "none",
              comorbidities: []
            }
          }),
          createSeedSnapshot({
            id: "SNP-110294-02",
            woundId: "WND-110294",
            timestamp: "2026-07-08T10:00:00Z",
            dayIndex: 28,
            areaCm2: 0.00,
            baseArea: 9.80,
            prevArea: 9.80,
            ryb: { red: 5, yellow: 0, black: 0, pink: 95 },
            survey: {
              painScore: 0,
              etiology: "burn_trauma",
              durationWeeks: 4,
              exudateLevel: "none",
              exudateType: "serous",
              odor: "none",
              comorbidities: []
            }
          })
        ]
      }
    ]
  }
];

export const SEED_TELEHEALTH: TelehealthSession[] = [
  {
    id: "TEL-001",
    patientId: "PAT-20931",
    patientName: "Trần Thị Mai",
    woundId: "WND-991204",
    doctorName: "BS. CKI Trần Minh Đức",
    doctorSpecialty: "Chuyên khoa Chăm sóc Vết thương & Phẫu thuật Chấn thương",
    scheduledTime: "2026-08-24T09:00:00Z",
    status: "scheduled",
    woundTitle: "Loét tì đè vùng cùng cụt (Giai đoạn III)",
    clinicalSummary: "Bệnh nhân có mảng hoại tử đen 28%, cần chỉ định cắt lọc khẩn cấp và chuyển viện tuyến trên."
  },
  {
    id: "TEL-002",
    patientId: "PAT-10842",
    patientName: "Nguyễn Văn An",
    woundId: "WND-849201",
    doctorName: "BS. CKI Trần Minh Đức",
    doctorSpecialty: "Chuyên khoa Chăm sóc Vết thương & Phẫu thuật Chấn thương",
    scheduledTime: "2026-08-24T14:30:00Z",
    status: "scheduled",
    woundTitle: "Loét bàn chân đái tháo đường (Wagner II)",
    clinicalSummary: "Tái khám định kỳ sau 17 ngày điều trị, đánh giá tiến độ biểu mô hóa và thay đổi phác đồ băng gạc xốp."
  }
];

export const SEED_REVIEWS: ClinicianReview[] = [
  {
    id: "REV-001",
    patientId: "PAT-10842",
    woundId: "WND-849201",
    snapshotId: "SNP-849201-04",
    clinicianName: "BS. CKI Trần Minh Đức",
    clinicianTitle: "Bác sĩ Chăm sóc Vết thương & Ngoại Chấn Thương",
    date: "2026-08-18T10:00:00Z",
    soapSubjective: "Bệnh nhân đỡ đau nhiều (VAS 3/10), không sốt, không rỉ dịch bẩn.",
    soapObjective: "Mô hạt đỏ chiếm 62%, biểu mô hóa rìa 18%, không còn vảy đen. Diện tích giảm còn 8.45 cm² (giảm 34% so với ban đầu). Điểm WHI đạt 56/100.",
    soapAssessment: "Loét bàn chân đái tháo đường đáp ứng tốt với phác đồ kiểm soát ẩm, không có dấu hiệu nhiễm trùng mới.",
    soapPlan: "Chuyển sang băng dán bọt xốp Polyurethane (Allevyn Gentle Border). Thay băng mỗi 3 ngày. Tiếp tục kiểm soát đường huyết chặt chẽ.",
    approved: true,
    signedAt: "2026-08-18T10:05:00Z"
  }
];

// LocalStorage Mock Service with clear-cache resilience
export const MockStorageService = {
  getPatients(): Patient[] {
    if (typeof window === "undefined") return SEED_PATIENTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PATIENTS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_PATIENTS, JSON.stringify(SEED_PATIENTS));
        return SEED_PATIENTS;
      }
      return JSON.parse(stored);
    } catch {
      return SEED_PATIENTS;
    }
  },

  getPatient(id: string): Patient | undefined {
    const patients = this.getPatients();
    return patients.find(p => p.id === id);
  },

  savePatients(patients: Patient[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY_PATIENTS, JSON.stringify(patients));
  },

  addSnapshot(patientId: string, woundId: string, snapshot: SnapshotLog) {
    const patients = this.getPatients();
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const wound = patient.wounds.find(w => w.id === woundId);
    if (!wound) return;

    wound.snapshots.push(snapshot);
    wound.currentAreaCm2 = snapshot.totalAreaCm2;
    wound.currentWHI = snapshot.whiScore;
    wound.updatedAt = snapshot.timestamp;

    if (snapshot.totalAreaCm2 <= 0.1) {
      wound.status = "healed";
    } else if (snapshot.hazardStatus === "emergency_critical") {
      wound.status = "critical_triage";
    }

    this.savePatients(patients);
  },

  createNewWound(patientId: string, woundData: { title: string; anatomicalLocation: string }, initialSnapshot: SnapshotLog) {
    const patients = this.getPatients();
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const newWound: WoundProfile = {
      id: initialSnapshot.woundId,
      patientId,
      title: woundData.title,
      anatomicalLocation: woundData.anatomicalLocation,
      status: initialSnapshot.hazardStatus === "emergency_critical" ? "critical_triage" : "active",
      createdAt: initialSnapshot.timestamp,
      updatedAt: initialSnapshot.timestamp,
      baselineAreaCm2: initialSnapshot.totalAreaCm2,
      currentAreaCm2: initialSnapshot.totalAreaCm2,
      currentWHI: initialSnapshot.whiScore,
      snapshots: [initialSnapshot]
    };

    patient.wounds.unshift(newWound);
    this.savePatients(patients);
  },

  getReviews(woundId: string): ClinicianReview[] {
    if (typeof window === "undefined") return SEED_REVIEWS.filter(r => r.woundId === woundId);
    try {
      const stored = localStorage.getItem(STORAGE_KEY_REVIEWS);
      const reviews: ClinicianReview[] = stored ? JSON.parse(stored) : SEED_REVIEWS;
      return reviews.filter(r => r.woundId === woundId);
    } catch {
      return SEED_REVIEWS.filter(r => r.woundId === woundId);
    }
  },

  addReview(review: ClinicianReview) {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_REVIEWS);
      const reviews: ClinicianReview[] = stored ? JSON.parse(stored) : [...SEED_REVIEWS];
      reviews.unshift(review);
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
    } catch (e) {
      console.error(e);
    }
  },

  getTelehealthSessions(): TelehealthSession[] {
    if (typeof window === "undefined") return SEED_TELEHEALTH;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TELEHEALTH);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_TELEHEALTH, JSON.stringify(SEED_TELEHEALTH));
        return SEED_TELEHEALTH;
      }
      return JSON.parse(stored);
    } catch {
      return SEED_TELEHEALTH;
    }
  },

  getReminders(patientId: string): ReminderConfig {
    const defaultReminder: ReminderConfig = {
      patientId,
      frequency: "daily",
      timeOfDay: "09:00",
      enabled: true,
      channels: {
        sms: true,
        email: true,
        push: true
      },
      streakDays: 5,
      lastCaptureDate: "2026-08-18"
    };

    if (typeof window === "undefined") return defaultReminder;
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_REMINDERS}_${patientId}`);
      return stored ? JSON.parse(stored) : defaultReminder;
    } catch {
      return defaultReminder;
    }
  },

  saveReminders(config: ReminderConfig) {
    if (typeof window === "undefined") return;
    localStorage.setItem(`${STORAGE_KEY_REMINDERS}_${config.patientId}`, JSON.stringify(config));
  }
};
