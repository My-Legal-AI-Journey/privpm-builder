#!/usr/bin/env node
/**
 * Import PIPL specialty topics from agent transcript into 知识库/PIPL/专题/
 */
import fs from "fs";
import path from "path";

const TRANSCRIPT =
  "/Users/melendez/.cursor/projects/Users-melendez-Desktop/agent-transcripts/1d641142-1dda-457b-91f5-4c6b1f03d8d8/1d641142-1dda-457b-91f5-4c6b1f03d8d8.jsonl";
const OUT_DIR =
  "/Users/melendez/Desktop/工作/工作/privpm-builder/知识库/PIPL/专题";
const ASSETS = path.join(OUT_DIR, "assets");
const IMG_SRC =
  "/Users/melendez/.cursor/projects/Users-melendez-Desktop/assets/image-736b8501-be4a-4821-b49f-e7dec3a29d66.png";

/**
 * Unique start markers in paste order. Prefer long unique strings.
 * start: string | RegExp matched against full body; first hit wins.
 */
const TOPICS = [
  {
    file: "匿名化与去标识化.md",
    title: "匿名化与去标识化",
    cites: ["第73条", "第4条"],
    start: "匿名化与去标识化\n\n从加密程度看",
  },
  {
    file: "人工智能与算法治理.md",
    title: "人工智能与算法治理",
    cites: ["第24条"],
    start: "人工智能与算法治理\n返回DLaw Hub官网",
  },
  {
    file: "实务中的知情-同意操作.md",
    title: "实务中的知情-同意操作",
    cites: ["第14条", "第29条"],
    start: "实务中的“知情-同意”操作\n\n1. 【隐私政策】",
  },
  {
    file: "隐私政策设计.md",
    title: "隐私政策设计",
    cites: ["第17条", "第48条"],
    // Includes following Q&A privacy discussion until 可携权
    start: "隐私政策\n返回DLaw Hub官网",
  },
  {
    file: "可携权.md",
    title: "可携权",
    cites: ["第45条"],
    start: "可携权\n目前网信部门尚未出台针对可携带权",
  },
  {
    file: "如何验证家长同意.md",
    title: "如何验证家长同意",
    cites: ["第31条"],
    start: "如何验证家长同意\n特别感谢Lucas老师",
  },
  {
    file: "数据出境标准合同.md",
    title: "数据出境标准合同",
    cites: ["第38条"],
    start: "数据出境标准合同备案\n标准合同制度起源于欧盟",
  },
  {
    file: "履行合同所必需.md",
    title: "履行合同所必需",
    cites: ["第13条"],
    start: "履行合同所必需\n\n此处的必需是客观上的必要",
  },
  {
    file: "突发公共卫生事件中的个人信息保护.md",
    title: "突发公共卫生事件中的个人信息保护",
    cites: ["第13条"],
    start: "突发公共卫生事件中的个人信息保护\n\n概念解释",
  },
  {
    file: "在合理的范围内处理已公开的个人信息.md",
    title: "在合理的范围内处理已公开的个人信息",
    cites: ["第13条", "第27条"],
    start: "在合理的范围内处理已公开的个人信息\n\n国家标准的规定",
  },
  {
    file: "个人信息共享行为区分.md",
    title: "个人信息共享行为区分",
    cites: ["第20条", "第21条", "第23条"],
    start: "个人信息委托处理、共同处理、共享处理的责任和风险防范",
  },
  {
    file: "数据泄露与网络安全事件.md",
    title: "数据泄露与网络安全事件",
    cites: ["第57条", "第51条"],
    start: "数据泄露 / 网络安全事件\n\n个人信息泄露：",
  },
  {
    file: "社会责任报告.md",
    title: "社会责任报告",
    cites: ["第58条"],
    start: "社会责任报告\n其他：\n未成年人网络保护社会责任报告",
  },
  {
    file: "外部独立的监督机构.md",
    title: "外部独立的监督机构",
    cites: ["第58条"],
    start: "外部独立的监督机构\n《大型网络平台设立个人信息保护监督委员会规定",
  },
  {
    file: "第三章-跨境规则引言.md",
    title: "第三章-跨境规则引言",
    cites: ["第38条"],
    start: "第三章 个人信息跨境提供的规则\nChapter III Rules of Cross-border Provision of Personal Information",
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
          o.includes("匿名化与去标识化") &&
          o.includes("人工智能与算法治理") &&
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
  if (!best) throw new Error("topics paste not found");
  const q = best.match(/<user_query>\n([\s\S]*)<\/user_query>/);
  let body = q ? q[1] : best;
  const idx = body.indexOf("匿名化与去标识化");
  if (idx < 0) throw new Error("topic start not found");
  return body.slice(idx);
}

function findStart(text, start) {
  const i = text.indexOf(start);
  if (i < 0) throw new Error(`Start not found: ${start.slice(0, 40)}…`);
  return i;
}

const SHARE_TABLE_MD = `
## 对照表：提供 / 委托 / 共同处理 / 技术支持

![提供委托共同处理技术支持对照表](assets/提供-委托-共同处理-技术支持对照表.png)

| 项目 | 提供 | 委托（受托） | 共同处理 | 技术支持 |
|------|------|--------------|----------|----------|
| 合规要求 | 高 | 较高 | 一般 | 低 |
| 责任承担 | 各自承担 | 主要由委托人承担 | 依法连带 | 产品质量责任 |
| 个人信息保护影响评估 | 需要 | 需要 | 不需要 | 不需要 |
| 单独同意 | 需要 | 不需要 | 不需要 | 不需要 |
`;

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(ASSETS, { recursive: true });
  if (fs.existsSync(IMG_SRC)) {
    fs.copyFileSync(
      IMG_SRC,
      path.join(ASSETS, "提供-委托-共同处理-技术支持对照表.png")
    );
  }

  // Also create PIPL附件 placeholder dir
  fs.mkdirSync(
    "/Users/melendez/Desktop/工作/工作/privpm-builder/参考文献/PIPL附件",
    { recursive: true }
  );
  const readmeAtt =
    "# PIPL 附件目录\n\n将专题正文中引用的 PDF/DOCX/XLSX 放到本目录。清单见 `知识库/PIPL/专题/_索引.md`。\n";
  fs.writeFileSync(
    "/Users/melendez/Desktop/工作/工作/privpm-builder/参考文献/PIPL附件/README.md",
    readmeAtt,
    "utf8"
  );

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
    let slice = text.slice(cur.index, end).trimEnd() + "\n";

    if (cur.file === "个人信息共享行为区分.md") {
      // Insert markdown table + image near the front after title block
      const insertAt = slice.indexOf("\n", slice.indexOf("写在前面"));
      if (insertAt > 0) {
        slice =
          slice.slice(0, insertAt + 1) +
          "\n" +
          SHARE_TABLE_MD +
          "\n" +
          slice.slice(insertAt + 1);
      } else {
        slice = SHARE_TABLE_MD + "\n" + slice;
      }
    }

    const header =
      `---\n` +
      `title: ${cur.title}\n` +
      `cites: [${cur.cites.join(", ")}]\n` +
      `source: user-paste-2026-08-15-topics\n` +
      `note: 全文入库；图片占位与飞书外无法展示块原样保留\n` +
      `---\n\n`;

    fs.writeFileSync(path.join(OUT_DIR, cur.file), header + slice, "utf8");
    written.push({
      file: cur.file,
      title: cur.title,
      chars: (header + slice).length,
      cites: cur.cites,
    });
  }

  console.log(
    JSON.stringify(
      {
        count: written.length,
        order: written.map((w) => w.file),
        written,
        imgCopied: fs.existsSync(
          path.join(ASSETS, "提供-委托-共同处理-技术支持对照表.png")
        ),
      },
      null,
      2
    )
  );
}

main();
