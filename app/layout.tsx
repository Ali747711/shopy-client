import type { Metadata } from "next";
import { Geist, Geist_Mono, Rubik, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { DockNav } from "@/components/dock-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { cn } from "@/lib/utils";

const spaceGrotesk = Space_Grotesk({subsets:['latin'],variable:'--font-sans'});

const rubik = Rubik({ subsets: ['latin'], variable: '--font-rubik' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shopy — Shop at the speed of thought",
  description:
    "AI-powered shopping. Search in plain English, get grounded recommendations, and find exactly what you mean — not just what you type.",
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
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", spaceGrotesk.variable, rubik.variable)}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <CartProvider>
              {children}
              <DockNav />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
