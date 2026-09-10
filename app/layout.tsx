import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Q&A",
  description: "よくある質問",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen font-sans antialiased">
        <div className="mx-auto max-w-prose px-6 py-16">{children}</div>
      </body>
    </html>
  );
}
