import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Chatbot from "@/components/Chatbot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agency Portfolio",
  description: "Award-winning dark-themed personal portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="flex min-h-screen bg-gradient-to-b from-[#020617] via-[#1a0a0b] to-[#2d0f04] text-[#ededed]">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden min-h-screen">
          {children}
        </main>
        <Chatbot />
      </body>
    </html>
  );
}
