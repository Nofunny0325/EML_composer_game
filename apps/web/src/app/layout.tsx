import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "EML 합성 게임",
  description: "EML 연산자로 함수를 합성하는 퍼즐 게임"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <div className="shell">
          <header className="topbar">
            <Link className="brand" href="/app">
              EML Composer
            </Link>
            <nav className="nav">
              <Link href="/app/stages">스테이지</Link>
              <Link href="/app/settings">설정</Link>
              <Link href="/app/help">도움말</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
