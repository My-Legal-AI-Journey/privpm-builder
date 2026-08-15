/**
 * Restructure all PIPL article markdown into:
 * # 第N条 · title
 * ## 一、法条原文 / ## 二、要点精读 / ## 三、疑难与争议 / ## 四、关联导航
 */
import fs from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "知识库", "PIPL", "条文");

function isMostlyEnglish(s) {
  const letters = s.replace(/[^A-Za-z\u4e00-\u9fff]/g, "");
  if (letters.length < 8) return false;
  const en = (letters.match(/[A-Za-z]/g) || []).length;
  return en / letters.length > 0.72;
}

function stripNoise(md) {
  let t = md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
  return t
    .split(/\r?\n/)
    .filter((line) => {
      if (/https?:\/\//i.test(line) || /yuque\.com|feishu\.cn/i.test(line)) return false;
      if (/^<!--/.test(line.trim())) return false;
      return true;
    })
    .join("\n");
}

function extractLinks(body) {
  const links = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let m;
  while ((m = re.exec(body))) {
    links.push(`- [${m[1]}](${m[2]})`);
  }
  return [...new Set(links)];
}

function splitSections(body) {
  const markers = [
    { key: "重点", re: /^条文重点\s*$/m },
    { key: "疑难", re: /^疑难争议\s*$/m },
    { key: "相关", re: /^相关条文\s*$/m },
  ];
  const positions = [];
  for (const mk of markers) {
    const m = mk.re.exec(body);
    if (m) positions.push({ key: mk.key, index: m.index, len: m[0].length });
  }
  positions.sort((a, b) => a.index - b.index);

  if (!positions.length) {
    return { head: body.trim(), 重点: "", 疑难: "", 相关: "" };
  }

  const head = body.slice(0, positions[0].index).trim();
  const bag = { 重点: "", 疑难: "", 相关: "" };
  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].index + positions[i].len;
    const end = i + 1 < positions.length ? positions[i + 1].index : body.length;
    bag[positions[i].key] = body.slice(start, end).trim();
  }
  return { head, ...bag };
}

function splitStatuteAndPrefaq(head) {
  const lines = head.split(/\n/).map((l) => l.trimEnd());
  const cn = [];
  const en = [];
  const prefaq = [];
  let phase = "seek"; // seek | cn | en | faq

  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (phase === "seek") {
      if (/^第[零一二三四五六七八九十百\d]+条/.test(t) || /^第\d+条/.test(t)) {
        phase = "cn";
        cn.push(t);
        continue;
      }
      // title-only first line sometimes
      if (!isMostlyEnglish(t) && t.length < 40 && !/^\d+\./.test(t)) {
        continue;
      }
      if (/^\d+\./.test(t) || /^[Qq]/.test(t) || /什么是|如何|是否/.test(t)) {
        phase = "faq";
        prefaq.push(t);
        continue;
      }
      continue;
    }
    if (phase === "cn") {
      if (isMostlyEnglish(t)) {
        phase = "en";
        en.push(t);
      } else if (/^\d+\./.test(t)) {
        phase = "faq";
        prefaq.push(t);
      } else {
        cn.push(t);
      }
      continue;
    }
    if (phase === "en") {
      if (isMostlyEnglish(t)) en.push(t);
      else if (/^\d+\./.test(t) || /什么是/.test(t)) {
        phase = "faq";
        prefaq.push(t);
      } else if (/[\u4e00-\u9fff]/.test(t) && !/^From/.test(t)) {
        // stray CN after EN -> faq/notes
        phase = "faq";
        prefaq.push(t);
      }
      continue;
    }
    if (phase === "faq") {
      if (/^From/.test(t)) {
        prefaq.push(`> 出处：${t.replace(/^From/, "").trim()}`);
      } else prefaq.push(t);
    }
  }
  return { cn, en, prefaq };
}

function normalizePoints(text) {
  if (!text.trim()) return "";
  const lines = text.split(/\n/);
  const out = [];
  let n = 0;
  for (let line of lines) {
    line = line.trimEnd();
    const t = line.trim();
    if (!t) {
      out.push("");
      continue;
    }
    if (/^\[图片\]/.test(t)) continue;
    // top-level numbered -> #### 1.
    const top = /^(\d+)\.\s*(.*)$/.exec(t);
    if (top && !/^\d+\.\d+/.test(t)) {
      n += 1;
      const title = top[2] || top[1];
      out.push(`#### ${n}. ${title}`);
      continue;
    }
    const sub = /^(\d+)\.(\d+)\s*(.*)$/.exec(t);
    if (sub) {
      out.push(`##### (${sub[2]}) ${sub[3]}`);
      continue;
    }
    if (/^[-*]\s+/.test(t)) {
      const body = t.replace(/^[-*]\s+/, "");
      out.push(`- ${body}`);
      continue;
    }
    if (/^\s{2,}[-*]\s+/.test(line)) {
      out.push(`  - ${t.replace(/^[-*]\s+/, "")}`);
      continue;
    }
    out.push(t);
  }
  return out.join("\n").trim();
}

function mergePoints(prefaq, 重点) {
  const parts = [];
  if (prefaq.length) {
    parts.push("### （一）概念与实务问答");
    parts.push("");
    parts.push(normalizePoints(prefaq.join("\n")));
  }
  if (重点.trim()) {
    const label = prefaq.length ? "### （二）要点展开" : "### （一）要点展开";
    parts.push(label);
    parts.push("");
    parts.push(normalizePoints(重点));
  }
  if (!parts.length) {
    return "### （一）要点\n\n（暂无进一步注释，可先阅读法条原文。）";
  }
  return parts.join("\n\n");
}

function buildDispute(疑难) {
  if (!疑难.trim()) return "### （一）说明\n\n本条暂无独立疑难争议笔记。";
  return normalizePoints(疑难)
    .split(/\n/)
    .map((line) => {
      if (/^#### /.test(line)) return line.replace(/^#### /, "### （") + "）".replace("））", "）");
      return line;
    })
    .join("\n");
}

// Fix dispute headers more carefully
function buildDispute2(疑难) {
  if (!疑难.trim()) return "### （一）说明\n\n本条暂无独立疑难争议笔记。";
  const norm = normalizePoints(疑难);
  const lines = norm.split("\n");
  const out = [];
  let idx = 0;
  const cnNum = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  for (const line of lines) {
    if (/^#### \d+\./.test(line)) {
      const rest = line.replace(/^#### \d+\.\s*/, "");
      const label = cnNum[idx] || String(idx + 1);
      idx += 1;
      out.push(`### （${label}） ${rest}`);
    } else {
      out.push(line);
    }
  }
  return out.join("\n");
}

function restructureFile(filePath) {
  const base = path.basename(filePath, ".md");
  const m = /^(第\d+条)-(.+)$/.exec(base);
  if (!m) return { filePath, ok: false, reason: "name" };
  const art = m[1];
  const shortTitle = m[2];
  const raw = fs.readFileSync(filePath, "utf8");
  if (raw.includes("## 一、法条原文")) {
    return { filePath, ok: true, skipped: true };
  }
  const body = stripNoise(raw);
  const links = extractLinks(body);
  const { head, 重点, 疑难 } = splitSections(body);
  const { cn, en, prefaq } = splitStatuteAndPrefaq(head);

  const cnBlock = cn.length ? cn.join("\n\n") : `${art} ${shortTitle}`;
  const enBlock = en.length ? en.join("\n\n") : "（暂无英文译文。）";

  const md = `# ${art} · ${shortTitle}

## 一、法条原文

### （一）中文

${cnBlock}

### （二）英文译文

${enBlock}

## 二、要点精读

${mergePoints(prefaq, 重点)}

## 三、疑难与争议

${buildDispute2(疑难)}

## 四、关联导航

${links.length ? links.join("\n") : "- （无额外内链）"}
`;

  fs.writeFileSync(filePath, md.trim() + "\n", "utf8");
  return { filePath, ok: true };
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".md") && f.startsWith("第"));
let done = 0;
let skipped = 0;
for (const f of files) {
  const r = restructureFile(path.join(DIR, f));
  if (r.skipped) skipped += 1;
  else if (r.ok) done += 1;
  else console.warn("fail", f, r.reason);
}
console.log(JSON.stringify({ total: files.length, done, skipped }));
