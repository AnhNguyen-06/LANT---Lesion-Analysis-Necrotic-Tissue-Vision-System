"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export type RoleType = "patient" | "doctor";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: RoleType;
  phone?: string;
  medicalRecordNumber?: string; // For patient
  licenseNumber?: string;       // For doctor
  patientId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role: RoleType) => void;
  register: (userData: Partial<AuthUser>) => void;
  logout: () => void;
  switchRole: (role: RoleType) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "LANT_AUTH_SESSION_V2";

export const DEMO_PATIENT: AuthUser = {
  id: "USR-PAT-01",
  fullName: "Nguyễn Văn An",
  email: "an.nguyen62@gmail.com",
  role: "patient",
  phone: "0918 234 567",
  medicalRecordNumber: "MRN-2024-8841",
  patientId: "PAT-10842",
};

export const DEMO_DOCTOR: AuthUser = {
  id: "USR-DOC-01",
  fullName: "BS. CKI Trần Minh Đức",
  email: "dr.duc@hospital.med.vn",
  role: "doctor",
  phone: "0908 765 432",
  licenseNumber: "CCHN-2021-8842",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthUser;
        setUser(parsed);
      } else {
        // Default unauthenticated on root landing
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (email: string, role: RoleType) => {
    let newUser: AuthUser;
    if (role === "doctor") {
      newUser = {
        ...DEMO_DOCTOR,
        email: email || DEMO_DOCTOR.email,
      };
    } else {
      newUser = {
        ...DEMO_PATIENT,
        email: email || DEMO_PATIENT.email,
      };
    }

    setUser(newUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    if (newUser.patientId) {
      localStorage.setItem("LANT_ACTIVE_PATIENT_ID", newUser.patientId);
    }

    // Redirect to respective dashboard
    if (role === "doctor") {
      router.push("/doctor/dashboard");
    } else {
      router.push("/patient/dashboard");
    }
  };

  const register = (userData: Partial<AuthUser>) => {
    const role = userData.role || "patient";
    const newUser: AuthUser = {
      id: `USR-${Date.now()}`,
      fullName: userData.fullName || (role === "patient" ? "Bệnh nhân mới" : "Bác sĩ mới"),
      email: userData.email || "user@lant.med.vn",
      role,
      phone: userData.phone,
      medicalRecordNumber: userData.medicalRecordNumber || (role === "patient" ? "MRN-2026-NEW" : undefined),
      licenseNumber: userData.licenseNumber || (role === "doctor" ? "CCHN-2026-NEW" : undefined),
      patientId: role === "patient" ? "PAT-10842" : undefined
    };

    setUser(newUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    if (newUser.patientId) {
      localStorage.setItem("LANT_ACTIVE_PATIENT_ID", newUser.patientId);
    }

    if (role === "doctor") {
      router.push("/doctor/dashboard");
    } else {
      router.push("/patient/dashboard");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    // Explicitly return to root Role Selection Gateway
    router.push("/");
  };

  const switchRole = (role: RoleType) => {
    login("", role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
