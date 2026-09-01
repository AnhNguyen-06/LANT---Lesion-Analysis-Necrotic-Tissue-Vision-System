/**
 * LANT — Medical Schema & Clinical Type Definitions
 * Single Source of Truth for Enterprise Project LANT
 */

export type UserRole = 'PATIENT' | 'CLINICIAN';

export interface VietnamAddress {
  street: string;
  ward: string;
  district: string;
  province: string;
}

export interface UserAccount {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  dob?: string;
  gender?: 'Nam' | 'Nữ' | 'Khác';
  avatarUrl?: string;
  address?: VietnamAddress;
  medicalHistory?: string;
  medicalRecordNumber?: string; // For patients (MRN-XXXX-XXXX)
  licenseNumber?: string;       // For clinicians (CCHN-XXXX-XXXX)
  specialty?: string;           // For clinicians
  patientId?: string;           // Linked patient record ID
  assignedDoctorId?: string;    // Assigned primary clinician
  tourCompleted?: boolean;      // Onboarding tour completed flag
  createdAt?: string;
}

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
  maskOverlayUrl?: string;
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
  dob?: string;
  gender: 'Male' | 'Female' | 'Other' | 'Nam' | 'Nữ' | 'Khác';
  phone: string;
  email: string;
  avatarUrl?: string;
  address?: VietnamAddress;
  medicalRecordNumber: string;
  riskTier: PatientRiskTier;
  wounds: WoundProfile[];
  allergies?: string[];
  medicalHistory?: string;
  primaryPhysician?: string;
  assignedDoctorId?: string;
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
  certificateId?: string;
  licenseNumber?: string;
}

export interface TelehealthSession {
  id: string;
  patientId: string;
  patientName: string;
  woundId: string;
  woundTitle: string;
  scheduledTime: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  doctorName: string;
  doctorSpecialty: string;
  doctorId?: string;
  clinicalSummary?: string;
  prescriptions?: string[];
  notes?: string;
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

export interface ChatMessage {
  id: string;
  threadId: string; // chat_{doctorId}_{patientId}
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  attachmentUrl?: string;
  timestamp: string;
  isRead: boolean;
}

export interface IncomingCallSignal {
  id: string;
  callId: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  woundTitle: string;
  status: 'calling' | 'accepted' | 'declined' | 'ended';
  startedAt: string;
}
