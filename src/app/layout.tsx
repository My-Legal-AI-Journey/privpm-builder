import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrivPM — 隐私合规 PM AI 工作流助手",
  description: "功能 + 数据用途 + 法域 → 澄清问题、风险点、用户故事与验收、Prompt 模板、阶段小结",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
