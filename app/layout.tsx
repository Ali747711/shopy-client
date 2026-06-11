import type { Metadata } from "next";
import { Geist, Geist_Mono, Rubik, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { DockNav } from "@/components/dock-nav";
import { I18nProvider } from "@/components/i18n-provider";
import { PageTransitionWrapper } from "@/components/page-transition-wrapper";
import { PwaRegister } from "@/components/pwa-register";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CurrencyProvider } from "@/lib/currency";
import { WishlistProvider } from "@/lib/wishlist";
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
  manifest: "/manifest.webmanifest",
  // themeColor is set here so Next.js injects the <meta name="theme-color"> tag.
  // The actual manifest.ts file provides the colour to the browser install flow.
  other: {
    "theme-color": "#000000",
  },
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
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <I18nProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
              <CurrencyProvider>
              <TooltipProvider>
                <PageTransitionWrapper>
                  {children}
                </PageTransitionWrapper>
                <DockNav />
                <Toaster />
                <PwaRegister />
              </TooltipProvider>
              </CurrencyProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
