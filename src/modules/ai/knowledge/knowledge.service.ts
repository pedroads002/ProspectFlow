import "server-only";
import fs from "node:fs";
import path from "node:path";

/**
 * Reads the sales-methodology knowledge base (`core-rules.md` + `playbook.md`,
 * this folder) and assembles, per AI task, only the fragments relevant to it —
 * never the whole playbook at once (ARCHITECTURE.md §4, DECISIONS.md "Why the
 * Sales Playbook Is File-Based, Not a Database Entity").
 *
 * Files are read once per serverless instance: the `fs.readFileSync` calls
 * below run at module load, and ES module imports are cached by Node — no
 * extra memoization needed at this scale (a handful of tenants, a few KB of
 * markdown).
 */

const KNOWLEDGE_DIR = path.join(process.cwd(), "src/modules/ai/knowledge");

function readKnowledgeFile(fileName: string): string {
  const raw = fs.readFileSync(path.join(KNOWLEDGE_DIR, fileName), "utf-8");
  // Strip HTML comments (editorial notes for whoever maintains the file) —
  // these must never reach the model as if they were playbook content.
  return raw.replace(/<!--[\s\S]*?-->/g, "").trim();
}

const coreRules = readKnowledgeFile("core-rules.md").replace(/^#.*$/m, "").trim();
const playbookRaw = readKnowledgeFile("playbook.md");

export type PlaybookStage =
  | "ABERTURA"
  | "DIAGNOSTICO"
  | "QUEBRA_OBJECOES"
  | "TRANSICAO"
  | "PITCH"
  | "CONVITE_REUNIAO"
  | "FOLLOW_UP";

/** Contract with the "## " headings in playbook.md — see the comment at the top of that file. */
const HEADING_TO_STAGE: Record<string, PlaybookStage> = {
  Abertura: "ABERTURA",
  Diagnóstico: "DIAGNOSTICO",
  "Quebra de Objeções": "QUEBRA_OBJECOES",
  Transição: "TRANSICAO",
  Pitch: "PITCH",
  "Convite para Reunião": "CONVITE_REUNIAO",
  "Follow-up": "FOLLOW_UP",
};

function parsePlaybookSections(raw: string): Partial<Record<PlaybookStage, string>> {
  const sections: Partial<Record<PlaybookStage, string>> = {};

  for (const chunk of raw.split(/\n(?=## )/)) {
    const match = chunk.match(/^## (.+)\n?([\s\S]*)$/);
    if (!match) continue;

    const stage = HEADING_TO_STAGE[match[1].trim()];
    const body = match[2].trim();
    if (stage && body) {
      sections[stage] = body;
    }
  }

  return sections;
}

const playbookSections = parsePlaybookSections(playbookRaw);

/**
 * Assembles the knowledge block for one AI task: core rules (always, in
 * full — kept short by convention in core-rules.md) plus only the playbook
 * stages relevant to that task. Empty/unfilled sections are skipped rather
 * than sent as empty placeholders, so an unfilled knowledge base is a no-op,
 * not a degraded prompt.
 */
function getPlaybookContext(stages: PlaybookStage[]): string {
  const sections = stages
    .map((stage) => playbookSections[stage])
    .filter((section): section is string => Boolean(section));

  if (coreRules.length === 0 && sections.length === 0) return "";

  return [
    coreRules && `Regras permanentes do método comercial:\n${coreRules}`,
    ...sections,
  ]
    .filter(Boolean)
    .join("\n\n---\n\n");
}

/** FR-2.1: drafting the first-contact message — the only moment "Abertura" applies. */
export function getFirstContactPlaybookContext(): string {
  return getPlaybookContext(["ABERTURA"]);
}

/** Follow-ups continue an existing conversation — draws on follow-up cadence and diagnosis guidance. */
export function getFollowUpPlaybookContext(): string {
  return getPlaybookContext(["FOLLOW_UP", "DIAGNOSTICO"]);
}

/** FR-5.1: proposal drafting happens at the pitch/transition/meeting-invite stages of the method. */
export function getProposalPlaybookContext(): string {
  return getPlaybookContext(["PITCH", "TRANSICAO", "CONVITE_REUNIAO"]);
}

/**
 * FR-4.2's analysis task can recommend anything from "keep talking" to "send a
 * proposal" — the relevant stages narrow by the Lead's current status, the
 * same rule-based-not-AI philosophy already used for Momentum
 * (DECISIONS.md "Why Momentum Is Rule-Based"), so retrieval stays cheap,
 * instant, and explainable.
 */
const ANALYSIS_STAGES_BY_STATUS: Record<string, PlaybookStage[]> = {
  REPLIED: ["DIAGNOSTICO", "QUEBRA_OBJECOES"],
  QUALIFIED: ["QUEBRA_OBJECOES", "TRANSICAO", "PITCH", "CONVITE_REUNIAO"],
  PROPOSAL_SENT: ["QUEBRA_OBJECOES", "TRANSICAO", "CONVITE_REUNIAO", "FOLLOW_UP"],
  NEGOTIATION: ["QUEBRA_OBJECOES", "TRANSICAO", "CONVITE_REUNIAO", "FOLLOW_UP"],
};
const DEFAULT_ANALYSIS_STAGES: PlaybookStage[] = ["DIAGNOSTICO", "FOLLOW_UP"];

export function getAnalysisPlaybookContext(leadStatus: string): string {
  return getPlaybookContext(ANALYSIS_STAGES_BY_STATUS[leadStatus] ?? DEFAULT_ANALYSIS_STAGES);
}
