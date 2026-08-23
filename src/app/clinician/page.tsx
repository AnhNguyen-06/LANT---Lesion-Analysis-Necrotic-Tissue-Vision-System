import { redirect } from "next/navigation";

export default function LegacyClinicianPage() {
  redirect("/doctor/dashboard");
}
