import { redirect } from "next/navigation";

export default function LegacyScanPage() {
  redirect("/patient/scan");
}
