import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "EML Composer",
  description: "Function composition puzzle game with the EML operator."
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
              <Link href="/app/stages">Stages</Link>
              <Link href="/app/settings">Settings</Link>
              <Link href="/app/help">Help</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}

