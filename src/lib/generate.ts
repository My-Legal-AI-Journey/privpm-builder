import type { GenerateInput, PrivPMOutput, RiskControl } from "./types";
import { buildFixtureOutput } from "./fixtures";
import { normalizeInputBrief, normalizeQuotes } from "./normalize";

const DISCLAIMER =
  "辅助隐私合规 PM 起草，不构成法律意见；涉及跨境、未成年人、敏感信息等请法务确认后再定稿。";

function coerceRisks(raw: unknown): RiskControl[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw.map((item) => {
    if (typeof item === "string") {
      return {
        title: normalizeQuotes(item.slice(0, 40)),
        explain: normalizeQuotes(item),
        pmAction: "把该点写进评审纪要，并标注需法务确认。",
      };
    }
    const o = item as RiskControl;
    return {
      title: normalizeQuotes(o.title || "风险点"),
      explain: normalizeQuotes(o.explain || ""),
      pmAction: normalizeQuotes(o.pmAction || "与法务确认后写入验收。"),
      refHint: o.refHint ? normalizeQuotes(o.refHint) : undefined,
    };
  });
}

function coerceSummary(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((s) => normalizeQuotes(String(s)));
  if (typeof raw === "string" && raw.trim()) {
    return raw
      .split(/\n|；|;|。/)
      .map((s) => normalizeQuotes(s.trim()))
      .filter(Boolean);
  }
  return [];
}

export async function generatePrivPM(rawInput: GenerateInput): Promise<PrivPMOutput> {
  const input: GenerateInput = {
    brief: normalizeInputBrief(rawInput.brief),
    jurisdiction: rawInput.jurisdiction,
  };

  const key = process.env.STEPFUN_API_KEY?.trim();
  if (!key) return buildFixtureOutput(input);

  try {
    const base = (process.env.STEPFUN_BASE_URL || "https://api.stepfun.com/v1").replace(/\/$/, "");
    const model = process.env.STEPFUN_MODEL || "step-2-16k";
    const system = `你是 PrivPM：面向隐私合规产品经理的工作流助手。根据需求 brief 与法域输出 JSON。
字段：
- clarifyingQuestions: string[]（PM 能听懂的开放问题，少用法律术语）
- riskControls: {title,explain,pmAction,refHint?}[]（explain 要讲清产品影响，足够详细）
- userStories: {story,acceptance:string[]}[]
- promptTemplate: string
- stageSummary: string[]（按点分段，不要写成一大段）
- citations: {path,note?,slug?}[]（path 用知识库树路径；slug 若可知则给 条文/第N条-主题 或 专题/名称）
硬性要求：
1) 全文禁止使用「」『』，一律用中文双引号“”
2) 不构成法律意见；重要项写“需法务确认”
3) 只输出 JSON`;

    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        messages: [
          { role: "system", content: system },
          { role: "user", content: JSON.stringify(input) },
        ],
      }),
    });

    if (!res.ok) {
      const fallback = buildFixtureOutput(input);
      fallback.meta = {
        mode: "fixture",
        disclaimer: `${DISCLAIMER}（StepFun HTTP ${res.status}，已回退样例包）`,
      };
      return fallback;
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content ?? "";
    const jsonText = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(jsonText) as Partial<PrivPMOutput>;
    const fixture = buildFixtureOutput(input);
    return {
      clarifyingQuestions: (parsed.clarifyingQuestions ?? []).map((q) => normalizeQuotes(q)),
      riskControls: coerceRisks(parsed.riskControls).length
        ? coerceRisks(parsed.riskControls)
        : fixture.riskControls,
      userStories: (parsed.userStories ?? fixture.userStories).map((s) => ({
        story: normalizeQuotes(s.story),
        acceptance: s.acceptance.map((a) => normalizeQuotes(a)),
      })),
      promptTemplate: normalizeQuotes(parsed.promptTemplate || fixture.promptTemplate),
      stageSummary: coerceSummary(parsed.stageSummary).length
        ? coerceSummary(parsed.stageSummary)
        : fixture.stageSummary,
      citations: parsed.citations?.length ? parsed.citations : fixture.citations,
      meta: { mode: "stepfun", disclaimer: DISCLAIMER },
    };
  } catch {
    const fallback = buildFixtureOutput(input);
    fallback.meta = {
      mode: "fixture",
      disclaimer: `${DISCLAIMER}（模型调用失败，已回退样例包）`,
    };
    return fallback;
  }
}
