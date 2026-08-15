# StepFun Builder — 申请表可粘贴答案

提交页：https://platform.stepfun.com/builder-program  
仓库：https://github.com/My-Legal-AI-Journey/privpm-builder  
Demo：https://my-legal-ai-journey.github.io/privpm-builder/

> 带【待填】的项请提交前自行补齐，勿编造。

---

## 介绍你的项目

PrivPM 是面向隐私合规产品经理的 AI 工作流助手。输入功能描述、数据用途与法域（默认中国个保法），一次生成五段可进评审的材料：澄清问题、风险控制点、用户故事与验收标准、可复用 Prompt 模板、阶段小结，并附知识库树路径引用。它不替代法务意见，而是压缩「法规/业务要求 → 可评审文档」的起草时间。技术上为 Next.js Web Demo，可接 StepFun Chat Completions；已固化个性化推荐与跨境 SCC 两个演示场景，并沉淀 PIPL 条文/专题知识库作 grounding。本作品同时服务 StepFun Builder 实践与字节跳动隐私与数据保护办公室 AI Builder 实习投递。

---

## 姓名

【待填】

## 邮箱

【待填】

## 联系方式（手机号或微信号）

【待填】

## 组织 / 团队名称

Individual

## 阶跃星辰开放平台 UID

【待填】（若暂无：先在 https://platform.stepfun.com 注册并获取）

## 项目 / 产品名称

PrivPM — 隐私合规 PM AI 工作流助手

## 使用的 STEPFUN 模型

step-2-16k

（若开放平台账号实际开通的模型名不同，改为账号中可用的 Chat 模型 ID。）

## 过去 30 天模型用量

【待填·如实】  
若几乎尚未调用，可写：近 0（刚接入 Builder / 本地演示以 fixture 为主，获额度后将切换 StepFun API 端到端生成）。

## 希望解决的问题或达成的效果

隐私与数据保护场景里，产品经理需要把法规与业务要求快速翻译成可评审的用户故事、验收标准和可复用的 Prompt 模板，但人工起草慢、提问质量不稳定，导致 AI 产出难以直接进入评审。

PrivPM 做轻量 Web Demo：引导输入「功能 + 数据用途 + 法域」，一次生成「澄清问题、风险控制点、用户故事与验收标准、Prompt 模板、阶段小结」，并给出个保法知识库树路径引用，帮助合规 PM / AI Builder 缩短从需求到可评审材料的时间。

本项目同时作为本人申请字节跳动「隐私与数据保护办公室 · AI Builder 产品实习」（职位 A18352）的作品证据：证明能用 AI Coding 交付可演示的合规向产品工具，而非停留在概念讨论。

## 想在什么地方用到 STEPFUN 模型

1. 核心生成：将结构化表单输入转为 JSON/Markdown 五段合规 PM 工作流产物；  
2. 模板沉淀：基于同一次生成产出可复制的 Prompt 模板；  
3. 迭代：根据用户补充的评审意见做增量改写。  

优先使用 Builder Program 提供的 API 额度，在本地与公网 Demo 完成端到端调用（当前公网 Demo 无 Key 时回退样例包 fixture，接上 `STEPFUN_API_KEY` 即可走真实模型）。

## 目前进展

- 已交付可点开 Demo（GitHub Pages）与公开仓库；本地 `npm run dev` 亦可演示。  
- 表单 → 五段输出（澄清 / 风险 / 故事验收 / Prompt / 小结 / 知识库引用）MVP 已完成。  
- 固化样例：个性化推荐 Feed（个保法第 24 条轴）、客服数据出境 SCC（第 38/39 条轴）。  
- 沉淀 PIPL Markdown 知识库（条文 + 专题 + 中美欧比较 + EU 要点卡）作 grounding / 面试可指认资产。  
- 另有可演示 Legal Tech 作品 Vela（vela-legal.com）与交大智慧司法实验室业务系统经验。  
- 非目标：不替代法务意见；不重建 Vela；不做百科全书式入库。

## GITHUB / DEMO / 仓库 / 链接

- GitHub：https://github.com/My-Legal-AI-Journey/privpm-builder  
- Demo：https://my-legal-ai-journey.github.io/privpm-builder/  
- 申请文案：仓库内 `docs/stepfun-application.draft.md`

## 其他想告诉我们的

申请人背景：理工 + 知识产权 + AI 治理与法律微专业 + 智慧司法实验室法律知识工程师；职业方向为法律 AI / 数据合规与 tech counsel。希望用 StepFun 把「隐私合规 PM 赋能」做成可验证的小作品，并向官方反馈真实合规文档生成场景中的模型表现（结构化 JSON、引用纪律、拒绝对外冒充法律意见等）。
