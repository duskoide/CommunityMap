import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CommunityMap | Peta Kerawanan Jalan Real-Time",
  description:
    "Platform crowdsourcing untuk pelaporan kondisi jalan dan peta kerawanan real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
