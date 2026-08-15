#!/usr/bin/env node
/**
 * Import remaining PIPL specialty topics (gap batch) into 知识库/PIPL/专题/
 */
import fs from "fs";
import path from "path";

const TRANSCRIPT =
  "/Users/melendez/.cursor/projects/Users-melendez-Desktop/agent-transcripts/1d641142-1dda-457b-91f5-4c6b1f03d8d8/1d641142-1dda-457b-91f5-4c6b1f03d8d8.jsonl";
const OUT_DIR =
  "/Users/melendez/Desktop/工作/工作/privpm-builder/知识库/PIPL/专题";

const TOPICS = [
  {
    file: "个性化推荐.md",
    title: "个性化推荐",
    cites: ["第24条"],
    parent: "条文/第24条；关联 专题/人工智能与算法治理",
    start: "个性化推荐\n个性化推荐是一种",
  },
  {
    file: "儿童个人信息保护.md",
    title: "儿童个人信息保护",
    cites: ["第31条", "第28条"],
    parent: "条文/第31条；并列 专题/如何验证家长同意",
    start: "未成年/儿童个人信息保护\n返回DLaw Hub官网",
  },
  {
    file: "数据出境安全评估.md",
    title: "数据出境安全评估",
    cites: ["第38条", "第40条"],
    parent: "条文/第38、40条 → 专题/第三章-跨境规则引言",
    start: "数据出境安全评估\n1. 《数据出境安全评估办法》",
  },
  {
    file: "个人信息出境认证.md",
    title: "个人信息出境认证",
    cites: ["第38条"],
    parent: "条文/第38条 → 专题/第三章-跨境规则引言",
    start: "个人信息出境认证\n2025年10月17日",
  },
  {
    file: "内容标识-AIGC标识.md",
    title: "内容标识（AIGC标识）",
    cites: ["第24条"],
    parent: "条文/第24条 → 专题/人工智能与算法治理",
    start: "中国内容标识（AIGC标识）要求",
  },
  {
    file: "算法与人工智能备案.md",
    title: "算法与人工智能备案",
    cites: ["第24条"],
    parent: "条文/第24条 → 专题/人工智能与算法治理",
    start: "算法/人工智能备案\n算法备案系统",
  },
  {
    file: "数据泄露报告义务.md",
    title: "数据泄露/安全事件的报告义务",
    cites: ["第57条", "第51条"],
    parent: "条文/第57、51条 → 专题/数据泄露与网络安全事件",
    start: "数据泄露/安全事件的报告义务\n数据泄露义务整理.xlsx",
  },
  {
    file: "国内常用咨询电话.md",
    title: "国内常用咨询电话",
    cites: ["第38条"],
    parent: "条文/第38条 → 专题/数据出境标准合同；亦被 专题/算法与人工智能备案 回指",
    start: "国内常用咨询电话\n返回DLaw Hub官网",
  },
];

function extractPaste() {
  const lines = fs.readFileSync(TRANSCRIPT, "utf8").split("\n").filter(Boolean);
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
          o.includes("个性化推荐是一种利用数据分析") &&
          o.includes("国内常用咨询电话") &&
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
  if (!best) throw new Error("gap topics paste not found");
  const q = best.match(/<user_query>\n([\s\S]*)<\/user_query>/);
  let body = q ? q[1] : best;
  const idx = body.indexOf("个性化推荐\n个性化推荐是一种");
  if (idx < 0) throw new Error("topic start not found");
  return body.slice(idx);
}

function findStart(text, start) {
  const i = text.indexOf(start);
  if (i < 0) throw new Error(`Start not found: ${start.slice(0, 50)}…`);
  return i;
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const text = extractPaste();
  const located = TOPICS.map((t) => ({
    ...t,
    index: findStart(text, t.start),
  }));
  located.sort((a, b) => a.index - b.index);

  for (let i = 1; i < located.length; i++) {
    if (located[i].index <= located[i - 1].index) {
      throw new Error(
        `Order conflict: ${located[i].title} @${located[i].index} <= ${located[i - 1].title} @${located[i - 1].index}`
      );
    }
  }

  const written = [];
  for (let i = 0; i < located.length; i++) {
    const cur = located[i];
    const end = i + 1 < located.length ? located[i + 1].index : text.length;
    const slice = text.slice(cur.index, end).trimEnd() + "\n";
    const header =
      `---\n` +
      `title: ${cur.title}\n` +
      `cites: [${cur.cites.join(", ")}]\n` +
      `parent: ${cur.parent}\n` +
      `source: user-paste-2026-08-15-gap-topics\n` +
      `note: 全文入库；图片占位与飞书外无法展示块原样保留\n` +
      `---\n\n`;
    fs.writeFileSync(path.join(OUT_DIR, cur.file), header + slice, "utf8");
    written.push({
      file: cur.file,
      title: cur.title,
      chars: (header + slice).length,
      cites: cur.cites,
      parent: cur.parent,
    });
  }

  console.log(JSON.stringify({ count: written.length, written }, null, 2));
}

main();
