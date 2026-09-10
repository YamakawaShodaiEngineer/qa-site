import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchQAForSlug } from "@/lib/sheets";

export default async function QAPage({
  params,
}: {
  params: { slug: string };
}) {
  const items = await fetchQAForSlug(params.slug);

  if (items.length === 0) {
    notFound();
  }

  return (
    <main>
      <Link
        href="/"
        className="mb-10 inline-block text-sm text-ink/60 hover:text-accent"
      >
        ← すべてのトピック
      </Link>

      <h1 className="mb-10 font-serif text-3xl font-semibold capitalize leading-tight">
        {params.slug}
      </h1>

      <dl className="divide-y divide-rule border-t border-rule">
        {items.map((item, i) => (
          <div key={i} className="py-6">
            <dt className="mb-2 font-serif text-lg leading-snug">
              {item.question}
            </dt>
            <dd className="whitespace-pre-line leading-relaxed text-ink/80">
              {item.answer}
            </dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
