import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ninja Dojo",
  description: "One scroll in. Six ninjas ship it."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
