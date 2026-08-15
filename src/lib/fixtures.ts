import type { GenerateInput, PrivPMOutput } from "./types";

const DISCLAIMER = "辅助隐私合规 PM 起草，不构成法律意见；跨境/未成年人/敏感处理等须法务确认。";

const feedCitations = [
  { path: "《个保法》注释 → 第24条「自动化决策」", note: "拒绝权与推送选项" },
  { path: "《个保法》注释 → 第24条 → 专题「个性化推荐」" },
  { path: "《个保法》注释 → 第24条 → 「人工智能与算法治理」" },
  { path: "《个保法》注释 → 第24条 → 「算法推荐与自动化决策的关系」" },
  { path: "《个保法》注释 → 第14/29条 → 「实务中的知情-同意操作」" },
  { path: "《个保法》注释 → 第31条 → 「儿童个人信息保护」" },
  { path: "《个保法》注释 → 第6条「目的限制与最小化」" },
  { path: "《个保法》注释 → 第17条 → 「隐私政策设计」" },
];

const sccCitations = [
  { path: "《个保法》注释 → 第38条「跨境条件」" },
  { path: "《个保法》注释 → 第39条「出境告知与单独同意」" },
  { path: "《个保法》注释 → 第38条 → 「数据出境标准合同」" },
  { path: "《个保法》注释 → 第38/40条 → 「数据出境安全评估」" },
  { path: "《个保法》注释 → 第38条 → 「个人信息出境认证」" },
  { path: "《个保法》注释 → 第14/29条 → 「实务中的知情-同意操作」→ 单独同意落地" },
  { path: "《个保法》注释 → 第55/56条（影响评估）" },
  { path: "《个保法》注释 → 第13条「合法性基础」" },
];

function euExtras(j: GenerateInput["jurisdiction"]): { path: string; note?: string }[] {
  if (j === "CN") return [];
  return [
    { path: "比较库 → EU 要点卡 → 合法基础 / 跨境 / DPIA", note: "法域含 EU 时对照，需法务确认" },
    { path: "比较库 → 「03-合法性基础」「04-跨境提供」" },
  ];
}

export function detectFixtureId(input: GenerateInput): "feed" | "scc" | "generic" {
  const blob = `${input.feature}${input.purpose}${input.knownIssues ?? ""}`;
  if (/推荐|个性化|Feed|feed|算法|自动化决策/.test(blob)) return "feed";
  if (/出境|跨境|境外|SCC|标准合同|新加坡|客服中台/.test(blob)) return "scc";
  return "generic";
}

export function buildFixtureOutput(input: GenerateInput): PrivPMOutput {
  const id = detectFixtureId(input);
  if (id === "feed") return feedFixture(input);
  if (id === "scc") return sccFixture(input);
  return genericFixture(input);
}

function feedFixture(input: GenerateInput): PrivPMOutput {
  return {
    clarifyingQuestions: [
      "浏览/点击行为中，哪些字段属于提供「基本功能」所必需，哪些仅服务于可关闭的个性化？",
      "关闭个性化后，是否仍保留日志用于安全/反作弊？保留期限与匿名化策略是什么？",
      "是否面向不满十四周岁用户？未成年人模式与监护人同意路径是否已定义？",
      "推荐模型是否涉及自动化决策对交易条件的差别待遇？用户如何行使说明与拒绝权？",
      input.jurisdiction !== "CN"
        ? "欧盟上线时，合法基础是同意还是正当利益？与中国「无概括合法利益项」如何对齐话术？"
        : "后续欧盟上线时，是否预留法域开关与单独的合法性基础论证？",
    ],
    riskControls: [
      "第24条：信息推送/商业营销须提供不针对个人特征的选项或便捷拒绝；重大影响决定的说明与拒绝权。",
      "最小化：默认关闭或显著入口关闭个性化；关闭后删除或匿名化定向所依据的画像特征。",
      "告知：隐私政策与设置页区分「必要」与「个性化」处理目的（第17条轴）。",
      "儿童：若可能收集不满十四周岁信息，触发监护人同意与专门规则（第31条）。",
      "单独同意：若叠加敏感信息或对外提供/出境，避免一键捆绑勾选（知情-同意实务）。",
      "输出边界：控制点需法务确认；本工具不构成法律意见。",
    ],
    userStories: [
      {
        story: "作为终端用户，我希望在设置中一键关闭个性化推荐，以便只看到不针对个人特征的内容流。",
        acceptance: [
          "设置路径 ≤3 步可达；关闭后 Feed 明确展示「非个性化」状态",
          "关闭后 24h 内停止使用浏览/点击特征做个性化排序（可保留安全日志并说明）",
          "隐私政策对应条款可从设置页深链打开",
        ],
      },
      {
        story: "作为隐私合规 PM，我希望需求文档写清「可拒绝个性化」的验收标准，以便研发与法务评审对齐。",
        acceptance: [
          "用户故事含拒绝权、最小化、儿童、跨境预留四类检查项",
          "开放问题清单可导入评审纪要",
        ],
      },
      {
        story: "作为可能的未成年用户监护人，我希望在年龄门槛触发时看到监护人同意流程，而不是静默个性化。",
        acceptance: [
          "年龄门或监护人验证策略有文档；未通过则不启用个性化",
        ],
      },
    ],
    promptTemplate: `你是隐私合规评审助手（不提供法律意见）。针对下列需求输出风险点与验收标准：
功能：${input.feature}
目的：${input.purpose}
法域：${input.jurisdiction}
已知问题：${input.knownIssues ?? "（无）"}
请覆盖：第24条拒绝权、最小化、告知、未成年人、是否出境；每条标注「需法务确认」。`,
    stageSummary: `本阶段建议跟踪：① 个性化关闭入口上线；② 必要/个性化字段表定稿；③ 未成年人策略决策；④ 法域 ${input.jurisdiction} 下合法性基础备忘。指标建议：需求澄清轮次、法务返工次数、关闭率（上线后）。`,
    citations: [...feedCitations, ...euExtras(input.jurisdiction)],
    meta: { mode: "fixture", disclaimer: DISCLAIMER },
  };
}

function sccFixture(input: GenerateInput): PrivPMOutput {
  return {
    clarifyingQuestions: [
      "该同步是否构成「向境外提供」？境外主体能否访问境内库即视为出境？",
      "三条路径（安全评估 / 认证 / 标准合同）如何选型？是否触及第40条数量或 CII 门槛？",
      "「业务需要确需」如何论证？能否境内客服闭环？",
      "单独同意字段是否覆盖接收方、目的、方式、种类？能否单独拒绝出境？",
      "是否已做/计划做个人信息保护影响评估（第55/56条）？",
    ],
    riskControls: [
      "第38条路径未定即开通同步 → 合规阻断项。",
      "第39条告知与单独同意缺失或捆绑同意。",
      "字段过度出境（最小化失败）；境外再转移未约束。",
      "标准合同备案材料与附录未齐。",
      "法域叠加 EU 用户时的 GDPR 传输工具（需法务确认）。",
    ],
    userStories: [
      {
        story: "作为用户，在数据可能出境前我应收到清晰告知并可单独同意或拒绝。",
        acceptance: [
          "告知含接收方、目的、方式、种类、行使权利方式",
          "不同意出境时有降级方案（如仅境内客服）或明确无法提供的服务范围",
        ],
      },
      {
        story: "作为合规 PM，我需要一份路径选型与备案验收清单交给法务与安全。",
        acceptance: [
          "清单含路径决策记录、SCC/评估/认证材料状态、开放问题 Owner",
        ],
      },
    ],
    promptTemplate: `请根据中国《个人信息保护法》第38–40、39、55–56条，对以下出境场景列出路径选型问题与单独同意验收项（不提供法律意见）：
${input.feature}
目的：${input.purpose}
法域：${input.jurisdiction}
已知问题：${input.knownIssues ?? "（无）"}`,
    stageSummary: `本阶段：完成出境活动认定 → 路径选型备忘 → 单独同意稿 → PIA 触发判断 → 备案/评估排期。指标：开放问题关闭数、备案提交日。`,
    citations: [...sccCitations, ...euExtras(input.jurisdiction)],
    meta: { mode: "fixture", disclaimer: DISCLAIMER },
  };
}

function genericFixture(input: GenerateInput): PrivPMOutput {
  return {
    clarifyingQuestions: [
      "处理的合法性基础是什么（同意 / 合同必要 / 法定义务等）？",
      "涉及哪些个人信息类型？是否含敏感个人信息？",
      "是否对外提供、共同处理或出境？",
      "个人如何行使查阅、删除、撤回同意等权利？",
      "未成年人或自动化决策是否相关？",
    ],
    riskControls: [
      "合法性基础与告知同意不匹配",
      "目的限制与最小化不足",
      "第三方/出境链路未评估",
      "权利响应机制缺失",
    ],
    userStories: [
      {
        story: "作为合规 PM，我希望一次生成可评审的澄清问题与验收标准草稿。",
        acceptance: ["五段输出齐全", "含知识库树路径引用", "页脚含非法律意见声明"],
      },
    ],
    promptTemplate: `功能：${input.feature}\n目的：${input.purpose}\n法域：${input.jurisdiction}\n请输出澄清问题与风险控制点（CN《个保法》框架，不构成法律意见）。`,
    stageSummary: "建议先选定合法性基础与数据地图，再拆用户故事；可加载 demo/01 或 demo/02 样例获得更贴合切片。",
    citations: [
      { path: "《个保法》注释 → 第13条「合法性基础」" },
      { path: "《个保法》注释 → 第14条「知情同意」" },
      { path: "《个保法》注释 → 第17条「告知规则」" },
      ...euExtras(input.jurisdiction),
    ],
    meta: { mode: "fixture", disclaimer: DISCLAIMER },
  };
}
