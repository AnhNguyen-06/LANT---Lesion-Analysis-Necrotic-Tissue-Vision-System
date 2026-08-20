/**
 * LANT — Medical Schema & Clinical Type Definitions
 * Single Source of Truth for Project LANT
 */

export type TissueType = 'granulation' | 'slough' | 'necrotic' | 'epithelial';

export interface RYBMetrics {
  redPercent: number;        // Granulation tissue (Viable healing)
  yellowPercent: number;     // Slough tissue (Infection risk / bio-burden)
  blackPercent: number;      // Necrotic tissue (Eschar / devitalized hazard)
  pinkPercent: number;       // Epithelialization (Skin closure / margin)
  granulationAreaCm2: number;
  sloughAreaCm2: number;
  necroticAreaCm2: number;
  epithelialAreaCm2: number;
}

export type LightingStatus = 'optimal' | 'low_light' | 'overexposed' | 'glare_detected';

export interface CalibrationData {
  markerDetected: boolean;
  markerType: 'aruco_4x4' | 'coin_reference' | 'ruler_scale' | 'manual';
  knownDimensionCm: number;
  markerPixelWidth: number;
  ratioCmPerPixel: number;
  perspectiveSkewAngle: number;
  lightingStatus: LightingStatus;
  luxLevel: number;
  confidenceScore: number;
}

export type WoundEtiology = 
  | 'diabetic_foot' 
  | 'surgical_dehiscence' 
  | 'pressure_injury' 
  | 'venous_ulcer' 
  | 'burn_trauma' 
  | 'arterial_ulcer'
  | 'other';

export interface SurveyData {
  painScore: number; // 0-10
  etiology: WoundEtiology;
  durationWeeks: number;
  exudateLevel: 'none' | 'light' | 'moderate' | 'heavy';
  exudateType: 'serous' | 'sanguineous' | 'purulent' | 'serosanguineous';
  odor: 'none' | 'mild' | 'strong';
  comorbidities: string[];
  notes?: string;
}

export interface DressingRecommendation {
  primaryDressing: string;
  secondaryDressing: string;
  changeFrequency: string;
  clinicalRationale: string;
  cleaningProtocol: string[];
  warningNotices: string[];
  otcProducts: string[];
}

export type HazardSeverity = 'safe' | 'warning' | 'emergency_critical';

export interface SnapshotLog {
  id: string;
  woundId: string;
  timestamp: string;
  dayIndex: number;
  imageUrl: string;
  calibration: CalibrationData;
  totalAreaCm2: number;
  estimatedVolumeCm3?: number;
  rybMetrics: RYBMetrics;
  whiScore: number; // Clamped 0-100
  deltaPrevPercent: number; // Recovery vs previous
  deltaBasePercent: number; // Recovery vs baseline
  hazardStatus: HazardSeverity;
  hazardReasons: string[];
  recommendation: DressingRecommendation;
  survey: SurveyData;
  clinicianNotesCount?: number;
}

export type WoundStatus = 'active' | 'healed' | 'critical_triage';

export interface WoundProfile {
  id: string; // WND-XXXXXX
  patientId: string;
  title: string;
  anatomicalLocation: string;
  status: WoundStatus;
  createdAt: string;
  updatedAt: string;
  baselineAreaCm2: number;
  currentAreaCm2: number;
  currentWHI: number;
  snapshots: SnapshotLog[];
}

export type PatientRiskTier = 'low' | 'moderate' | 'high_critical';

export interface Patient {
  id: string; // PAT-XXXXX
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  medicalRecordNumber: string;
  riskTier: PatientRiskTier;
  wounds: WoundProfile[];
  allergies?: string[];
  primaryPhysician?: string;
}

export interface ClinicianReview {
  id: string;
  patientId: string;
  woundId: string;
  snapshotId: string;
  clinicianName: string;
  clinicianTitle: string;
  date: string;
  soapSubjective: string;
  soapObjective: string;
  soapAssessment: string;
  soapPlan: string;
  approved: boolean;
  signedAt?: string;
}

export interface TelehealthSession {
  id: string;
  patientId: string;
  patientName: string;
  woundId: string;
  woundTitle: string;
  scheduledTime: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  doctorName: string;
  doctorSpecialty: string;
  clinicalSummary?: string;
  prescriptions?: string[];
}

export interface ReminderConfig {
  patientId: string;
  enabled: boolean;
  timeOfDay: string; // "09:00"
  frequency: 'daily' | 'every_2_days' | 'weekly';
  channels: {
    sms: boolean;
    email: boolean;
    push: boolean;
  };
  streakDays: number;
  lastCaptureDate?: string;
}
