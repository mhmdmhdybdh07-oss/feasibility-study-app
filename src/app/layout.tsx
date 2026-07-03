import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/components/app-provider";

export const metadata: Metadata = {
  title: "برنامج إعداد دراسات الجدوى | Feasibility Study Builder",
  description: "نظام متكامل لإعداد دراسات الجدوى الاقتصادية والاجتماعية والبيئية والقانونية والتسويقية والفنية والمالية",
  keywords: ["دراسة جدوى", "Feasibility Study", "Yemen", "الريال اليمني", "مشروع"],
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  applicationName: "Feasibility Study Builder",
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider>
          <AppProvider>
            {children}
            <Toaster />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
