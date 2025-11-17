import type { Metadata } from "next";
import { Geist, Geist_Mono, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["vietnamese", "latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "FPT Pray | Bàn thờ số",
  description:
    "Nhập email và lời nguyện, thắp nhang online, lưu lại vào Google Docs.",
  metadataBase:
    process.env.NEXT_PUBLIC_SITE_URL !== undefined
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
      : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${beVietnam.variable} font-be-vietnam bg-[#03010c] text-white antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
