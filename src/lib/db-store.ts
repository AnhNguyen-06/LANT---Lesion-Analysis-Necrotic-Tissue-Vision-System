import {
  UserAccount,
  Patient,
  WoundProfile,
  SnapshotLog,
  TelehealthSession,
  ClinicianReview,
  ChatMessage,
  IncomingCallSignal,
  ReminderConfig,
  VietnamAddress
} from "@/types/medical-schema";
import { SEED_PATIENTS, SEED_REVIEWS, SEED_TELEHEALTH } from "./mock-storage";

// Storage Keys
const DB_USERS_KEY = "LANT_DB_USERS_V2";
const DB_PATIENTS_KEY = "LANT_DB_PATIENTS_V2";
const DB_MESSAGES_KEY = "LANT_DB_MESSAGES_V2";
const DB_APPOINTMENTS_KEY = "LANT_DB_APPOINTMENTS_V2";
const DB_SIGNED_SOAP_KEY = "LANT_DB_SIGNED_SOAP_V2";
const DB_CALL_SIGNAL_KEY = "LANT_DB_CALL_SIGNAL_V2";

// Seed Users with Pre-set Accounts
export const SEED_USERS_DB: (UserAccount & { passwordHash: string })[] = [
  {
    id: "USR-PAT-01",
    email: "patient.an@lant.med",
    passwordHash: "patient123",
    fullName: "Nguyễn Văn An",
    role: "PATIENT",
    phone: "0918 234 567",
    dob: "1964-04-12",
    gender: "Nam",
    avatarUrl: undefined,
    address: {
      street: "128 Đường Nguyễn Trãi",
      ward: "Phường Bến Thành",
      district: "Quận 1",
      province: "Thành phố Hồ Chí Minh"
    },
    medicalHistory: "Đái tháo đường Type 2 (12 năm), Tăng huyết áp vô căn. Dị ứng Penicillin.",
    medicalRecordNumber: "MRN-2024-8841",
    patientId: "PAT-10842",
    assignedDoctorId: "USR-DOC-01",
    tourCompleted: false,
    createdAt: "2026-08-01T08:00:00Z"
  },
  {
    id: "USR-PAT-02",
    email: "patient.mai@lant.med",
    passwordHash: "patient123",
    fullName: "Trần Thị Mai",
    role: "PATIENT",
    phone: "0903 891 029",
    dob: "1948-11-20",
    gender: "Nữ",
    avatarUrl: "/presets/avatar_mai.jpg",
    address: {
      street: "45 Phố Huế",
      ward: "Phường Hàng Bài",
      district: "Quận Hoàn Kiếm",
      province: "Thành phố Hà Nội"
    },
    medicalHistory: "Di chứng tai biến mạch máu não, liệt nửa người trái. Suy dinh dưỡng protein-năng lượng.",
    medicalRecordNumber: "MRN-2024-9102",
    patientId: "PAT-20931",
    assignedDoctorId: "USR-DOC-01",
    tourCompleted: true,
    createdAt: "2026-08-10T10:00:00Z"
  },
  {
    id: "USR-PAT-03",
    email: "patient.long@lant.med",
    passwordHash: "patient123",
    fullName: "Lê Hoàng Long",
    role: "PATIENT",
    phone: "0977 654 321",
    dob: "1981-07-05",
    gender: "Nam",
    avatarUrl: "/presets/avatar_long.jpg",
    address: {
      street: "72 Đường Lê Duẩn",
      ward: "Phường Thạch Thang",
      district: "Quận Hải Châu",
      province: "Thành phố Đà Nẵng"
    },
    medicalHistory: "Hậu phẫu cắt ruột thừa viêm ngày thứ 14. Không có tiền sử dị ứng.",
    medicalRecordNumber: "MRN-2024-5501",
    patientId: "PAT-30419",
    assignedDoctorId: "USR-DOC-01",
    tourCompleted: true,
    createdAt: "2026-08-05T07:00:00Z"
  },
  {
    id: "USR-DOC-01",
    email: "doctor.duc@lant.med",
    passwordHash: "doctor123",
    fullName: "BS. CKI Trần Minh Đức",
    role: "CLINICIAN",
    phone: "0908 765 432",
    dob: "1983-09-15",
    gender: "Nam",
    avatarUrl: "/presets/avatar_duc.jpg",
    address: {
      street: "201 Đường Nguyễn Chí Thanh",
      ward: "Phường 12",
      district: "Quận 5",
      province: "Thành phố Hồ Chí Minh"
    },
    licenseNumber: "CCHN-2021-8842",
    specialty: "Chuyên khoa Chăm sóc Vết thương & Phẫu thuật Chấn thương — BV Chợ Rẫy",
    tourCompleted: false,
    createdAt: "2026-01-10T08:00:00Z"
  },
  {
    id: "USR-DOC-02",
    email: "doctor.huong@lant.med",
    passwordHash: "doctor123",
    fullName: "BS. CKII Nguyễn Thu Hương",
    role: "CLINICIAN",
    phone: "0912 345 678",
    dob: "1979-03-28",
    gender: "Nữ",
    avatarUrl: "/presets/avatar_huong.jpg",
    address: {
      street: "78 Đường Giải Phóng",
      ward: "Phường Phương Mai",
      district: "Quận Đống Đa",
      province: "Thành phố Hà Nội"
    },
    licenseNumber: "CCHN-2018-5521",
    specialty: "Chuyên khoa Bỏng, Vi phẫu & Tạo hình Phục hồi — BV Bạch Mai",
    tourCompleted: true,
    createdAt: "2026-01-15T08:00:00Z"
  }
];

export const SEED_MESSAGES_DB: ChatMessage[] = [
  {
    id: "MSG-001",
    threadId: "chat_USR-DOC-01_USR-PAT-01",
    senderId: "USR-PAT-01",
    senderName: "Nguyễn Văn An",
    receiverId: "USR-DOC-01",
    content: "Chào bác sĩ Đức, gót chân của em hôm nay đã khô ráo hơn nhiều, chỉ hơi nhói nhẹ khi chạm vào mép băng.",
    timestamp: "2026-08-20T08:15:00Z",
    isRead: true
  },
  {
    id: "MSG-002",
    threadId: "chat_USR-DOC-01_USR-PAT-01",
    senderId: "USR-DOC-01",
    senderName: "BS. CKI Trần Minh Đức",
    receiverId: "USR-PAT-01",
    content: "Chào bác An, tôi đã xem hình ảnh quét Day 17. Mô hạt đỏ phát triển rất tốt (62%). Bác tiếp tục duy trì băng bọt xốp Allevyn và thay mỗi 3 ngày nhé.",
    timestamp: "2026-08-20T08:30:00Z",
    isRead: true
  },
  {
    id: "MSG-003",
    threadId: "chat_USR-DOC-01_USR-PAT-02",
    senderId: "USR-PAT-02",
    senderName: "Trần Thị Mai (Người nhà)",
    receiverId: "USR-DOC-01",
    content: "Thưa bác sĩ, mảng vảy đen ở lưng của bà hôm nay rỉ dịch vàng và có mùi nhẹ, gia đình rất lo lắng.",
    timestamp: "2026-08-22T09:00:00Z",
    isRead: false
  }
];

// In-memory Fallback for SSR
let inMemoryUsers = [...SEED_USERS_DB];
let inMemoryPatients = [...SEED_PATIENTS];
let inMemoryMessages = [...SEED_MESSAGES_DB];
let inMemoryAppointments = [...SEED_TELEHEALTH];
let inMemorySignedSoap = [...SEED_REVIEWS];
let inMemoryCallSignal: IncomingCallSignal | null = null;

// Database Engine Service
export const DBStore = {
  // USER ACCOUNTS
  getUsers(): (UserAccount & { passwordHash: string })[] {
    if (typeof window === "undefined") return inMemoryUsers;
    try {
      const stored = localStorage.getItem(DB_USERS_KEY);
      if (!stored) {
        localStorage.setItem(DB_USERS_KEY, JSON.stringify(SEED_USERS_DB));
        return SEED_USERS_DB;
      }
      return JSON.parse(stored);
    } catch {
      return inMemoryUsers;
    }
  },

  saveUsers(users: (UserAccount & { passwordHash: string })[]) {
    inMemoryUsers = users;
    if (typeof window === "undefined") return;
    localStorage.setItem(DB_USERS_KEY, JSON.stringify(users));
  },

  getUserById(id: string): UserAccount | undefined {
    const users = this.getUsers();
    return users.find(u => u.id === id);
  },

  getUserByEmail(email: string): (UserAccount & { passwordHash: string }) | undefined {
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  updateUserProfile(userId: string, updates: Partial<UserAccount>): UserAccount | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return null;

    users[index] = { ...users[index], ...updates };
    this.saveUsers(users);

    // Also sync patient record if applicable
    if (users[index].patientId) {
      const patients = this.getPatients();
      const pIdx = patients.findIndex(p => p.id === users[index].patientId);
      if (pIdx !== -1) {
        patients[pIdx].fullName = users[index].fullName;
        if (users[index].phone) patients[pIdx].phone = users[index].phone;
        if (users[index].address) patients[pIdx].address = users[index].address;
        if (users[index].dob) patients[pIdx].dob = users[index].dob;
        if (users[index].gender) patients[pIdx].gender = users[index].gender;
        if (users[index].medicalHistory) patients[pIdx].medicalHistory = users[index].medicalHistory;
        this.savePatients(patients);
      }
    }

    return users[index];
  },

  registerUser(data: {
    fullName: string;
    email: string;
    phone: string;
    passwordHash: string;
    role: "PATIENT" | "CLINICIAN";
    medicalRecordNumber?: string;
    licenseNumber?: string;
    specialty?: string;
    address?: VietnamAddress;
  }): UserAccount {
    const users = this.getUsers();
    const newUserId = data.role === "PATIENT" ? `USR-PAT-${Date.now().toString().slice(-4)}` : `USR-DOC-${Date.now().toString().slice(-4)}`;
    const newPatientId = data.role === "PATIENT" ? `PAT-${Date.now().toString().slice(-5)}` : undefined;

    const newUser: UserAccount & { passwordHash: string } = {
      id: newUserId,
      email: data.email,
      passwordHash: data.passwordHash || "123456",
      fullName: data.fullName,
      role: data.role,
      phone: data.phone,
      medicalRecordNumber: data.medicalRecordNumber || (data.role === "PATIENT" ? `MRN-2026-${Math.floor(1000 + Math.random() * 9000)}` : undefined),
      licenseNumber: data.licenseNumber || (data.role === "CLINICIAN" ? `CCHN-2026-${Math.floor(1000 + Math.random() * 9000)}` : undefined),
      specialty: data.specialty || (data.role === "CLINICIAN" ? "Bác sĩ Chăm sóc Vết thương & Ngoại khoa" : undefined),
      patientId: newPatientId,
      assignedDoctorId: data.role === "PATIENT" ? "USR-DOC-01" : undefined,
      tourCompleted: false,
      address: data.address,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);

    // Create an empty, isolated patient sandbox
    if (data.role === "PATIENT" && newPatientId) {
      const patients = this.getPatients();
      const newPatient: Patient = {
        id: newPatientId,
        fullName: data.fullName,
        age: 35,
        gender: "Nam",
        phone: data.phone,
        email: data.email,
        medicalRecordNumber: newUser.medicalRecordNumber || "MRN-2026-0001",
        riskTier: "low",
        wounds: [],
        allergies: [],
        primaryPhysician: "BS. CKI Trần Minh Đức",
        assignedDoctorId: "USR-DOC-01",
        address: data.address
      };
      patients.push(newPatient);
      this.savePatients(patients);
    }

    return newUser;
  },

  // PATIENTS & WOUNDS
  getPatients(): Patient[] {
    if (typeof window === "undefined") return inMemoryPatients;
    try {
      const stored = localStorage.getItem(DB_PATIENTS_KEY);
      if (!stored) {
        localStorage.setItem(DB_PATIENTS_KEY, JSON.stringify(SEED_PATIENTS));
        return SEED_PATIENTS;
      }
      return JSON.parse(stored);
    } catch {
      return inMemoryPatients;
    }
  },

  savePatients(patients: Patient[]) {
    inMemoryPatients = patients;
    if (typeof window === "undefined") return;
    localStorage.setItem(DB_PATIENTS_KEY, JSON.stringify(patients));
  },

  getPatientById(id: string): Patient | undefined {
    const patients = this.getPatients();
    return patients.find(p => p.id === id);
  },

  getPatientByUserId(userId: string): Patient | undefined {
    const user = this.getUserById(userId);
    if (!user || !user.patientId) return undefined;
    return this.getPatientById(user.patientId);
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

  // SIGNED SOAP RECORDS
  getSignedSoapRecords(patientId?: string, woundId?: string): ClinicianReview[] {
    if (typeof window === "undefined") {
      let list = inMemorySignedSoap;
      if (patientId) list = list.filter(r => r.patientId === patientId);
      if (woundId) list = list.filter(r => r.woundId === woundId);
      return list;
    }
    try {
      const stored = localStorage.getItem(DB_SIGNED_SOAP_KEY);
      const all: ClinicianReview[] = stored ? JSON.parse(stored) : SEED_REVIEWS;
      let list = all;
      if (patientId) list = list.filter(r => r.patientId === patientId);
      if (woundId) list = list.filter(r => r.woundId === woundId);
      return list;
    } catch {
      return inMemorySignedSoap;
    }
  },

  addSignedSoapRecord(review: ClinicianReview) {
    const stored = typeof window !== "undefined" ? localStorage.getItem(DB_SIGNED_SOAP_KEY) : null;
    const all: ClinicianReview[] = stored ? JSON.parse(stored) : [...SEED_REVIEWS];
    all.unshift(review);
    inMemorySignedSoap = all;
    if (typeof window !== "undefined") {
      localStorage.setItem(DB_SIGNED_SOAP_KEY, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent("LANT_SOAP_SIGNED", { detail: review }));
    }
  },

  // TELEHEALTH APPOINTMENTS
  getAppointments(patientId?: string, doctorId?: string): TelehealthSession[] {
    if (typeof window === "undefined") {
      let list = inMemoryAppointments;
      if (patientId) list = list.filter(a => a.patientId === patientId);
      if (doctorId) list = list.filter(a => a.doctorId === doctorId);
      return list;
    }
    try {
      const stored = localStorage.getItem(DB_APPOINTMENTS_KEY);
      const all: TelehealthSession[] = stored ? JSON.parse(stored) : SEED_TELEHEALTH;
      let list = all;
      if (patientId) list = list.filter(a => a.patientId === patientId);
      if (doctorId) list = list.filter(a => a.doctorId === doctorId);
      return list;
    } catch {
      return inMemoryAppointments;
    }
  },

  addAppointment(appointment: TelehealthSession) {
    const stored = typeof window !== "undefined" ? localStorage.getItem(DB_APPOINTMENTS_KEY) : null;
    const all: TelehealthSession[] = stored ? JSON.parse(stored) : [...SEED_TELEHEALTH];
    all.unshift(appointment);
    inMemoryAppointments = all;
    if (typeof window !== "undefined") {
      localStorage.setItem(DB_APPOINTMENTS_KEY, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent("LANT_APPOINTMENT_ADDED", { detail: appointment }));
    }
  },

  updateAppointmentStatus(id: string, status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled') {
    const stored = typeof window !== "undefined" ? localStorage.getItem(DB_APPOINTMENTS_KEY) : null;
    const all: TelehealthSession[] = stored ? JSON.parse(stored) : [...SEED_TELEHEALTH];
    const item = all.find(a => a.id === id);
    if (item) {
      item.status = status;
      inMemoryAppointments = all;
      if (typeof window !== "undefined") {
        localStorage.setItem(DB_APPOINTMENTS_KEY, JSON.stringify(all));
      }
    }
  },

  // TWO-WAY CHAT MESSAGES
  getMessages(threadId: string): ChatMessage[] {
    if (typeof window === "undefined") {
      return inMemoryMessages.filter(m => m.threadId === threadId);
    }
    try {
      const stored = localStorage.getItem(DB_MESSAGES_KEY);
      const all: ChatMessage[] = stored ? JSON.parse(stored) : SEED_MESSAGES_DB;
      return all.filter(m => m.threadId === threadId);
    } catch {
      return inMemoryMessages.filter(m => m.threadId === threadId);
    }
  },

  sendMessage(message: ChatMessage) {
    const stored = typeof window !== "undefined" ? localStorage.getItem(DB_MESSAGES_KEY) : null;
    const all: ChatMessage[] = stored ? JSON.parse(stored) : [...SEED_MESSAGES_DB];
    all.push(message);
    inMemoryMessages = all;
    if (typeof window !== "undefined") {
      localStorage.setItem(DB_MESSAGES_KEY, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent("LANT_NEW_MESSAGE", { detail: message }));
    }
  },

  markMessagesAsRead(threadId: string, currentUserId: string) {
    const stored = typeof window !== "undefined" ? localStorage.getItem(DB_MESSAGES_KEY) : null;
    const all: ChatMessage[] = stored ? JSON.parse(stored) : [...SEED_MESSAGES_DB];
    let changed = false;
    all.forEach(m => {
      if (m.threadId === threadId && m.receiverId === currentUserId && !m.isRead) {
        m.isRead = true;
        changed = true;
      }
    });
    if (changed) {
      inMemoryMessages = all;
      if (typeof window !== "undefined") {
        localStorage.setItem(DB_MESSAGES_KEY, JSON.stringify(all));
      }
    }
  },

  getUnreadCount(currentUserId: string): number {
    const stored = typeof window !== "undefined" ? localStorage.getItem(DB_MESSAGES_KEY) : null;
    const all: ChatMessage[] = stored ? JSON.parse(stored) : inMemoryMessages;
    return all.filter(m => m.receiverId === currentUserId && !m.isRead).length;
  },

  // CALL SIGNALING FOR ASYMMETRIC TELEHEALTH CALLS
  getCallSignal(patientId: string): IncomingCallSignal | null {
    if (typeof window === "undefined") return inMemoryCallSignal;
    try {
      const stored = localStorage.getItem(`${DB_CALL_SIGNAL_KEY}_${patientId}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  sendCallSignal(signal: IncomingCallSignal) {
    inMemoryCallSignal = signal;
    if (typeof window === "undefined") return;
    localStorage.setItem(`${DB_CALL_SIGNAL_KEY}_${signal.patientId}`, JSON.stringify(signal));
    window.dispatchEvent(new CustomEvent("LANT_INCOMING_CALL", { detail: signal }));
  },

  clearCallSignal(patientId: string) {
    inMemoryCallSignal = null;
    if (typeof window === "undefined") return;
    localStorage.removeItem(`${DB_CALL_SIGNAL_KEY}_${patientId}`);
    window.dispatchEvent(new CustomEvent("LANT_CALL_CLEARED", { detail: patientId }));
  }
};
