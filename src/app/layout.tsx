import type { Metadata, Viewport } from "next";
import { Manrope, Spectral } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";
import "./auth.css";

const spectral = Spectral({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Russian Trainer · Grammar Lab",
  description:
    "Practice Russian adjective–noun agreement, gender, and case endings — grammar-first drills from classroom materials.",
  appleWebApp: {
    capable: true,
    title: "Russian Trainer",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f3f6f8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spectral.variable} ${manrope.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="site-footer">
          <div className="shell">
            Built for classroom grammar practice · Level 1 focuses on adjective–noun
            gender agreement
          </div>
        </footer>
      </body>
    </html>
  );
}
