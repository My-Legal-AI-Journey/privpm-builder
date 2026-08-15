import type { PrivPMOutput } from "./types";

export function toMarkdown(out: PrivPMOutput): string {
  const lines: string[] = [];
  lines.push(`> ${out.meta.disclaimer}`);
  lines.push(`> 生成模式：${out.meta.mode}`);
  lines.push("");
  lines.push("## 1. 澄清问题");
  out.clarifyingQuestions.forEach((q, i) => lines.push(`${i + 1}. ${q}`));
  lines.push("");
  lines.push("## 2. 风险控制点");
  out.riskControls.forEach((r) => lines.push(`- ${r}`));
  lines.push("");
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
  lines.push(out.stageSummary);
  lines.push("");
  lines.push("## 知识库引用（树路径）");
  out.citations.forEach((c) => {
    lines.push(`- ${c.path}${c.note ? ` — ${c.note}` : ""}`);
  });
  lines.push("");
  return lines.join("\n");
}
