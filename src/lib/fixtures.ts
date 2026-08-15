import type { Citation, GenerateInput, PrivPMOutput } from "./types";
import { normalizeInputBrief } from "./normalize";

const DISCLAIMER =
  "辅助隐私合规 PM 起草，不构成法律意见；涉及跨境、未成年人、敏感信息等请法务确认后再定稿。";

const feedCitations: Citation[] = [
  { path: "《个保法》注释 → 第24条“自动化决策”", slug: "条文/第24条-自动化决策", note: "个性化推送与拒绝权" },
  { path: "《个保法》注释 → 专题“个性化推荐”", slug: "专题/个性化推荐" },
  { path: "《个保法》注释 → 专题“人工智能与算法治理”", slug: "专题/人工智能与算法治理" },
  { path: "《个保法》注释 → 专题“算法推荐与自动化决策的关系”", slug: "专题/算法推荐与自动化决策的关系" },
  { path: "《个保法》注释 → 专题“实务中的知情-同意操作”", slug: "专题/实务中的知情-同意操作" },
  { path: "《个保法》注释 → 第31条“未成年人同意”", slug: "条文/第31条-未成年人同意" },
  { path: "《个保法》注释 → 第6条“目的限制与最小化”", slug: "条文/第6条-目的限制与最小化" },
  { path: "《个保法》注释 → 专题“隐私政策设计”", slug: "专题/隐私政策设计" },
];

const sccCitations: Citation[] = [
  { path: "《个保法》注释 → 第38条“跨境条件”", slug: "条文/第38条-跨境条件" },
  { path: "《个保法》注释 → 第39条“出境告知与单独同意”", slug: "条文/第39条-出境告知与单独同意" },
  { path: "《个保法》注释 → 专题“数据出境标准合同”", slug: "专题/数据出境标准合同" },
  { path: "《个保法》注释 → 专题“数据出境安全评估”", slug: "专题/数据出境安全评估" },
  { path: "《个保法》注释 → 专题“个人信息出境认证”", slug: "专题/个人信息出境认证" },
  { path: "《个保法》注释 → 专题“实务中的知情-同意操作”", slug: "专题/实务中的知情-同意操作" },
  { path: "《个保法》注释 → 第55条“影响评估触发”", slug: "条文/第55条-影响评估触发" },
  { path: "《个保法》注释 → 第13条“合法性基础”", slug: "条文/第13条-合法性基础" },
];

function euExtras(j: GenerateInput["jurisdiction"]): Citation[] {
  if (j === "CN") return [];
  return [
    { path: "比较库 → EU 要点卡", slug: "比较/EU-要点卡", note: "法域含 EU 时对照，需法务确认" },
    { path: "比较库 → 03-合法性基础", slug: "比较/03-合法性基础" },
    { path: "比较库 → 04-个人信息的跨境提供", slug: "比较/04-个人信息的跨境提供" },
  ];
}

export function detectFixtureId(input: GenerateInput): "feed" | "scc" | "generic" {
  const blob = input.brief;
  if (/推荐|个性化|Feed|feed|算法|自动化决策/.test(blob)) return "feed";
  if (/出境|跨境|境外|SCC|标准合同|新加坡|客服中台/.test(blob)) return "scc";
  return "generic";
}

export function buildFixtureOutput(raw: GenerateInput): PrivPMOutput {
  const input: GenerateInput = {
    brief: normalizeInputBrief(raw.brief),
    jurisdiction: raw.jurisdiction,
  };
  const id = detectFixtureId(input);
  if (id === "feed") return feedFixture(input);
  if (id === "scc") return sccFixture(input);
  return genericFixture(input);
}

function feedFixture(input: GenerateInput): PrivPMOutput {
  return {
    clarifyingQuestions: [
      "浏览和点击数据里，哪些是“打开 App 就要用”的，哪些只是为了个性化推荐？清单有没有拆开？",
      "用户关掉个性化之后，还会不会继续记日志？如果会，是为了安全/防作弊吗？保留多久、会不会去掉可识别信息？",
      "有没有可能碰到不满十四岁的用户？年龄门槛和家长同意流程有没有写进需求？",
      "推荐结果会不会影响价格、限购、信用之类“对用户很要紧”的决定？用户怎么要求解释或关掉？",
      input.jurisdiction !== "CN"
        ? "如果还要上欧盟，同意话术和国内设置页怎么对齐？有没有预留法域开关？"
        : "后面如果要上欧盟，现在的设置和隐私政策结构能不能加开关，而不用推倒重做？",
    ],
    riskControls: [
      {
        title: "个性化关不掉，或关了还在“偷偷”用行为数据",
        explain:
          "如果产品用浏览/点击做推荐，却没有明显入口让用户关掉“针对个人特征”的推送，评审时很容易被卡住。对 PM 来说，这不是抽象规则，而是：设置里有没有一键关闭、关闭后 Feed 是否变成“非个性化”、关闭后多久真正停用画像特征。",
        pmAction: "在 PRD 写清：关闭入口路径（≤3 步）、关闭后的内容形态、关闭后停止用哪些字段、仍保留的安全日志怎么说明。",
        refHint: "对应个保法里自动化决策/推送选项相关要求，细节看法务；产品侧先把验收写死。",
      },
      {
        title: "“必要功能”和“个性化”混在一张表里",
        explain:
          "如果字段表不分“打开 App 必需”和“可关的推荐”，后面隐私政策、设置文案、研发埋点会对不齐，法务一问就返工。",
        pmAction: "拉一张两列表：必要 vs 个性化；每列写用途、保留期、能否关闭。评审会当作准入材料。",
        refHint: "目的限制与最小化：只处理完成目的所必需的数据。",
      },
      {
        title: "可能碰到未成年人却没有门槛",
        explain:
          "个性化场景若可能触达儿童账号，没有年龄判断或家长同意，上线风险高，也难写清验收。",
        pmAction: "明确：是否做年龄门；未通过时是否禁止个性化；文案与客服话术谁写。",
        refHint: "未成年人相关规则需法务确认；PM 先把触发条件写进故事。",
      },
      {
        title: "敏感信息或对外同步和个性化绑在同一个勾选里",
        explain:
          "如果把“同意推荐”和“同意把数据给别人/出境”捆成一个勾选，用户和评审都会觉得不清晰，也难做分项验收。",
        pmAction: "检查设置与注册流：关键开关拆开；不同意推荐时核心功能是否仍可用。",
      },
      {
        title: "文档语气像“法律结论”而不是“产品草稿”",
        explain:
          "助手输出是给评审用的草稿。若写成斩钉截铁的法律结论，反而增加法务负担。",
        pmAction: "对外材料页脚保留“需法务确认、不构成法律意见”；开放问题带 Owner。",
      },
    ],
    userStories: [
      {
        story: "作为用户，我希望在设置里一键关掉个性化推荐，只看不针对我个人特征的内容流。",
        acceptance: [
          "设置路径 ≤3 步；关闭后明确显示“非个性化”状态",
          "关闭后约定时间内停止用浏览/点击做个性化排序（安全日志另说明）",
          "设置页能深链到隐私政策对应段落",
        ],
      },
      {
        story: "作为隐私合规 PM，我希望需求里写清“可关闭个性化”的验收，方便研发和法务对齐。",
        acceptance: [
          "故事覆盖：关闭入口、字段拆分、未成年人、后续多地区预留",
          "澄清问题清单可直接贴进评审纪要",
        ],
      },
      {
        story: "作为可能的未成年用户家长，我希望触发年龄门槛时看到家长同意，而不是静默开启个性化。",
        acceptance: ["年龄或家长验证策略有文档；未通过则不启用个性化"],
      },
    ],
    promptTemplate: `你是隐私合规评审助手（只产出产品评审材料，不提供法律意见）。请根据下列需求输出：开放问题、风险说明（讲清对产品的影响）、用户故事与验收、阶段跟进点。
需求描述：
${input.brief}
法域：${input.jurisdiction}
写作要求：少用法律术语，PM 能听懂；需要专业对照时用括号短注；禁止使用「」引号，改用“”；每条重要结论标注“需法务确认”。`,
    stageSummary: [
      "上线“关闭个性化”入口，并验收关闭后的 Feed 形态。",
      "定稿必要字段 vs 个性化字段对照表。",
      "拍板未成年人/年龄门槛策略（做或不做、谁负责）。",
      `按法域 ${input.jurisdiction} 写一页合法性/设置开关备忘（需法务确认）。`,
      "跟踪指标建议：澄清轮次、法务返工次数、上线后关闭率。",
    ],
    citations: [...feedCitations, ...euExtras(input.jurisdiction)],
    meta: { mode: "fixture", disclaimer: DISCLAIMER },
  };
}

function sccFixture(input: GenerateInput): PrivPMOutput {
  return {
    clarifyingQuestions: [
      "工单里的姓名、手机号同步到新加坡，算不算“数据出境”？境外同事能不能直接登境内系统看数？",
      "三条常见路径（安全评估 / 认证 / 标准合同）打算走哪条？有没有数量或关键基础设施类门槛要先问安全？",
      "能不能证明“业务上确实需要出境”？有没有“只在境内客服处理”的降级方案？",
      "用户有没有单独、说得清的同意：谁接收、干什么用、传哪些字段？能不能只拒绝出境仍用基础服务？",
      "要不要做个人信息保护影响评估？谁写、什么时候写？",
    ],
    riskControls: [
      {
        title: "路径还没选就开通跨境同步",
        explain:
          "一旦工单 PII 到境外中台，评审会先问“走哪条合规路径”。路径未定就上线，容易变成上线阻断，而不是小优化项。",
        pmAction: "先出一页路径选型备忘：候选路径、决策人、材料清单、预计提交时间；未定路径不排生产同步。",
        refHint: "跨境条件相关条文与出境专题；具体选型需法务+安全。",
      },
      {
        title: "出境告知含糊，或和注册同意捆在一起",
        explain:
          "用户需要知道数据可能去哪、干什么。若和“同意用户协议”捆成一勾，很难验收，也难做“不同意出境”的降级。",
        pmAction: "单独设计出境告知文案与开关；写清拒绝后的产品行为（仅境内客服等）。",
      },
      {
        title: "字段“能传都传”，没有最小化",
        explain:
          "工单里可能有多余备注、内部标签。境外中台若只要联系人信息，多传会放大风险和评审成本。",
        pmAction: "列出境字段白名单；禁止字段写进接口契约；境外再转发要单独评估。",
      },
      {
        title: "标准合同/评估材料与产品排期脱节",
        explain:
          "即便选了标准合同，备案附录和产品上线日经常对不齐，最后变成“功能好了证没有”。",
        pmAction: "把材料 Owner、依赖接口、目标提交日写进里程碑；与研发排期同一张表。",
      },
    ],
    userStories: [
      {
        story: "作为用户，在数据可能出境前我应看到清楚说明，并能单独同意或拒绝。",
        acceptance: [
          "告知含接收方、目的、方式、种类、如何行使权利（产品文案级）",
          "拒绝出境时有降级方案或明确不可用的服务范围",
        ],
      },
      {
        story: "作为合规 PM，我需要路径选型与材料验收清单，方便拉法务和安全对齐。",
        acceptance: ["清单含路径决策记录、材料状态、开放问题与 Owner"],
      },
    ],
    promptTemplate: `你是隐私合规评审助手（不提供法律意见）。针对下列跨境/客服数据场景，输出：开放问题、风险说明（讲清产品影响）、验收项、阶段跟进点。
需求：
${input.brief}
法域：${input.jurisdiction}
要求：PM 能听懂；少堆法条编号；需要时括号短注；禁用「」；重要项写“需法务确认”。`,
    stageSummary: [
      "确认是否构成出境（含境外访问境内库的情形）。",
      "完成路径选型备忘并指定 Owner。",
      "起草出境单独告知/开关与降级方案。",
      "判断是否触发影响评估及排期。",
      "对齐备案/评估材料与功能上线日。",
    ],
    citations: [...sccCitations, ...euExtras(input.jurisdiction)],
    meta: { mode: "fixture", disclaimer: DISCLAIMER },
  };
}

function genericFixture(input: GenerateInput): PrivPMOutput {
  return {
    clarifyingQuestions: [
      "为什么可以处理这些数据？是用户同意、履行合同必需，还是别的依据？（需法务确认）",
      "具体有哪些字段？有没有身份证、行踪、健康等更敏感的信息？",
      "会不会给第三方、和其他团队共管，或传到境外？",
      "用户怎么查看、删除、撤回同意？客服/产品入口在哪？",
      "和未成年人或自动推荐/自动决策有没有关系？",
    ],
    riskControls: [
      {
        title: "“为什么能处理”说不清",
        explain: "依据和产品话术对不上时，隐私政策与设置会反复改，评审成本高。",
        pmAction: "用一句话写清处理依据假设，并标“待法务确认”；同步到隐私政策提纲。",
      },
      {
        title: "目的和字段对不齐",
        explain: "目的写“提升体验”，字段却很全，容易被认为过度收集。",
        pmAction: "每个字段写用途；删掉说不清用途的字段或改为可关闭。",
      },
      {
        title: "第三方或出境链路没进需求",
        explain: "SDK、客服中台、分析工具常在开发后期才暴露，导致返工。",
        pmAction: "在 PRD 列数据接收方；不确定的标红并约法务/安全。",
      },
    ],
    userStories: [
      {
        story: "作为合规 PM，我希望一次生成可评审的澄清问题与验收草稿。",
        acceptance: ["五段输出齐全", "含可点击的知识库引用", "页脚含非法律意见声明"],
      },
    ],
    promptTemplate: `需求：\n${input.brief}\n法域：${input.jurisdiction}\n请输出澄清问题、风险说明（白话）、用户故事与阶段跟进点。不构成法律意见；禁用「」。`,
    stageSummary: [
      "先写清处理依据假设与数据字段表。",
      "标出第三方/出境未知项并约评审。",
      "可加载样例 A（推荐）或样例 B（出境）获得更贴合的切片。",
    ],
    citations: [
      { path: "《个保法》注释 → 第13条“合法性基础”", slug: "条文/第13条-合法性基础" },
      { path: "《个保法》注释 → 第14条“知情同意”", slug: "条文/第14条-知情同意" },
      { path: "《个保法》注释 → 第17条“告知规则”", slug: "条文/第17条-告知规则" },
      ...euExtras(input.jurisdiction),
    ],
    meta: { mode: "fixture", disclaimer: DISCLAIMER },
  };
}
