import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Automate Platform",
  description: "Automate your social media management tasks with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
