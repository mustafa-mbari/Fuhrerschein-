import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Führerschein - تعلم قيادة السيارة في ألمانيا",
  description: "تطبيق شامل لتعلم واجتياز امتحان رخصة القيادة الألمانية",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: "dark:bg-slate-800 dark:text-white",
              duration: 3000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
