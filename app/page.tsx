import Link from "next/link";
import { fetchAllSlugs } from "@/lib/sheets"; // 「@」はルートディレクトリを示す（このプロジェクト固有の指定の仕方=tsconfig.jsonで定義）

export default async function HomePage() {
  let slugs: string[] = []; // slugsに文字列型の1次元配列を定義
  let error: string | null = null; // errorに文字列型またはnullを定義（初期値はnull）

  try {
    slugs = await fetchAllSlugs();
  } catch (e) {
    error = e instanceof Error ? e.message : "不明なエラーが発生しました";
  }

  return (
    <main>
      <h1 className="mb-3 font-serif text-4xl font-semibold leading-tight">
        よくある質問
      </h1>
      <p className="mb-10 text-ink/70">
        トピックを選ぶと、そのページ専用のQ&Aが表示されます。
      </p>

      {error && (
        <p className="rounded border border-rule bg-white/40 px-4 py-3 text-sm text-ink/80">
          {error}
        </p>
      )}

      {!error && slugs.length === 0 && (
        <p className="text-ink/70">
          スプレッドシートにまだQ&Aが登録されていません。
        </p>
      )}

      {!error && slugs.length > 0 && (
        <ul className="divide-y divide-rule border-t border-rule">
          {slugs.map((slug) => (
            <li key={slug}>
              <Link
                href={`/${slug}`}
                className="group flex items-baseline justify-between py-4 transition-colors hover:text-accent"
              >
                <span className="font-serif text-lg">{slug}</span>
                <span className="text-sm text-ink/40 group-hover:text-accent">
                  見る
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
