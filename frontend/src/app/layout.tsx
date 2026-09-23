import type { Metadata, Viewport } from "next";
import { Anton, Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({ variable: "--font-roboto", subsets: ["latin"], weight: ["400", "500", "700", "900"] });
const anton = Anton({ variable: "--font-anton", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: { default: "Activity Board · CARE Rwanda", template: "%s · CARE Rwanda" },
  description: "See what every CARE Rwanda project team is working on today and this week.",
};

export const viewport: Viewport = {
  themeColor: "#241e4e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${roboto.variable} ${anton.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
