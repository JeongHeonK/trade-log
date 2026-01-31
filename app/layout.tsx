import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const notoSans = Noto_Sans({ variable: "--font-sans", subsets: ["latin"] });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trade Log",
  description: "로컬 퍼스트 매매일지",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={notoSans.variable}>
      <body className={`${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
