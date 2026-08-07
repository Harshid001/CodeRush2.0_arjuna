import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
