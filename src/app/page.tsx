"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { GenerateInput, Jurisdiction, PrivPMOutput } from "@/lib/types";
import { toMarkdown } from "@/lib/markdown";
import { normalizeInputBrief } from "@/lib/normalize";

const SAMPLE_A = `功能：App 内“个性化推荐 Feed”使用浏览与点击行为。
目的：提升停留时长。
法域：CN（后续计划欧盟上线）。
已知问题：尚未区分必要数据处理与可关闭的个性化；未成年人模式未定义。`;

const SAMPLE_B = `功能：中国运营的 SaaS 将客户工单中的联系人姓名、手机号同步至位于新加坡的集团客服中台。
目的：统一客服工单处理与质检。
法域：CN。
已知问题：尚未完成出境路径选型；单独同意与 SCC 备案材料未齐；是否属于“业务需要确需”未论证。`;

type Tab = "clarify" | "risks" | "stories" | "prompt" | "summary" | "cites";

const TABS: { id: Tab; label: string }[] = [
  { id: "clarify", label: "拆解" },
  { id: "risks", label: "风险" },
  { id: "stories", label: "故事" },
  { id: "prompt", label: "模板" },
  { id: "summary", label: "小结" },
  { id: "cites", label: "引用" },
];

const JURIS: { id: Jurisdiction; title: string; code: string }[] = [
  { id: "CN", title: "中国", code: "CN" },
  { id: "EU", title: "欧盟", code: "EU" },
  { id: "CN+EU", title: "中欧对照", code: "CN+EU" },
];

type InputMode = "input" | "a" | "b";

function citeHref(slug?: string): string | null {
  if (!slug) return null;
  return `/kb/${slug.split("/").map(encodeURIComponent).join("/")}`;
}

export default function HomePage() {
  const [brief, setBrief] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("input");
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>("CN");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<PrivPMOutput | null>(null);
  const [tab, setTab] = useState<Tab>("clarify");
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const briefRef = useRef<HTMLTextAreaElement>(null);

  const md = useMemo(() => (output ? toMarkdown(output) : ""), [output]);

  function startManualInput() {
    setBrief("");
    setInputMode("input");
    setOutput(null);
    setError(null);
    requestAnimationFrame(() => briefRef.current?.focus());
  }

  function loadSample(text: string, mode: InputMode) {
    setBrief(text);
    setInputMode(mode);
    setOutput(null);
    setError(null);
  }

  async function onGenerate() {
    setLoading(true);
    setError(null);
    setCopiedAll(false);
    const input: GenerateInput = {
      brief: normalizeInputBrief(brief),
      jurisdiction,
    };
    setBrief(input.brief);
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
        /* static / offline → fixture */
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
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }

  async function copyPrompt() {
    if (!output?.promptTemplate) return;
    await navigator.clipboard.writeText(output.promptTemplate);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  }

  return (
    <main className="pm-shell">
      <header className="pm-header">
        <div>
          <p className="pm-brand">PrivPM</p>
          <h1 className="pm-title">隐私合规 PM AI 工作流助手</h1>
          <p className="pm-sub">
            StepFun Builder Demo · 贴需求 → 澄清 / 风险讲解 / 故事验收 / Prompt / 小结，并链到知识库学习。
          </p>
        </div>
        <nav className="pm-nav">
          <Link className="pm-btn-ghost" href="/kb">
            知识库
          </Link>
          <span className="pm-tag">CN 默认 · EU 可选</span>
        </nav>
      </header>

      <div className="pm-grid">
        <section className="pm-card">
          <h2 className="pm-h2">输入</h2>
          <div className="pm-chip-row">
            <button
              type="button"
              className={`pm-chip${inputMode === "input" ? " pm-chip-accent" : ""}`}
              onClick={startManualInput}
            >
              输入
            </button>
            <button
              type="button"
              className={`pm-chip${inputMode === "a" ? " pm-chip-accent" : ""}`}
              onClick={() => loadSample(SAMPLE_A, "a")}
            >
              样例 A
            </button>
            <button
              type="button"
              className={`pm-chip${inputMode === "b" ? " pm-chip-accent" : ""}`}
              onClick={() => loadSample(SAMPLE_B, "b")}
            >
              样例 B
            </button>
          </div>
          <label className="pm-label">
            原始需求
            <textarea
              ref={briefRef}
              className="pm-input pm-brief"
              rows={12}
              value={brief}
              onChange={(e) => {
                setBrief(e.target.value);
                setInputMode("input");
              }}
              placeholder="粘贴功能、目的、已知问题…"
            />
          </label>
          <div className="pm-label">
            法域
            <div className="pm-juris" role="radiogroup" aria-label="法域">
              {JURIS.map((j) => (
                <button
                  key={j.id}
                  type="button"
                  role="radio"
                  aria-checked={jurisdiction === j.id}
                  className={`pm-juris-card${jurisdiction === j.id ? " is-on" : ""}`}
                  onClick={() => setJurisdiction(j.id)}
                >
                  <span className="pm-juris-title">{j.title}</span>
                  <span className="pm-juris-code">{j.code}</span>
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="pm-btn-primary"
            disabled={loading || !brief.trim()}
            onClick={onGenerate}
          >
            {loading ? "生成中…" : "生成五段输出"}
          </button>
          {error && <p className="pm-err">{error}</p>}
        </section>

        <section className="pm-card">
          <div className="pm-out-head">
            <h2 className="pm-h2">输出</h2>
            <button type="button" className="pm-btn-ghost" disabled={!output} onClick={copyAll}>
              {copiedAll ? "已复制" : "复制全部 Markdown"}
            </button>
          </div>
          {!output && (
            <p className="pm-muted">点「输入」手写，或用样例 A/B 填入后再生成。无 API Key 时使用样例包。</p>
          )}
          {output && (
            <>
              <p className="pm-info">
                模式：<strong>{output.meta.mode}</strong> · {output.meta.disclaimer}
              </p>
              <div className="pm-tabs" role="tablist">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    className={`pm-tab${tab === t.id ? " is-active" : ""}`}
                    aria-selected={tab === t.id}
                    onClick={() => setTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="pm-body">
                {tab === "clarify" && (
                  <ol>
                    {output.clarifyingQuestions.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ol>
                )}
                {tab === "risks" && (
                  <div className="pm-risk-stack">
                    {output.riskControls.map((r) => (
                      <article key={r.title} className="pm-risk-card">
                        <h3 className="pm-risk-title">{r.title}</h3>
                        <p>{r.explain}</p>
                        <p className="pm-risk-action">
                          <strong>你可以做：</strong>
                          {r.pmAction}
                        </p>
                        {r.refHint && <p className="pm-muted">{r.refHint}</p>}
                      </article>
                    ))}
                  </div>
                )}
                {tab === "stories" &&
                  output.userStories.map((s, i) => (
                    <div key={i} className="pm-story">
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
                {tab === "prompt" && (
                  <div className="pm-prompt-wrap">
                    <div className="pm-prompt-bar">
                      <span className="pm-muted">Prompt 模板</span>
                      <button type="button" className="pm-btn-ghost" onClick={copyPrompt}>
                        {copiedPrompt ? "已复制" : "复制"}
                      </button>
                    </div>
                    <pre className="pm-pre">{output.promptTemplate}</pre>
                  </div>
                )}
                {tab === "summary" && (
                  <ol>
                    {output.stageSummary.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ol>
                )}
                {tab === "cites" && (
                  <ul className="pm-cite-list">
                    {output.citations.map((c) => {
                      const href = citeHref(c.slug);
                      return (
                        <li key={c.path}>
                          {href ? (
                            <Link href={href}>{c.path}</Link>
                          ) : (
                            <span className="pm-cite-dead">{c.path}</span>
                          )}
                          {c.note ? ` — ${c.note}` : ""}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      <footer className="pm-footer">
        辅助 PM 草稿，不构成法律意见。可在 <Link href="/kb">知识库</Link> 对照条文与专题。
      </footer>
    </main>
  );
}
