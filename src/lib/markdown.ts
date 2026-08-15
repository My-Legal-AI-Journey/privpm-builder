import type { PrivPMOutput } from "./types";

export function toMarkdown(out: PrivPMOutput): string {
  const lines: string[] = [];
  lines.push(`> ${out.meta.disclaimer}`);
  lines.push(`> 生成模式：${out.meta.mode}`);
  lines.push("");
  lines.push("## 1. 澄清问题");
  out.clarifyingQuestions.forEach((q, i) => lines.push(`${i + 1}. ${q}`));
  lines.push("");
  lines.push("## 2. 风险说明");
  out.riskControls.forEach((r, i) => {
    lines.push(`### ${i + 1}. ${r.title}`);
    lines.push(r.explain);
    lines.push(`**PM 行动：** ${r.pmAction}`);
    if (r.refHint) lines.push(`*提示：* ${r.refHint}`);
    lines.push("");
  });
  lines.push("## 3. 用户故事与验收标准");
  out.userStories.forEach((s, i) => {
    lines.push(`### 故事 ${i + 1}`);
    lines.push(s.story);
    lines.push("验收：");
    s.acceptance.forEach((a) => lines.push(`- [ ] ${a}`));
    lines.push("");
  });
  lines.push("## 4. Prompt 模板");
  lines.push("```");
  lines.push(out.promptTemplate);
  lines.push("```");
  lines.push("");
  lines.push("## 5. 阶段小结");
  out.stageSummary.forEach((p, i) => lines.push(`${i + 1}. ${p}`));
  lines.push("");
  lines.push("## 知识库引用");
  out.citations.forEach((c) => {
    const link = c.slug ? ` (/kb/${c.slug})` : "";
    lines.push(`- ${c.path}${c.note ? ` — ${c.note}` : ""}${link}`);
  });
  lines.push("");
  return lines.join("\n");
}
