# PrivPM

隐私合规 PM AI 工作流助手 · Privacy-compliance PM AI workflow demo.

> 帮隐私合规 PM 把「功能 + 数据用途 + 法域」一次变成：澄清问题、风险控制点、用户故事与验收标准、Prompt 模板、阶段小结。  
> EN: Turn feature + data purpose + jurisdiction into review-ready PM artifacts (clarifying questions, risk controls, stories/AC, prompt template, stage summary).

## 90 秒演示路径

1. `npm install && npm run dev`
2. 打开 http://localhost:3000
3. 点「样例 A · 个性化推荐 Feed」→「生成五段输出」
4. 切换 Tabs：拆解 → 风险 → 故事 → 模板 → 小结 → **引用**（知识库树路径）
5. 「复制全部 Markdown」粘贴到笔记 / 模板库

无 `STEPFUN_API_KEY` 时自动使用仓库 [`demo/`](demo/) 样例包（fixture），仍可完整演示。

## 启动

```bash
cp .env.example .env   # 可选：填入 StepFun Key
npm install
npm run dev
```

| 变量 | 说明 |
|------|------|
| `STEPFUN_API_KEY` | 有则调用 StepFun；无则 fixture |
| `STEPFUN_BASE_URL` | 默认 `https://api.stepfun.com/v1` |
| `STEPFUN_MODEL` | 默认 `step-2-16k` |

## 仓库地图

| 路径 | 作用 |
|------|------|
| [`src/app`](src/app) | Next.js UI + `POST /api/generate` |
| [`demo/`](demo/) | 固化样例输入 + 引用切片清单 |
| [`知识库/PIPL/`](知识库/PIPL/) | 条文/专题/比较（生成 grounding 资产） |
| [`知识库/PIPL/比较/EU-要点卡.md`](知识库/PIPL/比较/EU-要点卡.md) | EU 对照短卡 |

## Agent

- `AGENTS.md` · `CONTEXT.md`
- 投递材料：`docs/bytedance/`

## Disclaimer

辅助产品经理起草，**不构成法律意见**。
