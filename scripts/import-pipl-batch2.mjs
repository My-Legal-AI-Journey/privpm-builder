#!/usr/bin/env node
/**
 * Batch-2 importer: PIPL arts 73,8,9,18,20,22,25-27,41,44,48-49,52-54,59
 * Does not touch existing batch-1 files.
 */
import fs from "fs";
import path from "path";

const TRANSCRIPT =
  "/Users/melendez/.cursor/projects/Users-melendez-Desktop/agent-transcripts/1d641142-1dda-457b-91f5-4c6b1f03d8d8/1d641142-1dda-457b-91f5-4c6b1f03d8d8.jsonl";
const OUT_DIR =
  "/Users/melendez/Desktop/工作/工作/privpm-builder/知识库/PIPL/条文";

/** Paste order */
const ARTICLES = [
  { n: 73, title: "术语定义", start: /第七十三条\s+术语定义/ },
  { n: 8, title: "个人信息质量原则", start: /第八条\s+个人信息质量原则/ },
  { n: 9, title: "处理者负责原则", start: /第九条\s+个人信息处理者负责原则/ },
  { n: 18, title: "告知豁免与延迟", start: /第十八条\s+告知义务的豁免与延迟/ },
  { n: 20, title: "共同处理", start: /第二十条\s+共同处理个人信息的权义约定和责任承担/ },
  { n: 22, title: "个人信息转移", start: /第二十二条\s+个人信息转移/ },
  { n: 25, title: "个人信息公开", start: /第二十五条\s+个人信息公开/ },
  { n: 26, title: "公共场所图像采集", start: /第二十六条\s+公共场所图像采集规则/ },
  { n: 27, title: "已公开个人信息处理", start: /第二十七条\s+已公开个人信息的处理/ },
  { n: 41, title: "国际司法执法协助", start: /第四十一条\s+国际司法协助与行政执法协助中的信息提供/ },
  { n: 44, title: "知情权和决定权", start: /第四十四条\s+知情权和决定权/ },
  { n: 48, title: "解释说明权", start: /第四十八条\s+要求解释和说明权/ },
  { n: 49, title: "死者个人信息保护", start: /第四十九条\s+死者个人信息保护/ },
  { n: 52, title: "个人信息保护负责人", start: /第五十二条\s+个人信息保护负责人制度/ },
  { n: 53, title: "境外机构或代表", start: /第五十三条\s+境外处理者设立专门机构和指定代表/ },
  { n: 54, title: "定期合规审计", start: /第五十四条\s+定期合规审计义务/ },
  { n: 59, title: "受托方义务", start: /第五十九条\s+受托方的个人信息保护义务/ },
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
          o.includes("第七十三条 术语定义") &&
          o.includes("第五十九条") &&
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
  if (!best) throw new Error("Batch2 PIPL paste not found");
  let body = best;
  const q = body.match(/<user_query>\n([\s\S]*)<\/user_query>/);
  if (q) body = q[1];
  const idx = body.search(/第七十三条\s+术语定义/);
  if (idx < 0) throw new Error("Art 73 heading not found");
  return body.slice(idx);
}

function findAll(text, re) {
  const hits = [];
  const r = new RegExp(re.source, "g");
  let m;
  while ((m = r.exec(text)) !== null) hits.push({ index: m.index, len: m[0].length });
  return hits;
}

function pickHit(text, hits, articleN) {
  if (hits.length === 1) return hits[0].index;
  const scored = hits.map((h) => {
    const after = text.slice(h.index, h.index + 200);
    let score = 0;
    if (/义务\s*）/.test(after.slice(0, 50))) score -= 100;
    if (/参见/.test(text.slice(Math.max(0, h.index - 8), h.index))) score -= 80;
    if (
      /\n[（(A-Za-z\u4e00-\u9fff]/.test(after.slice(h.len, h.len + 40)) ||
      /\n(本法|处理|个人|两个|在公共|中华|符合|Where |Personal |For the|Individuals |The |A personal|Two or)/.test(
        after
      )
    ) {
      score += 50;
    }
    // Prefer earlier for Art.8 glued after 匿名化与去标识化 line
    if (articleN === 8 && after.includes("处理个人信息应当保证个人信息的质量")) score += 100;
    if (articleN === 73 && after.includes("本法下列用语的含义")) score += 100;
    return { index: h.index, score };
  });
  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  return scored[0].index;
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
    const slice = text.slice(cur.index, end).trimEnd() + "\n";
    const fname = `第${cur.n}条-${cur.title}.md`;
    const header =
      `---\n` +
      `article: ${cur.n}\n` +
      `title: ${cur.title}\n` +
      `source: user-paste-2026-08-15-batch2\n` +
      `note: 全文入库；图片占位标记保留\n` +
      `---\n\n`;
    fs.writeFileSync(path.join(OUT_DIR, fname), header + slice, "utf8");
    written.push({ n: cur.n, file: fname, chars: (header + slice).length, hitCount: cur.hitCount });
  }

  console.log(JSON.stringify({ count: written.length, order: written.map((w) => w.n), written }, null, 2));
}

main();
