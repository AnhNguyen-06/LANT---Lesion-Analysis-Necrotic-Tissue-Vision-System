import type { Metadata } from "next";
import { Montserrat, Poppins, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const montserrat = Montserrat({
  subsets: ["vietnamese", "latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["vietnamese", "latin"],
  variable: "--font-playfair",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400", "600", "700", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["vietnamese", "latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LANT — Hệ Thống Thị Giác Y Khoa Giám Sát Vết Thương",
  description: "Hệ thống Thị giác Máy tính Y tế cá nhân hóa và bảo mật, phân tích hình thái, đo kích thước cm² và kết nối hội chẩn Telehealth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${montserrat.variable} ${poppins.variable} ${playfair.variable} ${jetbrainsMono.variable} scroll-smooth`}
    >
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col selection:bg-oceanic-100 selection:text-oceanic-900 font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
