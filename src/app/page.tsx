"use client";

import { useMemo, useState, type CSSProperties } from "react";
import type { GenerateInput, Jurisdiction, PrivPMOutput } from "@/lib/types";
import { toMarkdown } from "@/lib/markdown";

const SAMPLES: { label: string; input: GenerateInput }[] = [
  {
    label: "样例 A · 个性化推荐 Feed",
    input: {
      feature: "App 内「个性化推荐 Feed」使用浏览与点击行为。",
      purpose: "提升停留时长。",
      jurisdiction: "CN",
      knownIssues: "尚未区分必要数据处理与可关闭的个性化；未成年人模式未定义。",
    },
  },
  {
    label: "样例 B · 客服数据出境 SCC",
    input: {
      feature: "中国运营的 SaaS 将客户工单中的联系人姓名、手机号同步至位于新加坡的集团客服中台。",
      purpose: "统一客服工单处理与质检。",
      jurisdiction: "CN",
      knownIssues: "尚未完成出境路径选型；单独同意与 SCC 备案材料未齐；是否属于「业务需要确需」未论证。",
    },
  },
];

type Tab = "clarify" | "risks" | "stories" | "prompt" | "summary" | "cites";

export default function HomePage() {
  const [feature, setFeature] = useState(SAMPLES[0].input.feature);
  const [purpose, setPurpose] = useState(SAMPLES[0].input.purpose);
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>("CN");
  const [knownIssues, setKnownIssues] = useState(SAMPLES[0].input.knownIssues ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<PrivPMOutput | null>(null);
  const [tab, setTab] = useState<Tab>("clarify");
  const [copied, setCopied] = useState(false);

  const md = useMemo(() => (output ? toMarkdown(output) : ""), [output]);

  function loadSample(i: number) {
    const s = SAMPLES[i].input;
    setFeature(s.feature);
    setPurpose(s.purpose);
    setJurisdiction(s.jurisdiction);
    setKnownIssues(s.knownIssues ?? "");
    setOutput(null);
    setError(null);
  }

  async function onGenerate() {
    setLoading(true);
    setError(null);
    setCopied(false);
    const input: GenerateInput = { feature, purpose, jurisdiction, knownIssues };
    try {
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (res.ok) {
          setOutput((await res.json()) as PrivPMOutput);
          setTab("clarify");
          return;
        }
      } catch {
        /* static hosting / offline → fixture */
      }
      const { buildFixtureOutput } = await import("@/lib/fixtures");
      setOutput(buildFixtureOutput(input));
      setTab("clarify");
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function copyAll() {
    if (!md) return;
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.brand}>PrivPM</p>
          <h1 style={styles.h1}>隐私合规 PM AI 工作流助手</h1>
          <p style={styles.sub}>
            StepFun Builder Demo · 功能 + 数据用途 + 法域 → 五段可评审草稿（澄清 / 风险 / 故事验收 / Prompt / 小结）
          </p>
        </div>
        <p style={styles.badge}>CN 默认 · EU 可选接口</p>
      </header>

      <div style={styles.grid}>
        <section style={styles.panel}>
          <h2 style={styles.h2}>输入</h2>
          <div style={styles.sampleRow}>
            {SAMPLES.map((s, i) => (
              <button key={s.label} type="button" style={styles.chip} onClick={() => loadSample(i)}>
                {s.label}
              </button>
            ))}
          </div>
          <label style={styles.label}>
            功能
            <textarea style={styles.ta} rows={3} value={feature} onChange={(e) => setFeature(e.target.value)} />
          </label>
          <label style={styles.label}>
            数据用途 / 目的
            <textarea style={styles.ta} rows={2} value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </label>
          <label style={styles.label}>
            法域
            <select
              style={styles.select}
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value as Jurisdiction)}
            >
              <option value="CN">CN</option>
              <option value="EU">EU</option>
              <option value="CN+EU">CN+EU</option>
            </select>
          </label>
          <label style={styles.label}>
            已知问题（可选）
            <textarea style={styles.ta} rows={3} value={knownIssues} onChange={(e) => setKnownIssues(e.target.value)} />
          </label>
          <button type="button" style={styles.primary} disabled={loading || !feature || !purpose} onClick={onGenerate}>
            {loading ? "生成中…" : "生成五段输出"}
          </button>
          {error && <p style={styles.err}>{error}</p>}
        </section>

        <section style={styles.panel}>
          <div style={styles.outHead}>
            <h2 style={styles.h2}>输出</h2>
            <button type="button" style={styles.secondary} disabled={!output} onClick={copyAll}>
              {copied ? "已复制" : "复制全部 Markdown"}
            </button>
          </div>
          {!output && <p style={styles.muted}>加载样例并点击生成。无 API Key 时使用仓库内 demo 样例包（fixture）。</p>}
          {output && (
            <>
              <p style={styles.meta}>
                模式：<strong>{output.meta.mode}</strong> · {output.meta.disclaimer}
              </p>
              <div style={styles.tabs}>
                {(
                  [
                    ["clarify", "拆解"],
                    ["risks", "风险"],
                    ["stories", "故事"],
                    ["prompt", "模板"],
                    ["summary", "小结"],
                    ["cites", "引用"],
                  ] as const
                ).map(([k, label]) => (
                  <button
                    key={k}
                    type="button"
                    style={tab === k ? styles.tabOn : styles.tab}
                    onClick={() => setTab(k)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div style={styles.body}>
                {tab === "clarify" && (
                  <ol>
                    {output.clarifyingQuestions.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ol>
                )}
                {tab === "risks" && (
                  <ul>
                    {output.riskControls.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                )}
                {tab === "stories" &&
                  output.userStories.map((s, i) => (
                    <div key={i} style={styles.story}>
                      <p>
                        <strong>故事 {i + 1}.</strong> {s.story}
                      </p>
                      <ul>
                        {s.acceptance.map((a) => (
                          <li key={a}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                {tab === "prompt" && <pre style={styles.pre}>{output.promptTemplate}</pre>}
                {tab === "summary" && <p>{output.stageSummary}</p>}
                {tab === "cites" && (
                  <ul>
                    {output.citations.map((c) => (
                      <li key={c.path}>
                        <code style={styles.code}>{c.path}</code>
                        {c.note ? ` — ${c.note}` : ""}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      <footer style={styles.footer}>辅助 PM 草稿，不构成法律意见。知识库切片见 <code>demo/</code> 与 <code>知识库/PIPL/</code>。</footer>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { maxWidth: 1100, margin: "0 auto", padding: "32px 20px 48px" },
  header: { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: 28 },
  brand: { margin: 0, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7eb6e8", fontSize: 12 },
  h1: { margin: "6px 0 8px", fontSize: "1.75rem", fontWeight: 650 },
  sub: { margin: 0, color: "var(--muted)", maxWidth: 560, lineHeight: 1.5 },
  badge: {
    margin: 0,
    padding: "8px 12px",
    border: "1px solid var(--border)",
    borderRadius: 999,
    color: "var(--muted)",
    fontSize: 13,
    whiteSpace: "nowrap",
  },
  grid: { display: "grid", gridTemplateColumns: "minmax(280px, 1fr) minmax(320px, 1.2fr)", gap: 16 },
  panel: {
    background: "var(--panel)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: 18,
    minHeight: 420,
  },
  h2: { margin: "0 0 12px", fontSize: "1.05rem" },
  sampleRow: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  chip: {
    border: "1px solid var(--border)",
    background: "#121820",
    borderRadius: 8,
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: 12,
  },
  label: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 12, fontSize: 13, color: "var(--muted)" },
  ta: {
    width: "100%",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "#121820",
    padding: 10,
    resize: "vertical",
  },
  select: {
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "#121820",
    padding: "8px 10px",
  },
  primary: {
    width: "100%",
    marginTop: 4,
    border: 0,
    borderRadius: 8,
    padding: "12px 14px",
    background: "linear-gradient(180deg, var(--accent), var(--accent-dim))",
    cursor: "pointer",
    fontWeight: 600,
  },
  secondary: {
    border: "1px solid var(--border)",
    background: "#121820",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: 13,
  },
  err: { color: "#f08080", fontSize: 13 },
  muted: { color: "var(--muted)", lineHeight: 1.5 },
  outHead: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 },
  meta: { color: "var(--warn)", fontSize: 12, lineHeight: 1.45 },
  tabs: { display: "flex", flexWrap: "wrap", gap: 6, margin: "12px 0" },
  tab: {
    border: "1px solid var(--border)",
    background: "transparent",
    borderRadius: 8,
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: 13,
  },
  tabOn: {
    border: "1px solid var(--accent)",
    background: "#15304a",
    borderRadius: 8,
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: 13,
  },
  body: { fontSize: 14, lineHeight: 1.55 },
  story: { marginBottom: 14 },
  pre: {
    whiteSpace: "pre-wrap",
    background: "#121820",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: 12,
    fontFamily: "var(--mono)",
    fontSize: 12,
  },
  code: { fontFamily: "var(--mono)", fontSize: 12 },
  footer: { marginTop: 28, color: "var(--muted)", fontSize: 12, textAlign: "center" },
};
