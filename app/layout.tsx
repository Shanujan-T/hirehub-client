import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/providers/auth-provider";
import { Footer, Navbar } from "@/components/layout/main-layout";
import { MeshBackground } from "@/components/layout/mesh-background";
import { ThemeInitScript } from "@/components/theme/theme-init";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning>
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
              position="bottom-right"
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
