import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Lora, Poppins } from "next/font/google";

export const metadata: Metadata = {
  title: "Female Life OS (MVP)",
  description: "节律管理 + 隐形劳动显性化 + 多 Agent 编排的生活中枢（MVP）"
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
  display: "swap"
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora",
  display: "swap"
});

function Nav() {
  return (
    <div className="sticky top-0 z-20 border-b border-flo-border bg-[rgba(236,233,224,0.86)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-4">
        <Link href="/" className="font-heading text-sm font-semibold tracking-wide">
          Female Life OS
        </Link>
        <div className="text-xs text-flo-text-secondary">MVP</div>
        <div className="ml-auto flex items-center gap-1 text-sm">
          <Link className="rounded-full px-3 py-1.5 text-flo-text-secondary hover:bg-flo-bg-raised hover:text-flo-text-primary" href="/today">
            Today
          </Link>
          <Link className="rounded-full px-3 py-1.5 text-flo-text-secondary hover:bg-flo-bg-raised hover:text-flo-text-primary" href="/chat">
            Chat
          </Link>
          <Link className="rounded-full px-3 py-1.5 text-flo-text-secondary hover:bg-flo-bg-raised hover:text-flo-text-primary" href="/mental-load">
            Mental Load
          </Link>
          <Link className="rounded-full px-3 py-1.5 text-flo-text-secondary hover:bg-flo-bg-raised hover:text-flo-text-primary" href="/onboarding">
            建档
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${poppins.variable} ${lora.variable}`}>
      <body className="min-h-screen font-body antialiased">
        <Nav />
        <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
      </body>
    </html>
  );
}
