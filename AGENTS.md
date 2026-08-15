# AGENTS.md — PrivPM

本文件约束在 **`/Users/melendez/Desktop/工作/工作/privpm-builder`** 上工作的代码 Agent。该路径为 PrivPM 规范仓（独立于 `My-Legal-AI-Journey`）。

## 必读 Skill

开始任何实质工作前，读取并遵循：

`/Users/melendez/.cursor/skills/privpm-stepfun-builder/SKILL.md`

及其同目录：`owner-context.md` · `product-spec.md` · `stepfun-application.md` · `bytedance-pack.md`

## 仓库身份

- **PrivPM**：隐私合规 PM AI 工作流助手（Web Demo）
- 双目标：① [StepFun Builder Program](https://platform.stepfun.com/builder-program) ② 字节 A18352（隐私与数据保护办公室 · AI Builder）
- **不是**求职/简历优化 Agent；**不是** Vela 的 fork

## 产品主线（v0.1）

表单（功能 + 数据用途 + 法域）→ StepFun → 输出：澄清问题 / 风险点 / 用户故事+验收 / Prompt 模板 / 阶段小结

详情见 `CONTEXT.md` 与 skill 内 `product-spec.md`。

## 工作纪律

1. 先垂直切片可演示，再美化
2. 密钥仅 `.env`；提交 `.env.example`
3. 文案避免「本工具提供法律意见」
4. 未经用户要求：不强制 `git push`、不改远程可见性、不提交密钥
5. 需要改简历时另开任务；默认只维护本仓 Demo 与投递文案草稿于 `docs/`

## 文档裁决顺序

1. `AGENTS.md` / `CONTEXT.md` / `README.md`
2. Skill `product-spec.md`
3. `docs/` 下交接与申请草稿
