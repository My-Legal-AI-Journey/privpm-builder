#!/usr/bin/env node
/**
 * Strip fluff from PIPL knowledge base markdown:
 * - DLaw Hub nav lines
 * - 致谢 / 感谢某某 / 不要过度骚扰 / 谢谢老师
 * - 「豆知识：」 label only (keep following content)
 * - local path footnotes「已入 `参考文献/PIPL附件/...`」
 * - empty pointers「具体可见未命名文档」
 */
import fs from "fs";
import path from "path";

const ROOT = "/Users/melendez/Desktop/工作/工作/privpm-builder/知识库/PIPL";

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (name.endsWith(".md")) out.push(p);
  }
  return out;
}

function strip(text) {
  let lines = text.split("\n");
  const kept = [];
  let removed = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();

    // DLaw Hub nav
    if (/返回DLaw Hub官网/.test(t) || (/前往数据法工具导航/.test(t) && /前往DLaw Hub/.test(t))) {
      removed++;
      continue;
    }
    // standalone 致谢 heading
    if (t === "致谢") {
      removed++;
      continue;
    }
    // thank-you / don't harass / chat fluff
    if (
      /^(特别)?感谢/.test(t) ||
      /^本页部分内容感谢/.test(t) ||
      /还请大家不要过度骚扰/.test(t) ||
      /感谢廖天依/.test(t) ||
      /特别感谢Lucas/.test(t) ||
      /特别感谢Gabrielle/.test(t) ||
      /感谢Chelsea/.test(t) ||
      /谢谢老师/.test(t) ||
      /感谢老师提供/.test(t)
    ) {
      removed++;
      continue;
    }
    // empty placeholder pointer
    if (/具体可见未命名文档/.test(t) || t === "未命名文档") {
      removed++;
      continue;
    }
    // 豆知识： label alone or prefix
    if (t === "豆知识：" || t === "豆知识") {
      removed++;
      continue;
    }
    if (/^豆知识：\s*/.test(t)) {
      const rest = t.replace(/^豆知识：\s*/, "");
      if (rest) kept.push(rest);
      else removed++;
      continue;
    }

    // strip local attachment footnotes; keep filename
    if (/已入\s*`参考文献\/PIPL附件\//.test(line) || /已入 `参考文献\/PIPL附件\//.test(line)) {
      const cleaned = line
        .replace(/（已入\s*`参考文献\/PIPL附件\/[^`]+`）/g, "")
        .replace(/\(已入\s*`参考文献\/PIPL附件\/[^`]+`\)/g, "")
        .replace(/；?\s*☑\s*已入\s*`参考文献\/PIPL附件\/`/g, "")
        .replace(/已入\s*`参考文献\/PIPL附件\/`/g, "附件目录已收录");
      if (cleaned.trim() === "" || cleaned.trim() === "（）") {
        removed++;
        continue;
      }
      if (cleaned !== line) {
        kept.push(cleaned);
        removed++;
        continue;
      }
    }

    kept.push(line);
  }
  // collapse 3+ blank lines
  let out = kept.join("\n").replace(/\n{3,}/g, "\n\n");
  if (!out.endsWith("\n")) out += "\n";
  return { text: out, removed };
}

const files = walk(ROOT);
let totalRemoved = 0;
const changed = [];
for (const f of files) {
  const before = fs.readFileSync(f, "utf8");
  const { text, removed } = strip(before);
  if (text !== before) {
    fs.writeFileSync(f, text, "utf8");
    totalRemoved += removed;
    changed.push({ file: path.relative(ROOT, f), removed });
  }
}

console.log(JSON.stringify({ filesScanned: files.length, filesChanged: changed.length, totalRemoved, changed }, null, 2));
