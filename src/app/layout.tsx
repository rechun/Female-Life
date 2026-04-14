import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Female Life OS (MVP)",
  description: "节律管理 + 隐形劳动显性化 + 多 Agent 编排的生活中枢（MVP）"
};

function Nav() {
  return (
    <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
        <Link href="/" className="font-semibold">
          Female Life OS
        </Link>
        <div className="text-sm text-neutral-500">MVP</div>
        <div className="ml-auto flex gap-3 text-sm">
          <Link className="hover:underline" href="/today">
            Today
          </Link>
          <Link className="hover:underline" href="/chat">
            Chat
          </Link>
          <Link className="hover:underline" href="/mental-load">
            Mental Load
          </Link>
          <Link className="hover:underline" href="/onboarding">
            建档
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Nav />
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}

