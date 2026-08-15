import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PrivPM — 隐私合规 PM AI 工作流助手",
  description: "功能 + 数据用途 + 法域 → 澄清问题、风险点、用户故事与验收、Prompt 模板、阶段小结",
};

const fontVars = {
  "--cal-font-display": "var(--font-poppins), Poppins, sans-serif",
  "--cal-font-ui": "var(--font-inter), Inter, sans-serif",
  "--cal-font-product": "var(--font-inter), Inter, sans-serif",
} as CSSProperties;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${poppins.variable}`}>
      <body style={fontVars}>{children}</body>
    </html>
  );
}
