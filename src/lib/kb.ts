import fs from "node:fs";
import path from "node:path";

const KB_ROOT = path.join(process.cwd(), "知识库", "PIPL");

export type KbEntry = {
  slug: string;
  title: string;
  section: "条文" | "专题" | "比较";
  relPath: string;
};

function walkMd(dir: string, section: KbEntry["section"], acc: KbEntry[]) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith("_") || name.startsWith(".")) continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      walkMd(full, section, acc);
      continue;
    }
    if (!name.endsWith(".md")) continue;
    const base = name.replace(/\.md$/, "");
    const rel = path.relative(KB_ROOT, full).split(path.sep).join("/");
    const slug = rel.replace(/\.md$/, "");
    acc.push({ slug, title: base, section, relPath: rel });
  }
}

export function listKb(): KbEntry[] {
  const acc: KbEntry[] = [];
  walkMd(path.join(KB_ROOT, "条文"), "条文", acc);
  walkMd(path.join(KB_ROOT, "专题"), "专题", acc);
  walkMd(path.join(KB_ROOT, "比较"), "比较", acc);
  return acc.sort((a, b) => a.slug.localeCompare(b.slug, "zh"));
}

export function resolveKbFile(slugParts: string[]): { abs: string; slug: string; title: string } | null {
  const slug = slugParts.map(decodeURIComponent).join("/");
  const abs = path.join(KB_ROOT, `${slug}.md`);
  if (!abs.startsWith(KB_ROOT)) return null;
  if (!fs.existsSync(abs)) return null;
  const title = path.basename(slug);
  return { abs, slug, title };
}

export function readKbMarkdown(abs: string): string {
  return fs.readFileSync(abs, "utf8");
}

/** Very small markdown subset → HTML for KB reading. */
export function mdToSafeHtml(md: string): string {
  const escaped = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lines = escaped.split(/\r?\n/);
  const out: string[] = [];
  let inUl = false;
  let inOl = false;
  let inCode = false;
  let para: string[] = [];

  const flushPara = () => {
    if (!para.length) return;
    out.push(`<p>${inline(para.join(" "))}</p>`);
    para = [];
  };
  const closeLists = () => {
    if (inUl) {
      out.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      out.push("</ol>");
      inOl = false;
    }
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      flushPara();
      closeLists();
      if (!inCode) {
        out.push("<pre class=\"pm-pre\"><code>");
        inCode = true;
      } else {
        out.push("</code></pre>");
        inCode = false;
      }
      continue;
    }
    if (inCode) {
      out.push(`${line}\n`);
      continue;
    }

    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      flushPara();
      closeLists();
      const level = h[1].length;
      out.push(`<h${level}>${inline(h[2])}</h${level}>`);
      continue;
    }

    const ul = /^[-*]\s+(.*)$/.exec(line);
    if (ul) {
      flushPara();
      if (inOl) {
        out.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        out.push("<ul>");
        inUl = true;
      }
      out.push(`<li>${inline(ul[1])}</li>`);
      continue;
    }

    const ol = /^\d+\.\s+(.*)$/.exec(line);
    if (ol) {
      flushPara();
      if (inUl) {
        out.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        out.push("<ol>");
        inOl = true;
      }
      out.push(`<li>${inline(ol[1])}</li>`);
      continue;
    }

    if (!line.trim()) {
      flushPara();
      closeLists();
      continue;
    }
    para.push(line.trim());
  }
  flushPara();
  closeLists();
  if (inCode) out.push("</code></pre>");
  return out.join("\n");
}

function inline(s: string): string {
  return s
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/`([^`]+)`/g, "<code class=\"pm-code\">$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

/** Map citation tree path / known slug to /kb slug if file exists. */
export function citationToHref(slug?: string, pathLabel?: string): string | null {
  if (slug) {
    const abs = path.join(KB_ROOT, `${slug}.md`);
    if (fs.existsSync(abs)) return `/kb/${slug.split("/").map(encodeURIComponent).join("/")}`;
  }
  if (!pathLabel) return null;
  const art = /第(\d+)条/.exec(pathLabel);
  if (art) {
    const entries = listKb().filter((e) => e.section === "条文" && e.title.includes(`第${art[1]}条`));
    if (entries[0]) return `/kb/${entries[0].slug.split("/").map(encodeURIComponent).join("/")}`;
  }
  const topic = /专题[“"]([^”"]+)[”"]/.exec(pathLabel) || /「([^」]+)」/.exec(pathLabel);
  if (topic) {
    const name = topic[1];
    const hit = listKb().find((e) => e.section === "专题" && e.title === name);
    if (hit) return `/kb/${hit.slug.split("/").map(encodeURIComponent).join("/")}`;
  }
  if (/EU\s*要点卡|EU-要点卡/.test(pathLabel)) {
    return `/kb/${encodeURIComponent("比较")}/${encodeURIComponent("EU-要点卡")}`;
  }
  return null;
}
