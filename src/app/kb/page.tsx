import Link from "next/link";
import { listKb } from "@/lib/kb";

export const metadata = {
  title: "知识库 · PrivPM",
  description: "《个保法》注释条文、专题与比较库",
};

export default function KbIndexPage() {
  const entries = listKb();
  const sections = [
    { key: "条文" as const, label: "条文" },
    { key: "专题" as const, label: "专题" },
    { key: "比较" as const, label: "比较" },
  ];

  return (
    <main className="pm-shell">
      <header className="pm-header">
        <div>
          <p className="pm-brand">PrivPM</p>
          <h1 className="pm-title">知识库</h1>
          <p className="pm-sub">浏览《个保法》注释条文、专题与中美欧比较。可从助手“引用”Tab 点进来学习。</p>
        </div>
        <nav className="pm-nav">
          <Link className="pm-btn-ghost" href="/">
            返回助手
          </Link>
        </nav>
      </header>

      {sections.map((sec) => {
        const items = entries.filter((e) => e.section === sec.key);
        return (
          <section key={sec.key} className="pm-card pm-kb-section">
            <h2 className="pm-h2">
              {sec.label}
              <span className="pm-tag pm-kb-count">{items.length}</span>
            </h2>
            <ul className="pm-kb-list">
              {items.map((e) => (
                <li key={e.slug}>
                  <Link href={`/kb/${e.slug.split("/").map(encodeURIComponent).join("/")}`}>{e.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
