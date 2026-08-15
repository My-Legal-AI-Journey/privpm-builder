#!/usr/bin/env node
/**
 * Import gap2: remaining subtopics + PIPL articles 1-3,10-12,32-37,42-43,60-72
 */
import fs from "fs";
import path from "path";

const PASTE = "/tmp/pipl-gap2-paste.txt";
const TOPIC_DIR =
  "/Users/melendez/Desktop/工作/工作/privpm-builder/知识库/PIPL/专题";
const ART_DIR =
  "/Users/melendez/Desktop/工作/工作/privpm-builder/知识库/PIPL/条文";

const TOPICS = [
  {
    file: "可能影响未成年人身心健康的网络信息分类办法.md",
    title: "可能影响未成年人身心健康的网络信息分类办法",
    cites: ["第31条"],
    parent: "条文/第31条 → 专题/儿童个人信息保护",
    start: "可能影响未成年人身心健康的网络信息分类办法\n2026年1月23日",
  },
  {
    file: "GDPR儿童的同意.md",
    title: "GDPR儿童的同意（儿童的同意）",
    cites: ["第31条", "第28条"],
    parent: "条文/第31条 → 专题/儿童个人信息保护 → 域外法",
    start: "儿童的同意\n作者",
  },
  {
    file: "数据保护相关认证.md",
    title: "数据保护相关认证",
    cites: ["第38条", "第62条"],
    parent: "条文/第38条 → 专题/个人信息出境认证；亦被 条文/第62条 点名",
    start: "数据保护相关认证\n\n根据《中华人民共和国认证认可条例》",
  },
  {
    file: "其他对政府部门的通知义务.md",
    title: "其他对政府部门的通知义务",
    cites: ["第57条", "第51条"],
    parent: "条文/第57条 → 专题/数据泄露与网络安全事件",
    start: "其他对政府部门的通知义务",
  },
];

const ARTICLES = [
  { file: "第1条-立法目的.md", title: "第1条 立法目的", start: "第一条 立法目的" },
  { file: "第2条-个人信息受法律保护.md", title: "第2条 个人信息受法律保护", start: "第二条 个人信息受法律保护" },
  { file: "第3条-适用范围.md", title: "第3条 适用范围", start: "第三条 适用范围" },
  { file: "第10条-禁止性规定.md", title: "第10条 个人信息处理的禁止性规定", start: "第十条 个人信息处理的禁止性规定" },
  { file: "第11条-国家个人信息保护的任务.md", title: "第11条 国家个人信息保护的任务", start: "第十一条 国家个人信息保护的任务" },
  { file: "第12条-国际交流合作.md", title: "第12条 个人信息保护国际交流合作", start: "第十二条 个人信息保护国际交流合作" },
  { file: "第32条-敏感信息行政许可限制.md", title: "第32条 处理敏感个人信息的法定限制", start: "第三十二条 处理敏感个人信息的法定限制" },
  { file: "第33条-国家机关法律适用.md", title: "第33条 国家机关的法定义务与法律适用", start: "第三十三条 国家机关的法定义务与法律适用" },
  { file: "第34条-依法定职责处理.md", title: "第34条 依法定职责处理", start: "第三十四条 依法定职责处理" },
  { file: "第35条-国家机关告知义务.md", title: "第35条 对个人的告知义务", start: "第三十五条 对个人的告知义务" },
  { file: "第36条-国家机关境内存储与出境评估.md", title: "第36条 境内存储和境外提供风险评估", start: "第三十六条 境内存储和境外提供风险评估" },
  { file: "第37条-法定公共职能组织参照适用.md", title: "第37条 法定公共职能的组织的参照适用", start: "第三十七条 法定公共职能的组织的参照适用" },
  { file: "第42条-黑名单制度.md", title: "第42条 黑名单制度", start: "第四十二条 黑名单制度" },
  { file: "第43条-对等原则.md", title: "第43条 对等原则", start: "第四十三条 对等原则" },
  { file: "第60条-职能划分.md", title: "第60条 职能划分", start: "第六十条 职能划分" },
  { file: "第61条-基本职责.md", title: "第61条 基本职责", start: "第六十一条 基本职责" },
  { file: "第62条-网信部门统筹协调职能.md", title: "第62条 国家网信部门的统筹协调职能", start: "第六十二条 国家网信部门的统筹协调职能" },
  { file: "第63条-个人信息保护措施.md", title: "第63条 个人信息保护措施", start: "第六十三条 个人信息保护措施" },
  { file: "第64条-约谈与合规审计.md", title: "第64条 约谈、合规审计", start: "第六十四条 约谈、合规审计" },
  { file: "第65条-投诉举报机制.md", title: "第65条 投诉、举报机制", start: "第六十五条 投诉、举报机制" },
  { file: "第66条-行政责任.md", title: "第66条 行政责任", start: "第六十六条 行政责任" },
  { file: "第67条-信用档案制度.md", title: "第67条 信用档案制度", start: "第六十七条 信用档案制度" },
  { file: "第68条-国家机关法律责任.md", title: "第68条 国家机关的法律责任", start: "第六十八条 国家机关的法律责任" },
  { file: "第69条-民事责任.md", title: "第69条 民事责任", start: "第六十九条 民事责任" },
  { file: "第70条-公益诉讼.md", title: "第70条 公益诉讼", start: "第七十条 公益诉讼" },
  { file: "第71条-治安管理处罚和刑事责任.md", title: "第71条 治安管理处罚和刑事责任", start: "第七十一条 治安管理处罚和刑事责任" },
  { file: "第72条-适用除外.md", title: "第72条 适用除外", start: "第七十二条 适用除外" },
];

function findStart(text, start) {
  const i = text.indexOf(start);
  if (i < 0) throw new Error(`Start not found: ${start.slice(0, 40)}`);
  return i;
}

function writeMd(dir, file, header, body) {
  fs.writeFileSync(path.join(dir, file), header + body.trimEnd() + "\n", "utf8");
}

function main() {
  const text = fs.readFileSync(PASTE, "utf8");

  // --- topics ---
  // end of last topic is start of 第一条
  const topicEnd = findStart(text, "第一条 立法目的");
  const topicLocated = TOPICS.map((t) => ({ ...t, index: findStart(text, t.start) }));
  topicLocated.sort((a, b) => a.index - b.index);

  const writtenTopics = [];
  for (let i = 0; i < topicLocated.length; i++) {
    const cur = topicLocated[i];
    const end = i + 1 < topicLocated.length ? topicLocated[i + 1].index : topicEnd;
    let slice = text.slice(cur.index, end).trimEnd() + "\n";
    // For 其他对政府部门 - ends at 第一条; ok
    // For 数据保护相关认证 - ends at 其他对政府部门
    const header =
      `---\n` +
      `title: ${cur.title}\n` +
      `cites: [${cur.cites.join(", ")}]\n` +
      `parent: ${cur.parent}\n` +
      `source: user-paste-2026-08-15-gap2\n` +
      `note: 全文入库；图片占位原样保留\n` +
      `---\n\n` +
      `## 相关条文\n\n` +
      cur.cites
        .map((c) => {
          const num = c.replace(/第|条/g, "");
          const matches = fs.readdirSync(ART_DIR).filter((f) => f.startsWith(`第${num}条`));
          return matches[0]
            ? `- [${c}](../条文/${matches[0]})`
            : `- ${c}（条文待入库）`;
        })
        .join("\n") +
      `\n\n`;
    writeMd(TOPIC_DIR, cur.file, header, slice);
    writtenTopics.push({ file: cur.file, chars: slice.length });
  }

  // --- articles ---
  const artLocated = ARTICLES.map((t) => ({ ...t, index: findStart(text, t.start) }));
  artLocated.sort((a, b) => a.index - b.index);
  const writtenArts = [];
  for (let i = 0; i < artLocated.length; i++) {
    const cur = artLocated[i];
    const end = i + 1 < artLocated.length ? artLocated[i + 1].index : text.length;
    let slice = text.slice(cur.index, end).trimEnd() + "\n";
    // strip trailing meta about 附件、图片 if glued after 72 - keep article content only until next article; last is end
    const header =
      `---\n` +
      `title: ${cur.title}\n` +
      `source: user-paste-2026-08-15-gap2\n` +
      `note: 全文入库；图片占位原样保留\n` +
      `---\n\n`;
    writeMd(ART_DIR, cur.file, header, slice);
    writtenArts.push({ file: cur.file, chars: slice.length });
  }

  // post-link patches in new articles/topics
  const patches = [
    {
      file: path.join(ART_DIR, "第12条-国际交流合作.md"),
      from: "可参见本知识库第三章序言",
      to: "可参见[第三章-跨境规则引言](../专题/第三章-跨境规则引言.md)",
    },
    {
      file: path.join(ART_DIR, "第36条-国家机关境内存储与出境评估.md"),
      from: "参见本知识库第40条。",
      to: "参见[第40条](./第40条-关键信息基础设施与数量门槛.md)。",
    },
    {
      file: path.join(ART_DIR, "第62条-网信部门统筹协调职能.md"),
      from: "目前中国现行的认证体系参见数据保护相关认证",
      to: "目前中国现行的认证体系参见[数据保护相关认证](../专题/数据保护相关认证.md)",
    },
    {
      file: path.join(ART_DIR, "第62条-网信部门统筹协调职能.md"),
      from: "参见跨境安全认证",
      to: "参见[个人信息出境认证](../专题/个人信息出境认证.md)",
    },
  ];
  for (const p of patches) {
    if (!fs.existsSync(p.file)) continue;
    let t = fs.readFileSync(p.file, "utf8");
    if (t.includes(p.from)) {
      t = t.split(p.from).join(p.to);
      fs.writeFileSync(p.file, t, "utf8");
    }
  }

  // parent topic backlinks
  const parentPatches = [
    {
      file: path.join(TOPIC_DIR, "儿童个人信息保护.md"),
      from: "具体可见可能影响未成年人身心健康的网络信息分类办法",
      to: "具体可见[可能影响未成年人身心健康的网络信息分类办法](./可能影响未成年人身心健康的网络信息分类办法.md)",
    },
    {
      file: path.join(TOPIC_DIR, "儿童个人信息保护.md"),
      from: "参见GDPR儿童的同意",
      to: "参见[GDPR儿童的同意](./GDPR儿童的同意.md)",
    },
    {
      file: path.join(TOPIC_DIR, "个人信息出境认证.md"),
      from: "可参见数据保护相关认证",
      to: "可参见[数据保护相关认证](./数据保护相关认证.md)",
    },
    {
      file: path.join(TOPIC_DIR, "数据泄露与网络安全事件.md"),
      from: "详情可见：其他对政府部门的通知义务",
      to: "详情可见：[其他对政府部门的通知义务](./其他对政府部门的通知义务.md)",
    },
    {
      file: path.join(TOPIC_DIR, "GDPR儿童的同意.md"),
      from: "可参见如何验证家长同意",
      to: "可参见[如何验证家长同意](./如何验证家长同意.md)",
    },
    {
      file: path.join(TOPIC_DIR, "数据保护相关认证.md"),
      from: "具体可以参见跨境安全认证",
      to: "具体可以参见[个人信息出境认证](./个人信息出境认证.md)",
    },
    {
      file: path.join(TOPIC_DIR, "数据保护相关认证.md"),
      from: "参见：ISO体系认证",
      to: "参见：ISO体系认证（独立页仍缺）",
    },
  ];
  for (const p of parentPatches) {
    if (!fs.existsSync(p.file)) continue;
    let t = fs.readFileSync(p.file, "utf8");
    if (t.includes(p.from)) {
      t = t.split(p.from).join(p.to);
      fs.writeFileSync(p.file, t, "utf8");
    }
  }

  // Fix art1-related trailing junk on last article if user appended meta after 72
  const art72 = path.join(ART_DIR, "第72条-适用除外.md");
  let t72 = fs.readFileSync(art72, "utf8");
  const junk = t72.indexOf("附件、图片、法域/要点卡都要告诉我");
  if (junk > 0) {
    t72 = t72.slice(0, junk).trimEnd() + "\n";
    fs.writeFileSync(art72, t72, "utf8");
  }

  console.log(
    JSON.stringify(
      {
        topics: writtenTopics,
        articles: writtenArts,
        artCount: fs.readdirSync(ART_DIR).filter((f) => f.endsWith(".md")).length,
        topicCount: fs.readdirSync(TOPIC_DIR).filter((f) => f.endsWith(".md") && !f.startsWith("_")).length,
      },
      null,
      2
    )
  );
}

main();
