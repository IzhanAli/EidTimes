import type { Metadata } from "next";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "Eidgah Times — crowd-verified prayer times",
  description:
    "Crowd-verified Eid prayer locations, times, and notes — searchable by city.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..600&family=Hanken+Grotesk:wght@400..700&family=Lato:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="font-sans relative">
        <PwaRegister />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
