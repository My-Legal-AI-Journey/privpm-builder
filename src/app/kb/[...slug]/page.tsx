import Link from "next/link";
import { notFound } from "next/navigation";
import { listKb, mdToSafeHtml, readKbMarkdown, resolveKbFile } from "@/lib/kb";

type Props = { params: Promise<{ slug: string[] }> };

export function generateStaticParams() {
  return listKb().map((e) => ({ slug: e.slug.split("/") }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const hit = resolveKbFile(slug);
  return { title: hit ? `${hit.title} · 知识库` : "未找到 · 知识库" };
}

export default async function KbArticlePage({ params }: Props) {
  const { slug } = await params;
  const hit = resolveKbFile(slug);
  if (!hit) notFound();
  const html = mdToSafeHtml(readKbMarkdown(hit.abs));

  return (
    <main className="pm-shell">
      <header className="pm-header">
        <div>
          <p className="pm-brand">知识库</p>
          <h1 className="pm-title">{hit.title}</h1>
          <p className="pm-sub">{hit.slug}</p>
        </div>
        <nav className="pm-nav">
          <Link className="pm-btn-ghost" href="/kb">
            目录
          </Link>
          <Link className="pm-btn-ghost" href="/">
            助手
          </Link>
        </nav>
      </header>

      <article className="pm-card pm-kb-article" dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
