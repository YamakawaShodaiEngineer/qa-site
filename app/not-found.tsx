import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <h1 className="mb-4 font-serif text-3xl font-semibold">
        該当するQ&Aがありません
      </h1>
      <p className="mb-8 text-ink/70">
        このページ名に一致するQ&Aはスプレッドシートに登録されていません。
      </p>
      <Link href="/" className="text-accent hover:underline">
        すべてのトピックを見る
      </Link>
    </main>
  );
}
