"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserAccount, VietnamAddress } from "@/types/medical-schema";
import { DBStore, SEED_USERS_DB } from "@/lib/db-store";

export type RoleType = "patient" | "doctor";

export interface AuthContextType {
  user: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role: RoleType, password?: string) => boolean;
  register: (userData: {
    fullName: string;
    email: string;
    phone: string;
    password?: string;
    role: RoleType;
    medicalRecordNumber?: string;
    licenseNumber?: string;
    specialty?: string;
    address?: VietnamAddress;
  }) => UserAccount;
  updateProfile: (updates: Partial<UserAccount>) => UserAccount | null;
  completeTour: () => void;
  logout: () => void;
  switchRole: (role: RoleType) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "LANT_AUTH_SESSION_V2";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session from DBStore or localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserAccount;
        // Verify from DBStore to get latest changes
        const dbUser = DBStore.getUserById(parsed.id);
        if (dbUser) {
          setUser(dbUser);
        } else {
          setUser(parsed);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (email: string, role: RoleType, password?: string): boolean => {
    const targetRole = role === "doctor" ? "CLINICIAN" : "PATIENT";
    let matchedUser: (UserAccount & { passwordHash: string }) | undefined;

    if (email && email.trim()) {
      matchedUser = DBStore.getUserByEmail(email.trim());
      // If user exists but with wrong role, or password doesn't match
      if (matchedUser && matchedUser.role !== targetRole) {
        // Find default for role
        matchedUser = undefined;
      }
    }

    // If no specific match, pick primary demo user for the role
    if (!matchedUser) {
      if (role === "doctor") {
        matchedUser = DBStore.getUserByEmail("doctor.duc@lant.med");
      } else {
        matchedUser = DBStore.getUserByEmail("patient.an@lant.med");
      }
    }

    if (!matchedUser) {
      // Fallback from SEED
      const fallback = SEED_USERS_DB.find(u => u.role === targetRole);
      if (fallback) matchedUser = fallback;
    }

    if (matchedUser) {
      const authUser: UserAccount = {
        id: matchedUser.id,
        email: matchedUser.email,
        fullName: matchedUser.fullName,
        role: matchedUser.role,
        phone: matchedUser.phone,
        dob: matchedUser.dob,
        gender: matchedUser.gender,
        avatarUrl: matchedUser.avatarUrl,
        address: matchedUser.address,
        medicalHistory: matchedUser.medicalHistory,
        medicalRecordNumber: matchedUser.medicalRecordNumber,
        licenseNumber: matchedUser.licenseNumber,
        specialty: matchedUser.specialty,
        patientId: matchedUser.patientId,
        assignedDoctorId: matchedUser.assignedDoctorId,
        tourCompleted: matchedUser.tourCompleted,
        createdAt: matchedUser.createdAt
      };

      setUser(authUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      if (authUser.patientId) {
        localStorage.setItem("LANT_ACTIVE_PATIENT_ID", authUser.patientId);
      }

      if (role === "doctor") {
        router.push("/doctor/dashboard");
      } else {
        router.push("/patient/dashboard");
      }
      return true;
    }

    return false;
  };

  const register = (userData: {
    fullName: string;
    email: string;
    phone: string;
    password?: string;
    role: RoleType;
    medicalRecordNumber?: string;
    licenseNumber?: string;
    specialty?: string;
    address?: VietnamAddress;
  }): UserAccount => {
    const role = userData.role === "doctor" ? "CLINICIAN" : "PATIENT";
    const newUser = DBStore.registerUser({
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone,
      passwordHash: userData.password || "123456",
      role,
      medicalRecordNumber: userData.medicalRecordNumber,
      licenseNumber: userData.licenseNumber,
      specialty: userData.specialty,
      address: userData.address
    });

    setUser(newUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    if (newUser.patientId) {
      localStorage.setItem("LANT_ACTIVE_PATIENT_ID", newUser.patientId);
    }

    if (userData.role === "doctor") {
      router.push("/doctor/dashboard");
    } else {
      router.push("/patient/dashboard");
    }

    return newUser;
  };

  const updateProfile = (updates: Partial<UserAccount>): UserAccount | null => {
    if (!user) return null;
    const updated = DBStore.updateUserProfile(user.id, updates);
    if (updated) {
      setUser(updated);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    }
    return updated;
  };

  const completeTour = () => {
    if (!user) return;
    updateProfile({ tourCompleted: true });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
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
        updateProfile,
        completeTour,
        logout,
        switchRole
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
