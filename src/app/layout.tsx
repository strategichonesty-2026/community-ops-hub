import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Community Ops Hub",
  description: "Member directory, dues, and communication for community organizations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
