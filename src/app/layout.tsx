import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.clubstracker.com"),
  title: {
    default: "Clubs Tracker | EA Sports FC Pro Clubs",
    template: "%s | Clubs Tracker",
  },
  description:
    "Acompanhe estatísticas de clubes do EA Sports FC Pro Clubs. Busque times, veja jogadores, compare estatísticas e histórico de partidas.",
  keywords: [
    "EA Sports FC",
    "Pro Clubs",
    "estatísticas",
    "FIFA",
    "clubs tracker",
    "futebol",
  ],
  authors: [{ name: "Clubs Tracker" }],
  alternates: {
    canonical: "https://www.clubstracker.com",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.clubstracker.com",
    siteName: "Clubs Tracker",
    title: "Clubs Tracker | EA Sports FC Pro Clubs",
    description:
      "Acompanhe estatísticas de clubes do EA Sports FC Pro Clubs. Busque times, veja jogadores, compare estatísticas e histórico de partidas.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clubs Tracker | EA Sports FC Pro Clubs",
    description:
      "Acompanhe estatísticas de clubes do EA Sports FC Pro Clubs.",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "wYJsQcRLBdumL_XcqgW1KLuX5D0A6gOMmw6erSJKNs4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          {children}
          <Analytics />
        </LanguageProvider>
      </body>
    </html>
  );
}
