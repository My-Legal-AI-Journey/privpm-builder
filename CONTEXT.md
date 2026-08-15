# CONTEXT.md — PrivPM

## One-liner

PrivPM 帮隐私合规 PM 用 AI 把业务/法规要求变成可评审的用户故事、验收标准与 Prompt 模板。

## Canonical repo

`/Users/melendez/Desktop/工作/工作/privpm-builder`  
独立仓库，不放在 `My-Legal-AI-Journey` 下。Vela 仍在该 monorepo。

## Why this exists

- Owner 投递字节跳动「AI Builder 产品实习生 - 隐私和数据保护办公室」(职位 ID **A18352**)
- 用 StepFun Builder Program 获取模型额度并完成可展示作品
- 与 Vela（合规协查过程产品）分工：Vela = Legal Tech 深作品；PrivPM = **PM 赋能竖切**

## Non-goals

- 简历/面试题生成器
- 替代法务出具意见
- 重建 Vela

## Status

- [x] Spec + agent skill 指引 + repo scaffold
- [x] Demo 样例包（`demo/01` 推荐 · `demo/02` 出境）
- [x] App MVP（UI + `/api/generate`；无 Key 时 fixture）
- [x] Public demo link + GitHub（Pages Demo + `My-Legal-AI-Journey/privpm-builder`）
- [x] StepFun 申请文案就绪（`docs/stepfun-application.draft.md`；**【提交】仍待本人点提交）
- [ ] StepFun application submitted
- [x] ByteDance materials (`docs/bytedance/`) — JD + 投递包；专投简历 docx 未改

## Sample demo input

见 [`demo/01-personalized-feed.md`](demo/01-personalized-feed.md) / [`demo/02-cross-border-scc.md`](demo/02-cross-border-scc.md)。

## Owner

郭一铄 / Felix — 见 skill `owner-context.md`。
