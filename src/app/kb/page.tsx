import Link from "next/link";
import { COMPARE_CARDS, listArticles, listTopicsGrouped } from "@/lib/kb";

export const metadata = {
  title: "知识库 · PrivPM",
  description: "《个保法》注释条文、专题与中美欧比较",
};

function hrefFor(slug: string) {
  return `/kb/${slug.split("/").map(encodeURIComponent).join("/")}`;
}

export default function KbIndexPage() {
  const articles = listArticles();
  const topicGroups = listTopicsGrouped();

  return (
    <main className="pm-shell">
      <header className="pm-header">
        <div>
          <p className="pm-brand">PrivPM</p>
          <h1 className="pm-title">知识库</h1>
          <p className="pm-sub">
            按条序阅读《个保法》注释，按主题浏览专题，并对照中美欧比较报告。从助手“引用”Tab
            可直接点进来。
          </p>
        </div>
        <nav className="pm-nav">
          <Link className="pm-btn-ghost" href="/">
            返回助手
          </Link>
        </nav>
      </header>

      <nav className="pm-kb-toc pm-card">
        <a href="#articles">条文</a>
        <a href="#topics">专题</a>
        <a href="#compare">比较</a>
      </nav>

      <section id="articles" className="pm-card pm-kb-section">
        <h2 className="pm-h2">
          条文
          <span className="pm-tag">{articles.length}</span>
        </h2>
        <p className="pm-muted">按《个保法》条号 1–73 排列。</p>
        <ol className="pm-kb-article-grid">
          {articles.map((e) => (
            <li key={e.slug}>
              <Link href={hrefFor(e.slug)}>
                <span className="pm-kb-art-no">第{e.articleNo}条</span>
                <span className="pm-kb-art-title">{e.title.replace(/^第\d+条-/, "")}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section id="topics" className="pm-kb-section-wrap">
        <h2 className="pm-h2 pm-kb-block-title">
          专题
          <span className="pm-tag">{topicGroups.reduce((n, g) => n + g.items.length, 0)}</span>
        </h2>
        {topicGroups.map((g) => (
          <section key={g.id} className="pm-card pm-kb-section">
            <h3 className="pm-kb-group-title">{g.label}</h3>
            <ul className="pm-kb-list">
              {g.items.map((e) => (
                <li key={e.slug}>
                  <Link href={hrefFor(e.slug)}>{e.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </section>

      <section id="compare" className="pm-card pm-kb-section">
        <h2 className="pm-h2">
          中美欧比较
          <span className="pm-tag">{COMPARE_CARDS.length}</span>
        </h2>
        <p className="pm-muted">
          来源：腾讯研究院《中美欧个人信息保护法比较》（以中国个保法、欧盟 GDPR、加州 CCPA&amp;CPRA
          为样本）。报告写于 2021 年；不确定处请以本库现行条文/专题为准。
        </p>
        <div className="pm-kb-compare-grid">
          {COMPARE_CARDS.map((c) => (
            <Link key={c.slug} href={hrefFor(c.slug)} className="pm-kb-compare-card">
              <strong>{c.title}</strong>
              <span>{c.blurb}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
