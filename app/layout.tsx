import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eidgah Times — a community directory",
  description:
    "A community-maintained directory of Eid prayer locations, times, and notes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&display=swap"
        />
      </head>
      <body className="font-sans relative">
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
