import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { GlobalEffects } from "@/components/effects/GlobalEffects";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://brunno.lat"),
  title: "Brunno | Full Stack Developer & Cybersecurity Student",
  description:
    "Full Stack Developer • Cybersecurity Student. Real-time Discord presence and live Last.fm listening data.",
  openGraph: {
    title: "Brunno | Full Stack Developer & Cybersecurity Student",
    description: "Full Stack Developer • Cybersecurity Student",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brunno | Full Stack Developer & Cybersecurity Student",
    description: "Full Stack Developer • Cybersecurity Student",
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
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-base text-primary">
        <GlobalEffects />
        {children}
      </body>
    </html>
  );
}
