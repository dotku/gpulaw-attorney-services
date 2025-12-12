import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/react';
import "./globals.css";

export const metadata: Metadata = {
  title: "GPULaw Attorney Services - AI-Powered Legal Tools",
  description: "Advanced AI-powered tools for legal document analysis, research, and drafting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
