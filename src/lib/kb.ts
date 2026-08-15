import fs from "node:fs";
import path from "node:path";

const KB_ROOT = path.join(process.cwd(), "知识库", "PIPL");

export type KbEntry = {
  slug: string;
  title: string;
  section: "条文" | "专题" | "比较";
  relPath: string;
  articleNo?: number;
};

export const TOPIC_GROUPS: { id: string; label: string; titles: string[] }[] = [
  {
    id: "consent",
    label: "同意与告知",
    titles: [
      "实务中的知情-同意操作",
      "隐私政策设计",
      "履行合同所必需",
      "在合理的范围内处理已公开的个人信息",
      "新闻报道与舆论监督",
    ],
  },
  {
    id: "crossborder",
    label: "跨境与出境",
    titles: [
      "第三章-跨境规则引言",
      "数据出境标准合同",
      "数据出境安全评估",
      "个人信息出境认证",
      "国内常用咨询电话",
    ],
  },
  {
    id: "algo",
    label: "算法与自动化决策",
    titles: [
      "个性化推荐",
      "人工智能与算法治理",
      "算法推荐与自动化决策的关系",
      "自动化决策的认定",
      "个性化展示是否自动化决策",
      "算法与人工智能备案",
      "内容标识-AIGC标识",
    ],
  },
  {
    id: "minors",
    label: "未成年人",
    titles: [
      "儿童个人信息保护",
      "如何验证家长同意",
      "GDPR儿童的同意",
      "可能影响未成年人身心健康的网络信息分类办法",
    ],
  },
  {
    id: "security",
    label: "匿名化、安全与事件",
    titles: [
      "匿名化与去标识化",
      "数据泄露与网络安全事件",
      "数据泄露报告义务",
      "其他对政府部门的通知义务",
    ],
  },
  {
    id: "other",
    label: "其他专题",
    titles: [
      "个人信息共享行为区分",
      "可携权",
      "突发公共卫生事件中的个人信息保护",
      "社会责任报告",
      "外部独立的监督机构",
      "数据保护相关认证",
      "ISO体系认证",
    ],
  },
];

export const COMPARE_CARDS: { slug: string; title: string; blurb: string }[] = [
  { slug: "比较/00-引言", title: "00 · 引言与图标说明", blurb: "报告背景、样本选择与比较矢量图读法" },
  { slug: "比较/01-立法模式与适用范围", title: "01 · 立法模式与适用范围", blurb: "综合立法 vs 场景立法；域内/域外适用" },
  { slug: "比较/02-个人信息的定义与分类", title: "02 · 定义与分类", blurb: "个人信息、敏感信息、匿名化边界" },
  { slug: "比较/03-合法性基础", title: "03 · 合法性基础", blurb: "同意、合同必要及其他合法基础对照" },
  { slug: "比较/04-个人信息的跨境提供", title: "04 · 跨境提供", blurb: "出境机制与传输工具比较" },
  { slug: "比较/05-信息主体的权利", title: "05 · 信息主体权利", blurb: "查阅、删除、可携等权利谱系" },
  { slug: "比较/EU-要点卡", title: "EU 要点卡", blurb: "合法基础 / 自动化决策 / 跨境 / DPIA 速查" },
];

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
    const art = /第(\d+)条/.exec(base);
    acc.push({
      slug,
      title: base,
      section,
      relPath: rel,
      articleNo: art ? Number(art[1]) : undefined,
    });
  }
}

function articleSortKey(e: KbEntry): number {
  return e.articleNo ?? 9999;
}

export function listKb(): KbEntry[] {
  const acc: KbEntry[] = [];
  walkMd(path.join(KB_ROOT, "条文"), "条文", acc);
  walkMd(path.join(KB_ROOT, "专题"), "专题", acc);
  walkMd(path.join(KB_ROOT, "比较"), "比较", acc);
  return acc.sort((a, b) => {
    if (a.section !== b.section) {
      const order = { 条文: 0, 专题: 1, 比较: 2 };
      return order[a.section] - order[b.section];
    }
    if (a.section === "条文") return articleSortKey(a) - articleSortKey(b);
    if (a.section === "比较") return a.slug.localeCompare(b.slug, "zh");
    return a.title.localeCompare(b.title, "zh");
  });
}

export function listArticles(): KbEntry[] {
  return listKb().filter((e) => e.section === "条文");
}

export function listTopicsGrouped(): { id: string; label: string; items: KbEntry[] }[] {
  const topics = listKb().filter((e) => e.section === "专题");
  const used = new Set<string>();
  const groups = TOPIC_GROUPS.map((g) => {
    const items = g.titles
      .map((t) => topics.find((e) => e.title === t))
      .filter((e): e is KbEntry => Boolean(e));
    items.forEach((e) => used.add(e.slug));
    return { id: g.id, label: g.label, items };
  });
  const rest = topics.filter((e) => !used.has(e.slug)).sort((a, b) => a.title.localeCompare(b.title, "zh"));
  if (rest.length) {
    const other = groups.find((g) => g.id === "other");
    if (other) other.items = [...other.items, ...rest];
  }
  return groups.filter((g) => g.items.length > 0);
}

export function resolveKbFile(slugParts: string[]): { abs: string; slug: string; title: string } | null {
  const slug = slugParts.map(decodeURIComponent).join("/");
  const abs = path.join(KB_ROOT, `${slug}.md`);
  if (!abs.startsWith(KB_ROOT)) return null;
  if (!fs.existsSync(abs)) return null;
  return { abs, slug, title: path.basename(slug) };
}

export function readKbMarkdown(abs: string): string {
  return fs.readFileSync(abs, "utf8");
}

function kbHref(slug: string): string {
  return `/kb/${slug.split("/").map(encodeURIComponent).join("/")}`;
}

function topicIndex(): Map<string, string> {
  const map = new Map<string, string>();
  for (const e of listKb()) {
    if (e.section === "专题") map.set(e.title, e.slug);
    if (e.section === "条文" && e.articleNo != null) {
      map.set(`第${e.articleNo}条`, e.slug);
      map.set(e.title, e.slug);
    }
  }
  return map;
}

/** Strip YAML, external URLs, promote headings — display-only. */
export function preprocessKbMarkdown(md: string): string {
  let text = md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");

  const lines = text.split(/\r?\n/);
  const out: string[] = [];
  for (const raw of lines) {
    const line = raw.replace(/\u00a0/g, " ");
    if (/https?:\/\//i.test(line) || /yuque\.com|feishu\.cn|larksuite\.com/i.test(line)) {
      const cleaned = line
        .replace(/https?:\/\/\S+/gi, "")
        .replace(/\[[^\]]*\]\(\s*https?:\/\/[^)]+\)/gi, "")
        .replace(/具体可见[^。]*[。]?/g, "")
        .trim();
      if (!cleaned || /^[-*]\s*$/.test(cleaned)) continue;
      out.push(cleaned);
      continue;
    }
    if (/^<!--/.test(line.trim())) continue;
    out.push(line);
  }
  text = out.join("\n");

  text = text.replace(
    /^(条文重点|疑难争议|相关条文|相关专题|与本库印证|图标说明|立法背景)[：:]?\s*$/gm,
    "### $1",
  );

  return text;
}

function isMostlyEnglish(s: string): boolean {
  const letters = s.replace(/[^A-Za-z\u4e00-\u9fff]/g, "");
  if (letters.length < 12) return false;
  const en = (letters.match(/[A-Za-z]/g) || []).length;
  return en / letters.length > 0.72;
}

function resolveInternalHref(href: string, label: string, index: Map<string, string>): string | null {
  const decoded = decodeURIComponent(href.trim());
  if (/^https?:\/\//i.test(decoded)) return null;

  const mdMatch = decoded.replace(/^\.\.\/+/, "").replace(/\.md$/i, "");
  if (mdMatch.startsWith("条文/") || mdMatch.startsWith("专题/") || mdMatch.startsWith("比较/")) {
    const abs = path.join(KB_ROOT, `${mdMatch}.md`);
    if (fs.existsSync(abs)) return kbHref(mdMatch);
  }
  if (mdMatch.includes("/")) {
    const base = mdMatch.split("/").pop()!;
    for (const [title, slug] of index) {
      if (title === base || slug.endsWith(`/${base}`)) return kbHref(slug);
    }
  }

  const byLabel = index.get(label.trim());
  if (byLabel) return kbHref(byLabel);

  const art = /第(\d+)条/.exec(label);
  if (art) {
    const slug = index.get(`第${art[1]}条`);
    if (slug) return kbHref(slug);
  }

  const topicHit = index.get(label.replace(/[《》]/g, "").trim());
  if (topicHit) return kbHref(topicHit);

  return null;
}

function inlineHtml(s: string, index: Map<string, string>): string {
  let t = s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label: string, href: string) => {
    const resolved = resolveInternalHref(href, label, index);
    if (resolved) return `<a href="${resolved}">${label}</a>`;
    return label;
  });

  t = t
    .replace(/`([^`]+)`/g, '<code class="pm-code">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  return t;
}

/**
 * Structured KB HTML: strip noise, CN/EN blocks, bold section titles, one bullet per block.
 */
export function mdToSafeHtml(md: string): string {
  const index = topicIndex();
  const prepared = preprocessKbMarkdown(md);
  const lines = prepared.split(/\r?\n/);
  const out: string[] = [];
  let inCode = false;
  let zhOpen = false;
  let enOpen = false;

  const closeLang = () => {
    if (zhOpen) {
      out.push("</section>");
      zhOpen = false;
    }
    if (enOpen) {
      out.push("</section>");
      enOpen = false;
    }
  };

  const openZh = () => {
    if (zhOpen) return;
    closeLang();
    out.push('<section class="pm-kb-zh">');
    zhOpen = true;
  };
  const openEn = () => {
    if (enOpen) return;
    closeLang();
    out.push('<section class="pm-kb-en">');
    enOpen = true;
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      closeLang();
      if (!inCode) {
        out.push('<pre class="pm-pre"><code>');
        inCode = true;
      } else {
        out.push("</code></pre>");
        inCode = false;
      }
      continue;
    }
    if (inCode) {
      out.push(`${line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}\n`);
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    const h = /^(#{1,3})\s+(.*)$/.exec(trimmed);
    if (h) {
      closeLang();
      const level = h[1].length;
      const id = h[2].replace(/\s+/g, "-").slice(0, 40);
      out.push(`<h${level} id="${id}">${inlineHtml(h[2], index)}</h${level}>`);
      continue;
    }

    const sectionTitle = /^(条文重点|疑难争议|相关条文|相关专题|与本库印证)$/.exec(trimmed);
    if (sectionTitle) {
      closeLang();
      out.push(`<h3 class="pm-kb-section-title">${sectionTitle[1]}</h3>`);
      continue;
    }

    const ul = /^[-*]\s+(.*)$/.exec(trimmed);
    if (ul) {
      closeLang();
      out.push(`<p class="pm-kb-bullet">${inlineHtml(ul[1], index)}</p>`);
      continue;
    }

    const nested = /^\s{2,}[-*]\s+(.*)$/.exec(line);
    if (nested) {
      closeLang();
      out.push(`<p class="pm-kb-bullet pm-kb-bullet-nested">${inlineHtml(nested[1], index)}</p>`);
      continue;
    }

    const ol = /^(\d+)\.\s+(.*)$/.exec(trimmed);
    if (ol) {
      closeLang();
      out.push(
        `<p class="pm-kb-bullet"><strong>${ol[1]}.</strong> ${inlineHtml(ol[2], index)}</p>`,
      );
      continue;
    }

    if (/^第[一二三四五六七八九十百零\d]+条/.test(trimmed) || (/^第\d+条/.test(trimmed) && !isMostlyEnglish(trimmed))) {
      openZh();
      out.push(`<p class="pm-kb-statute">${inlineHtml(trimmed, index)}</p>`);
      continue;
    }

    if (isMostlyEnglish(trimmed)) {
      openEn();
      out.push(`<p>${inlineHtml(trimmed, index)}</p>`);
      continue;
    }

    if (/[\u4e00-\u9fff]/.test(trimmed)) {
      openZh();
      out.push(`<p>${inlineHtml(trimmed, index)}</p>`);
    } else {
      openEn();
      out.push(`<p>${inlineHtml(trimmed, index)}</p>`);
    }
  }

  closeLang();
  if (inCode) out.push("</code></pre>");
  return out.join("\n");
}

export function citationToHref(slug?: string, pathLabel?: string): string | null {
  if (slug) {
    const abs = path.join(KB_ROOT, `${slug}.md`);
    if (fs.existsSync(abs)) return kbHref(slug);
  }
  if (!pathLabel) return null;
  const index = topicIndex();
  const art = /第(\d+)条/.exec(pathLabel);
  if (art) {
    const s = index.get(`第${art[1]}条`);
    if (s) return kbHref(s);
  }
  const topic = /专题[“"]([^”"]+)[”"]/.exec(pathLabel);
  if (topic) {
    const s = index.get(topic[1]);
    if (s) return kbHref(s);
  }
  if (/EU\s*要点卡|EU-要点卡/.test(pathLabel)) return kbHref("比较/EU-要点卡");
  return null;
}
