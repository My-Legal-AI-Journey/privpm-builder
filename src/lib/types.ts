export type Jurisdiction = "CN" | "EU" | "CN+EU";

export type PrivPMOutput = {
  clarifyingQuestions: string[];
  riskControls: string[];
  userStories: { story: string; acceptance: string[] }[];
  promptTemplate: string;
  stageSummary: string;
  citations: { path: string; note?: string }[];
  meta: {
    mode: "fixture" | "stepfun";
    disclaimer: string;
  };
};

export type GenerateInput = {
  feature: string;
  purpose: string;
  jurisdiction: Jurisdiction;
  knownIssues?: string;
};
