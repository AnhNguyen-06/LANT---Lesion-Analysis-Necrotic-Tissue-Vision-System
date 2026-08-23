import { redirect } from "next/navigation";

export default function LegacyClinicianPatientPage({ params }: { params: { patientId: string } }) {
  redirect(`/doctor/patient/${params.patientId}`);
}
