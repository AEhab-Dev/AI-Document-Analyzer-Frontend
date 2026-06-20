import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Document Analyzer",
  description: "Analyze CVs, contracts, and policy documents instantly",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}