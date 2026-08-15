#!/usr/bin/env node
/**
 * Add relative markdown links between PIPL 条文 and 专题.
 * Also link 「本知识库第N条」 / 「本数据库第N条」 to article files.
 *
 * Do NOT add short aliases that appear inside longer names
 * (网络安全事件、算法治理、儿童的同意) — they cause nested/false links.
 */
import fs from "fs";
import path from "path";

const ROOT = "/Users/melendez/Desktop/工作/工作/privpm-builder/知识库/PIPL";
const ART = path.join(ROOT, "条文");
const TOP = path.join(ROOT, "专题");

/** Longer aliases first */
const ALIASES = [
  ["实务中的“知情-同意”操作", "实务中的知情-同意操作.md"],
  ["实务中的「知情-同意」操作", "实务中的知情-同意操作.md"],
  ["在合理的范围内处理已公开的个人信息", "在合理的范围内处理已公开的个人信息.md"],
  ["突发公共卫生事件中的个人信息保护", "突发公共卫生事件中的个人信息保护.md"],
  ["其他对政府部门的通知义务", "其他对政府部门的通知义务.md"],
  ["数据泄露/安全事件的报告义务", "数据泄露报告义务.md"],
  ["数据泄露 / 网络安全事件", "数据泄露与网络安全事件.md"],
  ["数据泄露/网络安全事件", "数据泄露与网络安全事件.md"],
  ["数据泄露与网络安全事件", "数据泄露与网络安全事件.md"],
  ["数据泄露报告义务", "数据泄露报告义务.md"],
  ["外部独立的监督机构", "外部独立的监督机构.md"],
  ["个人信息共享行为区分", "个人信息共享行为区分.md"],
  ["新闻报道与舆论监督", "新闻报道与舆论监督.md"],
  ["数据保护相关认证", "数据保护相关认证.md"],
  ["GDPR儿童的同意", "GDPR儿童的同意.md"],
  ["儿童个人信息保护", "儿童个人信息保护.md"],
  ["如何验证家长同意", "如何验证家长同意.md"],
  ["数据出境安全评估", "数据出境安全评估.md"],
  ["数据出境标准合同", "数据出境标准合同.md"],
  ["个人信息出境认证", "个人信息出境认证.md"],
  ["跨境安全认证", "个人信息出境认证.md"],
  ["内容标识（AIGC标识）", "内容标识-AIGC标识.md"],
  ["内容标识-AIGC标识", "内容标识-AIGC标识.md"],
  ["人工智能与算法治理", "人工智能与算法治理.md"],
  ["算法与人工智能备案", "算法与人工智能备案.md"],
  ["匿名化与去标识化", "匿名化与去标识化.md"],
  ["隐私政策设计", "隐私政策设计.md"],
  ["社会责任报告", "社会责任报告.md"],
  ["履行合同所必需", "履行合同所必需.md"],
  ["第三章-跨境规则引言", "第三章-跨境规则引言.md"],
  ["第三章引言部分", "第三章-跨境规则引言.md"],
  ["第三章引言", "第三章-跨境规则引言.md"],
  ["个性化推荐", "个性化推荐.md"],
  ["国内常用咨询电话", "国内常用咨询电话.md"],
  ["可携权", "可携权.md"],
];

const ART_FILES = Object.fromEntries(
  fs.readdirSync(ART)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const m = f.match(/^第(\d+)条/);
      return m ? [m[1], f] : null;
    })
    .filter(Boolean)
);

function escapeReg(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isInsideMarkdownLink(s, offset) {
  const before = s.slice(0, offset);
  const lastOpenBracket = before.lastIndexOf("[");
  const lastCloseParen = before.lastIndexOf(")");
  const lastCloseBracket = before.lastIndexOf("]");
  if (lastOpenBracket > lastCloseParen && lastOpenBracket > lastCloseBracket) return true;
  const lastLinkClose = before.lastIndexOf("](");
  if (lastLinkClose > lastCloseParen) return true;
  return false;
}

function linkifyAliases(text, targetPrefix) {
  let out = text;
  let n = 0;
  for (const [alias, file] of ALIASES) {
    const target = `${targetPrefix}${file}`;
    const re2 = new RegExp(`(?<!\\[)${escapeReg(alias)}(?!\\]\\()`, "g");
    out = out.replace(re2, (match, offset, s) => {
      if (isInsideMarkdownLink(s, offset)) return match;
      const prev = s.slice(Math.max(0, offset - 1), offset);
      const next = s.slice(offset + match.length, offset + match.length + 2);
      if (prev === "[" || next === "](") return match;
      // skip inside 《书名》
      const left = s.slice(Math.max(0, offset - 40), offset);
      const right = s.slice(offset + match.length, offset + match.length + 40);
      if (/《[^》]*$/.test(left) && /^[^《]*》/.test(right)) return match;
      n++;
      return `[${alias}](${target})`;
    });
  }
  return { text: out, n };
}

/** Link 本知识库第N条 / 参见本知识库第N条 / 本数据库第N条 */
function linkifyArticleRefs(text, fromFile) {
  let n = 0;
  const out = text.replace(
    /(本知识库|本数据库|参见本知识库|参见本数据库)第(\d+)条/g,
    (match, prefix, num, offset, s) => {
      const artFile = ART_FILES[num];
      if (!artFile) return match;
      if (isInsideMarkdownLink(s, offset)) return match;
      const prev = s.slice(Math.max(0, offset - 1), offset);
      if (prev === "[") return match;
      if (fromFile === artFile) return match;
      n++;
      return `[${prefix}第${num}条](./${artFile})`;
    }
  );
  return { text: out, n };
}

function ensureTopicBacklinks(filePath) {
  let text = fs.readFileSync(filePath, "utf8");
  if (text.includes("## 相关条文")) return { changed: false };

  const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) return { changed: false };
  const citesLine = fm[1].match(/cites:\s*\[([^\]]*)\]/);
  if (!citesLine) return { changed: false };
  const cites = citesLine[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const links = [];
  for (const c of cites) {
    const num = c.replace(/第|条/g, "");
    const artFile = ART_FILES[num];
    if (artFile) links.push(`- [${c}](../条文/${artFile})`);
  }
  if (!links.length) return { changed: false };

  const block = `\n## 相关条文\n\n${links.join("\n")}\n`;
  text = text.replace(/^---\n[\s\S]*?\n---\n/, (m) => m + block);
  fs.writeFileSync(filePath, text, "utf8");
  return { changed: true, links: links.length };
}

const artStats = [];
for (const f of fs.readdirSync(ART).filter((x) => x.endsWith(".md"))) {
  const p = path.join(ART, f);
  const before = fs.readFileSync(p, "utf8");
  let { text, n } = linkifyAliases(before, "../专题/");
  const r2 = linkifyArticleRefs(text, f);
  text = r2.text;
  n += r2.n;
  if (text !== before) {
    fs.writeFileSync(p, text, "utf8");
    artStats.push({ file: f, replacements: n });
  }
}

const topicStats = [];
for (const f of fs.readdirSync(TOP).filter((x) => x.endsWith(".md") && !x.startsWith("_"))) {
  const r = ensureTopicBacklinks(path.join(TOP, f));
  if (r.changed) topicStats.push({ file: f, links: r.links });
}

const topicBody = [];
for (const f of fs.readdirSync(TOP).filter((x) => x.endsWith(".md") && !x.startsWith("_"))) {
  const p = path.join(TOP, f);
  const before = fs.readFileSync(p, "utf8");
  const fmEnd = before.indexOf("\n---\n");
  let head = "";
  let body = before;
  if (before.startsWith("---\n") && fmEnd !== -1) {
    head = before.slice(0, fmEnd + 5);
    body = before.slice(fmEnd + 5);
  }
  let { text, n } = linkifyAliases(body, "./");
  text = text.replace(new RegExp(`\\[([^\\]]+)\\]\\(\\.\\/${escapeReg(f)}\\)`, "g"), "$1");
  const final = head + text;
  if (final !== before) {
    fs.writeFileSync(p, final, "utf8");
    topicBody.push({ file: f, replacements: n });
  }
}

console.log(
  JSON.stringify(
    {
      articlesUpdated: artStats.length,
      artStats,
      topicsBacklinks: topicStats.length,
      topicStats,
      topicBodyLinks: topicBody.length,
      topicBody,
    },
    null,
    2
  )
);
