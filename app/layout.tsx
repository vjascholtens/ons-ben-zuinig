import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Ons Ben Zuinig", template: "%s | Ons Ben Zuinig" },
  description: "Een rustige, overzichtelijke plek voor bonnetjes, facturen en je administratie.",
  applicationName: "Ons Ben Zuinig",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Ons Ben Zuinig" },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#163f36",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
