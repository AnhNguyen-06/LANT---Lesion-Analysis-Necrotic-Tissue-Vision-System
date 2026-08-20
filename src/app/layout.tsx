import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LANT — Hệ Thống Thị Giác Y Khoa Giám Sát Vết Thương",
  description: "Phát triển LANT — Hệ thống Thị giác Máy tính Y tế cá nhân hóa và bảo mật, phân tích hình thái, đo kích thước cm² và theo dõi tiến trình vết thương hở.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col selection:bg-oceanic-100 selection:text-oceanic-900">
        {children}
      </body>
    </html>
  );
}
