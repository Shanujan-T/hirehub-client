import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/providers/auth-provider";
import { Footer, Navbar } from "@/components/layout/main-layout";
import { MeshBackground } from "@/components/layout/mesh-background";
import { ThemeInitScript } from "@/components/theme/theme-init";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "HireHub",
    template: "%s | HireHub",
  },
  description: "Find jobs, companies, and communities on HireHub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${plusJakarta.variable}`}
    >
      <head>
        <ThemeInitScript />
      </head>
      <body className="flex min-h-screen flex-col bg-surface">
        <ThemeProvider>
          <MeshBackground />
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster
              position="top-right"
              richColors
              closeButton
              toastOptions={{
                classNames: {
                  toast: "bg-surface-card border-default text-heading",
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
