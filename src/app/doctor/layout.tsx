"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { DoctorNavbar } from "@/components/doctor-navbar";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/auth/login?role=doctor");
      } else if (user?.role === "patient") {
        alert("Quyền truy cập bị từ chối: Tài khoản Bệnh nhân không thể truy cập Cổng Bác sĩ.");
        router.push("/patient/dashboard");
      }
    }
  }, [user, isLoading, isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-transparent text-slate-900 flex flex-col font-sans">
      <DoctorNavbar />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
