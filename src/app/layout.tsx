import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lander — Landing Page Builder",
  description: "Build and deploy high-converting landing pages for your clients",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full">{children}</body>
    </html>
  );
}
