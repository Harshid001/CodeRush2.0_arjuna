import "./globals.css";
import Providers from "@/components/Providers";
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata = {
  title: "NexusAPI — Premium AI & Data API Marketplace",
  description: "Discover, compare, and purchase enterprise-grade AI & Data APIs with pay-per-request and usage-capped pricing. The future of API commerce.",
  keywords: "AI APIs, Data APIs, API marketplace, pay-per-request, AI infrastructure",
  openGraph: {
    title: "NexusAPI — Premium AI & Data API Marketplace",
    description: "The premium marketplace for AI and Data APIs. Built for developers and AI agents.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body
        style={{
          background: '#050505',
          color: '#ffffff',
          fontFamily: "var(--font-inter), 'Inter', sans-serif",
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          minHeight: '100vh',
        }}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
