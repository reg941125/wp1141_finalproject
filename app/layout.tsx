import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "家教網平台",
  description: "家教網平台 - 題目討論、家教配對、題目庫",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}

