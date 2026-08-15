#!/usr/bin/env python3
"""Extract Tencent Research CN/EU/US privacy law comparison PDF into markdown chapters."""
from __future__ import annotations

import re
from pathlib import Path

from pypdf import PdfReader

PDF = Path(
    "/Users/melendez/Desktop/工作/工作/privpm-builder/参考文献/"
    "中美欧个人信息保护法比较——以中国个人信息保护法、欧盟GDPR，美国加州CCPA&CPRA为样本.pdf"
)
OUT = Path("/Users/melendez/Desktop/工作/工作/privpm-builder/知识库/PIPL/比较")
ART_DIR = Path("/Users/melendez/Desktop/工作/工作/privpm-builder/知识库/PIPL/条文")

# 1-based inclusive PDF page ranges (file pages; skip blank cover + TOC)
CHAPTERS = [
    {
        "file": "00-引言.md",
        "title": "引言与图标说明",
        "page_list": [2, 4],  # 跳过 p3 目录
        "cites": ["第3条", "第4条"],
        "topics": [],
        "verify": "立法背景与样本说明；报告写于2021，PIPL 已生效。图标说明解释比较矢量图读法。",
    },
    {
        "file": "01-立法模式与适用范围.md",
        "title": "一、立法模式与适用范围",
        "page_list": list(range(5, 15)),
        "cites": ["第3条", "第4条"],
        "topics": [],
        "verify": "印证域外适用与规制对象；本库若无第3条全文则以比较正文为准并待补条文。",
    },
    {
        "file": "02-个人信息的定义与分类.md",
        "title": "二、个人信息的定义与分类",
        "page_list": list(range(15, 28)),
        "cites": ["第4条", "第28条", "第73条"],
        "topics": ["匿名化与去标识化"],
        "verify": "印证：`条文/第4、28、73条`；`专题/匿名化与去标识化`。",
    },
    {
        "file": "03-合法性基础.md",
        "title": "三、合法性基础",
        "page_list": list(range(28, 32)),
        "cites": ["第13条", "第14条", "第18条"],
        "topics": ["履行合同所必需", "实务中的知情-同意操作"],
        "verify": "印证：`条文/第13–18条`；`专题/履行合同所必需`、`实务中的知情-同意操作`。",
    },
    {
        "file": "04-个人信息的跨境提供.md",
        "title": "四、个人信息的跨境提供",
        "page_list": list(range(32, 36)),
        "cites": ["第38条", "第39条", "第40条"],
        "topics": [
            "第三章-跨境规则引言",
            "数据出境安全评估",
            "个人信息出境认证",
            "数据出境标准合同",
        ],
        "verify": "报告早于《促进和规范数据跨境流动规定》等；跨境细则以本库第38–40条及跨境专题为准。",
    },
    {
        "file": "05-信息主体的权利.md",
        "title": "五、信息主体的权利",
        "page_list": list(range(36, 79)),
        "cites": ["第44条", "第45条", "第46条", "第47条", "第48条", "第50条"],
        "topics": ["可携权", "隐私政策设计", "个性化推荐"],
        "verify": "印证：`条文/第44–50条`；`专题/可携权`；自动化决策相关见第24条与个性化推荐专题。",
    },
]


def clean_page_text(t: str) -> str:
    if not t:
        return ""
    lines = []
    for line in t.splitlines():
        s = line.strip()
        if re.fullmatch(r"\d{1,3}", s):
            continue
        if "...." in s and len(s) > 20:
            continue
        lines.append(s)
    out, buf = [], []
    for s in lines:
        if not s:
            if buf:
                out.append("".join(buf))
                buf = []
            out.append("")
        else:
            if buf and re.match(r"^[A-Za-z0-9\(]", s) and re.search(
                r"[A-Za-z0-9\)]$", buf[-1]
            ):
                buf.append(" ")
            buf.append(s)
    if buf:
        out.append("".join(buf))
    return re.sub(r"\n{3,}", "\n\n", "\n".join(out)).strip()


def art_link(cite: str) -> str:
    num = re.sub(r"[第条]", "", cite)
    matches = list(ART_DIR.glob(f"第{num}条-*.md"))
    if matches:
        return f"- [{cite}](../条文/{matches[0].name})"
    return f"- {cite}（条文页尚未入库）"


def main():
    reader = PdfReader(str(PDF))
    n_pages = len(reader.pages)
    pages = [clean_page_text(p.extract_text() or "") for p in reader.pages]
    OUT.mkdir(parents=True, exist_ok=True)

    written = []
    for ch in CHAPTERS:
        plist = [p for p in ch["page_list"] if 1 <= p <= n_pages]
        chunks = []
        for pno in plist:
            if pages[pno - 1]:
                chunks.append(f"<!-- PDF p.{pno} -->\n{pages[pno - 1]}")
        body = "\n\n".join(chunks).strip() + "\n"

        art_links = [art_link(c) for c in ch["cites"]]
        topic_links = [f"- [{t}](../专题/{t}.md)" for t in ch["topics"]]
        page_label = (
            f"{plist[0]}-{plist[-1]}" if plist[-1] - plist[0] + 1 == len(plist) else ",".join(map(str, plist))
        )

        header = (
            "---\n"
            f"title: {ch['title']}\n"
            "source: 腾讯研究院《中美欧个人信息保护法比较》PDF\n"
            f"pages: {page_label}\n"
            f"cites: [{', '.join(ch['cites'])}]\n"
            "note: 全文抽取不删减；报告写于2021年，不确定处见文末印证\n"
            "---\n\n"
            f"# {ch['title']}\n\n"
        )
        footer = (
            "\n---\n\n"
            "## 与本库印证\n\n"
            f"{ch['verify']}\n\n"
            "### 相关条文\n\n"
            + "\n".join(art_links)
            + "\n\n### 相关专题\n\n"
            + ("\n".join(topic_links) if topic_links else "（无）")
            + "\n"
        )
        path = OUT / ch["file"]
        path.write_text(header + body + footer, encoding="utf8")
        written.append({"file": ch["file"], "bytes": path.stat().st_size, "pages": page_label})

    idx = """# 中美欧个人信息保护法比较（知识库）

来源：腾讯研究院专题报告 PDF（2021）  
原件：[`../../../参考文献/中美欧个人信息保护法比较——以中国个人信息保护法、欧盟GDPR，美国加州CCPA&CPRA为样本.pdf`](../../../参考文献/中美欧个人信息保护法比较——以中国个人信息保护法、欧盟GDPR，美国加州CCPA&CPRA为样本.pdf)

入库原则：按章全文抽取，不删减小节；报告早于后续跨境细则与若干规范，**不确定处以本库现行条文/专题为准**（见各章文末「与本库印证」）。

## 章节

| 文件 | 主题 | PDF 页 | 主要印证 |
|------|------|--------|----------|
| [00-引言.md](00-引言.md) | 引言与图标说明 | 2、4 | 立法背景 |
| [01-立法模式与适用范围.md](01-立法模式与适用范围.md) | 立法模式与适用范围 | 5–14 | 第3–4条体系 |
| [02-个人信息的定义与分类.md](02-个人信息的定义与分类.md) | 定义与分类 | 15–27 | 第4、28、73条；匿名化专题 |
| [03-合法性基础.md](03-合法性基础.md) | 合法性基础 | 28–31 | 第13–18条；合同必要/知情同意实务 |
| [04-个人信息的跨境提供.md](04-个人信息的跨境提供.md) | 跨境提供 | 32–35 | 第38–40条；安全评估/认证/标准合同 |
| [05-信息主体的权利.md](05-信息主体的权利.md) | 信息主体权利 | 36–78 | 第44–50条；可携权 |

## 脚本

[`../../../scripts/import-cn-eu-us-compare.py`](../../../scripts/import-cn-eu-us-compare.py)
"""
    (OUT / "_索引.md").write_text(idx, encoding="utf8")
    print({"pages_total": n_pages, "written": written})


if __name__ == "__main__":
    main()
