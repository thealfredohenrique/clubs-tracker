import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  openGraph: {
    type: "website",
    locale: "pt_BR",
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
        {children}
      </body>
    </html>
  );
}
