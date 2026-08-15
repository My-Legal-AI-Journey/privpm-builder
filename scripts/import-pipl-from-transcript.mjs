#!/usr/bin/env node
/**
 * One-shot importer: extract PIPL annotation paste from agent transcript
 * and write one markdown file per article under 知识库/PIPL/条文/.
 * Dedupes exact duplicate Art.7 block and Art.21 trailing bare restatement only.
 */
import fs from "fs";
import path from "path";

const TRANSCRIPT =
  "/Users/melendez/.cursor/projects/Users-melendez-Desktop/agent-transcripts/1d641142-1dda-457b-91f5-4c6b1f03d8d8/1d641142-1dda-457b-91f5-4c6b1f03d8d8.jsonl";
const OUT_DIR =
  "/Users/melendez/Desktop/工作/工作/privpm-builder/知识库/PIPL/条文";

/** Paste order (not numerical): 4…31, 45…58, 38…40 */
const ARTICLES = [
  { n: 4, title: "个人信息与处理的概念", start: /第四条\s+个人信息的概念/ },
  { n: 5, title: "合法正当必要诚信", start: /第五条\s+合法、正当、必要与诚信原则/ },
  { n: 6, title: "目的限制与最小化", start: /第六条\s+目的限制和最小化原则/ },
  { n: 7, title: "公开透明", start: /第七条\s+公开透明原则/ },
  { n: 13, title: "合法性基础", start: /第十三条\s+个人信息处理的合法性基础/ },
  { n: 14, title: "知情同意", start: /第十四条\s+知情同意原则/ },
  { n: 15, title: "撤回同意", start: /第十五条\s+个人信息撤回同意权/ },
  { n: 16, title: "不得拒绝服务", start: /第十六条\s+不得拒绝服务原则/ },
  { n: 17, title: "告知规则", start: /第十七条\s+个人信息的告知规则/ },
  { n: 19, title: "保存期限", start: /第十九条\s+对个人信息保存期限的限制/ },
  { n: 21, title: "委托处理", start: /第二十一条\s+委托处理个人信息/ },
  { n: 23, title: "对外提供", start: /第二十三条\s+个人信息提供/ },
  { n: 24, title: "自动化决策", start: /第二十四条\s+自动化决策/ },
  { n: 28, title: "敏感个人信息定义", start: /第二十八条\s+敏感个人信息定义及处理原则/ },
  { n: 29, title: "敏感信息单独同意", start: /第二十九条\s+特别同意规则/ },
  { n: 30, title: "敏感信息告知", start: /第三十条\s+告知义务/ },
  { n: 31, title: "未成年人同意", start: /第三十一条\s+未成年人同意规则/ },
  { n: 45, title: "查阅复制可携带", start: /第四十五条\s+查阅权、复制权和可携带权/ },
  { n: 46, title: "更正补充", start: /第四十六条\s+更正权和补充权/ },
  { n: 47, title: "删除", start: /第四十七条\s+删除权/ },
  { n: 50, title: "行权受理机制", start: /第五十条\s+权利行使的申请受理和处理机制/ },
  { n: 51, title: "安全管理措施", start: /第五十一条\s+个人信息安全管理要求/ },
  { n: 55, title: "影响评估触发", start: /第五十五条\s+影响评估义务/ },
  { n: 56, title: "影响评估内容与保存", start: /第五十六条\s+影响评估的内容/ },
  { n: 57, title: "泄露通知", start: /第五十七条\s+个人信息泄露/ },
  { n: 58, title: "大型互联网平台义务", start: /第五十八条\s+互联网平台的个人信息保护义务/ },
  { n: 38, title: "跨境条件", start: /第三十八条\s+个人信息跨境条件/ },
  { n: 39, title: "出境告知与单独同意", start: /第三十九条\s+出境的告知要求/ },
  { n: 40, title: "关键信息基础设施与数量门槛", start: /第四十条\s+关键信息基础设施的要求/ },
];

function extractPaste(transcriptPath) {
  const lines = fs.readFileSync(transcriptPath, "utf8").split("\n").filter(Boolean);
  let best = "";
  for (const line of lines) {
    let obj;
    try {
      obj = JSON.parse(line);
    } catch {
      continue;
    }
    const walk = (o) => {
      if (!o) return;
      if (typeof o === "string") {
        if (
          o.includes("第四条 个人信息的概念") &&
          o.includes("第五十八条") &&
          o.includes("储存为知识库") &&
          o.length > best.length
        ) {
          best = o;
        }
        return;
      }
      if (Array.isArray(o)) o.forEach(walk);
      else if (typeof o === "object") Object.values(o).forEach(walk);
    };
    walk(obj);
  }
  if (!best) throw new Error("PIPL paste not found in transcript");
  let body = best;
  const q = body.match(/<user_query>\n([\s\S]*)<\/user_query>/);
  if (q) body = q[1];
  const idx = body.search(/第四条\s+个人信息的概念/);
  if (idx < 0) throw new Error("Article 4 heading not found");
  return body.slice(idx);
}

function findAll(text, re) {
  const hits = [];
  const r = new RegExp(re.source, "g");
  let m;
  while ((m = r.exec(text)) !== null) hits.push({ index: m.index, len: m[0].length });
  return hits;
}

/** Prefer real article headings over mid-sentence cross-references. */
function pickHit(text, hits, articleN) {
  if (hits.length === 1) return hits[0].index;
  const scored = hits.map((h) => {
    const after = text.slice(h.index, h.index + 180);
    let score = 0;
    // Cross-ref like "参见第五十八条 … ）。"
    if (/义务\s*）/.test(after.slice(0, 50))) score -= 100;
    if (/原则\s*）/.test(after.slice(0, 50))) score -= 100;
    if (/参见/.test(text.slice(Math.max(0, h.index - 6), h.index))) score -= 80;
    // Statute / English body follows soon
    if (
      /\n[（(A-Za-z\u4e00-\u9fff]/.test(after.slice(h.len, h.len + 30)) ||
      /\n提供重要|\n处理个人|\n个人有权|\n符合下列|\n基于个人|\n有下列|\nWhere |\nPersonal |\nA personal|\nIndividuals |\nSensitive /.test(
        after
      )
    ) {
      score += 50;
    }
    // Art.7: prefer first full dump (after 关联标准), dedupe later
    if (articleN === 7) score += hits.indexOf(h) === 0 ? 10 : 0;
    // Art.58: prefer the later true heading with 提供重要互联网平台
    if (articleN === 58 && after.includes("提供重要互联网平台服务")) score += 100;
    return { index: h.index, score };
  });
  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  return scored[0].index;
}

function dedupeArticle7(slice) {
  const marker = "第七条 公开透明原则";
  const first = slice.indexOf(marker);
  if (first < 0) return slice;
  const second = slice.indexOf(marker, first + marker.length);
  if (second < 0) return slice;
  return slice.slice(0, second).trimEnd() + "\n";
}

function dedupeArticle21Trailing(slice) {
  const afterAssoc = slice.lastIndexOf("关联法条");
  if (afterAssoc < 0) return slice;
  const assocEndHint = slice.indexOf("《民法典》第919", afterAssoc);
  if (assocEndHint < 0) return slice;
  const afterLine = slice.indexOf("\n", assocEndHint);
  if (afterLine < 0) return slice;
  const rest = slice.slice(afterLine + 1).trim();
  if (rest.startsWith("个人信息处理者委托处理个人信息的")) {
    return slice.slice(0, afterLine + 1).trimEnd() + "\n";
  }
  return slice;
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const text = extractPaste(TRANSCRIPT);

  const located = ARTICLES.map((a) => {
    const hits = findAll(text, a.start);
    if (hits.length === 0) throw new Error(`Start not found for art ${a.n}`);
    return { ...a, index: pickHit(text, hits, a.n), hitCount: hits.length };
  });

  located.sort((a, b) => a.index - b.index);

  // Sanity: unique increasing indices
  for (let i = 1; i < located.length; i++) {
    if (located[i].index <= located[i - 1].index) {
      throw new Error(
        `Order conflict: art ${located[i].n} @${located[i].index} <= art ${located[i - 1].n} @${located[i - 1].index}`
      );
    }
  }

  const written = [];
  for (let i = 0; i < located.length; i++) {
    const cur = located[i];
    const end = i + 1 < located.length ? located[i + 1].index : text.length;
    let slice = text.slice(cur.index, end).trimEnd() + "\n";
    if (cur.n === 7) slice = dedupeArticle7(slice);
    if (cur.n === 21) slice = dedupeArticle21Trailing(slice);

    const fname = `第${cur.n}条-${cur.title}.md`;
    const fpath = path.join(OUT_DIR, fname);
    const header =
      `---\n` +
      `article: ${cur.n}\n` +
      `title: ${cur.title}\n` +
      `source: user-paste-2026-08-15\n` +
      `note: 全文入库；仅去除完全重复粘贴块；图片占位标记保留\n` +
      `---\n\n`;
    fs.writeFileSync(fpath, header + slice, "utf8");
    written.push({
      n: cur.n,
      file: fname,
      chars: (header + slice).length,
      hitCount: cur.hitCount,
    });
  }

  console.log(JSON.stringify({ count: written.length, order: written.map((w) => w.n), written }, null, 2));
}

main();
