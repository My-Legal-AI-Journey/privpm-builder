import type { GenerateInput, PrivPMOutput } from "./types";
import { buildFixtureOutput } from "./fixtures";

const DISCLAIMER = "辅助隐私合规 PM 起草，不构成法律意见；跨境/未成年人/敏感处理等须法务确认。";

export async function generatePrivPM(input: GenerateInput): Promise<PrivPMOutput> {
  const key = process.env.STEPFUN_API_KEY?.trim();
  if (!key) return buildFixtureOutput(input);

  try {
    const base = (process.env.STEPFUN_BASE_URL || "https://api.stepfun.com/v1").replace(/\/$/, "");
    const model = process.env.STEPFUN_MODEL || "step-2-16k";
    const system = `你是 PrivPM：隐私合规 PM 工作流助手。根据功能/目的/法域输出 JSON，字段：
clarifyingQuestions:string[], riskControls:string[], userStories:{story,acceptance:string[]}[],
promptTemplate:string, stageSummary:string, citations:{path,note?}[]。
citations.path 必须使用知识库树路径，例如「《个保法》注释 → 第24条「自动化决策」」。
禁止声称提供法律意见；重要项标注需法务确认。只输出 JSON。`;

    const user = JSON.stringify(input);
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
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) {
      const fallback = buildFixtureOutput(input);
      fallback.meta = { mode: "fixture", disclaimer: `${DISCLAIMER}（StepFun HTTP ${res.status}，已回退样例包）` };
      return fallback;
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content ?? "";
    const jsonText = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(jsonText) as Omit<PrivPMOutput, "meta">;
    return {
      ...parsed,
      citations: parsed.citations?.length ? parsed.citations : buildFixtureOutput(input).citations,
      meta: { mode: "stepfun", disclaimer: DISCLAIMER },
    };
  } catch {
    const fallback = buildFixtureOutput(input);
    fallback.meta = { mode: "fixture", disclaimer: `${DISCLAIMER}（模型调用失败，已回退样例包）` };
    return fallback;
  }
}
