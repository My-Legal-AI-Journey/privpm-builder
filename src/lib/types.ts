export type Jurisdiction = "CN" | "EU" | "CN+EU";

export type RiskControl = {
  title: string;
  explain: string;
  pmAction: string;
  refHint?: string;
};

export type Citation = {
  path: string;
  note?: string;
  /** Relative slug under /kb/... e.g. 条文/第24条-自动化决策 */
  slug?: string;
};

export type PrivPMOutput = {
  clarifyingQuestions: string[];
  riskControls: RiskControl[];
  userStories: { story: string; acceptance: string[] }[];
  promptTemplate: string;
  stageSummary: string[];
  citations: Citation[];
  meta: {
    mode: "fixture" | "stepfun";
    disclaimer: string;
  };
};

export type GenerateInput = {
  /** Raw product brief (single textarea). */
  brief: string;
  jurisdiction: Jurisdiction;
};
