/**
 * Everything the reel says. Copy comes from the live portfolio
 * (github.com/AndresO7/Portafolio) so the facts stay the same across both.
 */

export const profile = {
  name: "Andres Ortiz",
  first: "ANDRES",
  last: "ORTIZ",
  role: "Software Engineer",
  focus: "AI systems · software & cloud architecture",
  statement:
    "I build systems at the intersection of software architecture, cloud infrastructure and artificial intelligence — and investigate what comes next.",
  base: "Quito, Ecuador",
  timezone: "UTC−5",
  languages: "Spanish · English",
  email: "andres.ortiz.h.2001@gmail.com",
  github: "https://github.com/AndresO7",
  githubHandle: "AndresO7",
} as const;

export const credentials = [
  { label: "AWS Solutions Architect", note: "Amazon Web Services", kind: "Certified" },
  { label: "Claude Code", note: "Agentic development", kind: "Certified" },
  { label: "GitHub Campus Expert", note: "GitHub Education · 2023", kind: "Program" },
] as const;

/** The reel is cut into scenes; the HUD reads these to label where you are. */
export const scenes = [
  { id: "title", label: "Title" },
  { id: "manifesto", label: "Kinetic type" },
  { id: "record", label: "The record" },
  { id: "profile", label: "Profile" },
  { id: "work", label: "Selected work" },
  { id: "method", label: "Method" },
  { id: "context", label: "Context" },
  { id: "lab", label: "Lab" },
  { id: "lineage", label: "Lineage" },
  { id: "harness", label: "Harness" },
  { id: "handshake", label: "Handshake" },
] as const;

export type SceneId = (typeof scenes)[number]["id"];

export const records = [
  {
    value: 363,
    unit: "",
    fact: "unit tests guarding a world that is generated, not authored",
    source: "NOCLIP · tests/unit",
    asOf: "2026-09-25",
  },
  {
    value: 57,
    unit: "",
    fact: "tests written first and green in conduit, the Rust data plane, when Phase 0 closed",
    source: "Quipu · docs/MASTER-PLAN.md §13",
    asOf: "2026-07-26",
  },
  {
    value: 300,
    unit: "B",
    fact: "of JSON store an entire saved 3D model — because the model was never a file",
    source: "sovran-cost-calculator · specs",
    asOf: "2026-08-22",
  },
  {
    value: 9,
    unit: "",
    fact: "contracts fixed between components before the code that implements them",
    source: "Quipu · docs/MASTER-PLAN.md §6.2",
    asOf: "2026-07-25",
  },
  {
    value: 18,
    unit: "%",
    fact: "of one CPU core: the worst-case procedural audio scene, measured offline",
    source: "NOCLIP · docs/NOTES.md",
    asOf: "2026-09-22",
  },
] as const;

export type ArtifactKind = "quipu" | "noclip" | "sovran" | "quasar" | "funcode" | "lending";

export interface Project {
  id: ArtifactKind;
  name: string;
  tagline: string;
  year: string;
  context: string;
  state: string;
  stack: string[];
  link?: { href: string; label: string };
  problem: string;
  architecture: string;
  result: string;
  learning: string;
  figure: string;
}

export const projects: Project[] = [
  {
    id: "quipu",
    name: "Quipu",
    tagline: "Enterprise AI asset gateway",
    year: "2026",
    context: "Own product · in progress",
    state: "Phase 0 complete · Phases 1–8 designed",
    stack: ["Rust", "Tokio · Axum", "Python · FastAPI", "Next.js", "Postgres + pgvector", "Keycloak", "AWS · Terraform"],
    link: { href: "https://github.com/AndresO7/Quipu", label: "github.com/AndresO7/Quipu" },
    problem:
      "MCP gateways centralize tools but flood the harness’s context: too many tools, verbose schemas, giant results, flows that need many skills.",
    architecture:
      "A Rust data plane is the only MCP ingress and only enforces; a Python optimizer compiles per-identity context bundles; a control plane on Postgres + pgvector owns policy and audit. Nine contracts fix the seams.",
    result: "57 tests written first and green, an end-to-end harness with 24 asserts and a negative control that must fail.",
    learning: "Put the invariant in one place.",
    figure: "Knotted cords — one per contract",
  },
  {
    id: "noclip",
    name: "NOCLIP",
    tagline: "Found-footage liminal horror for the browser",
    year: "2026",
    context: "Personal · private repository",
    state: "6 levels built · verification passes ongoing",
    stack: ["TypeScript", "Three.js", "Web Audio", "Vite", "Vitest", "Playwright", "Blender (scripted)"],
    problem:
      "Make a place feel wrong without authoring it: everything seen and heard is generated at runtime from a seed, and the same seed must always produce the same world.",
    architecture:
      "Seeded RNG streams → a pure-data layout → chunk streaming with baked light → a VHS post pipeline. A tension director gates entities and drives HRTF audio with procedural reverb per room.",
    result: "363 unit tests; Playwright routes with fixed seeds, screenshots and FPS logs.",
    learning: "Measure the thing you think you built.",
    figure: "An infinite hall — one seed, same building",
  },
  {
    id: "sovran",
    name: "Sovran",
    tagline: "3D configurator for a luxury architecture studio in London",
    year: "2026",
    context: "Client work",
    state: "Delivered · auth + saved models added Aug 2026",
    stack: ["Next.js 16", "React Three Fiber", "GSAP", "Supabase", "Postgres · RLS", "Vitest", "Zod"],
    link: { href: "https://github.com/AndresO7/sovran-cost-calculator", label: "github.com/AndresO7/sovran-cost-calculator" },
    problem:
      "Let homeowners configure a rear extension and a loft conversion in 3D and see a live price range that follows the studio’s own pricing guide — zone by zone.",
    architecture:
      "Reducer state (about twenty scalars) drives both a pure calculatePrice() and procedural R3F models. Supabase for auth, jsonb storage behind row-level security and thumbnails.",
    result: "A saved design costs ~300 bytes. 50 tests pin the pricing guide, the zones and persistence.",
    learning: "Generative artifacts store their parameters, not their output.",
    figure: "House, extension, loft — twenty scalars",
  },
  {
    id: "quasar",
    name: "Quasar",
    tagline: "A conversational DevOps agent that writes Terraform",
    year: "2024",
    context: "Research prototype",
    state: "2024 prototype",
    stack: ["Python", "LangChain", "Ollama · Llama 3 8B", "Terraform", "AWS", "Next.js"],
    link: { href: "https://github.com/AndresO7/Quasar", label: "github.com/AndresO7/Quasar" },
    problem: "People without DevOps experience need cloud infrastructure, and can’t write Terraform.",
    architecture:
      "A chat loop around a local Llama 3 8B: it interviews the user, emits Terraform for AWS, reads apply errors, repairs the code until it succeeds, then explains what it built and its hourly cost.",
    result: "The full loop — interview, generate, apply, repair, explain — and a 2024 paper on generative AI for DevOps.",
    learning: "Errors are observations.",
    figure: "terraform apply — fail, observe, repair",
  },
  {
    id: "funcode",
    name: "FunCode",
    tagline: "From a sketch to a working prototype",
    year: "2023–24",
    context: "Research prototype",
    state: "2023–24 prototype",
    stack: ["Next.js", "tldraw", "GPT-4 Vision", "Tailwind"],
    link: { href: "https://github.com/AndresO7/FunCodeGenerator", label: "github.com/AndresO7/FunCodeGenerator" },
    problem: "Turning a rough wireframe into a working prototype is slow, and the sketch already says most of what the code should do.",
    architecture:
      "A tldraw canvas; the selection is rendered to an image with its text and sent to GPT-4 Vision; a single-file HTML prototype comes back onto the canvas to annotate and iterate.",
    result: "The accepted 2023 paper on generating code from visual interfaces with LLMs.",
    learning: "The sketch becomes the specification.",
    figure: "Wireframe → layers → interface",
  },
  {
    id: "lending",
    name: "Lending",
    tagline: "A library system decomposed into services",
    year: "2024",
    context: "University project",
    state: "2024 coursework",
    stack: ["Java 17", "Microservices", "API gateway", "Docker Compose"],
    link: { href: "https://github.com/AndresO7/Proyecto_distribuidas_jar", label: "github.com/AndresO7/Proyecto_distribuidas_jar" },
    problem: "A monolithic lending system mixes users, loans, payments and inventory in one deployable.",
    architecture:
      "An API gateway in front of six JVM services — users, loans, payments, notifications, books, inventory — on a shared Docker bridge network.",
    result: "Seven containers composed into one system.",
    learning: "Boundaries are a design decision before they’re an infrastructure one.",
    figure: "One gateway, six domains",
  },
];

export const alsoBuilt = [
  { name: "KODA", note: "Multi-agent orchestration for DevOps workflows", stack: "LangGraph · A2A · MCP" },
  { name: "Cloud Bot", note: "Natural-language automation of AWS deployments", stack: "Go · Kafka" },
  { name: "Pico y Placa", note: "Quito’s driving-restriction rules as a tested library", stack: "TypeScript · Jest" },
  { name: "PetShop", note: "Technical test on the PetStore API", stack: "Next.js 15 · React 19 · Zustand" },
  { name: "Landing pages", note: "Including ISCD, a security company", stack: "Next.js" },
];

export const methodSteps = [
  {
    question: "Why does it break?",
    principle: "Name the real constraint before choosing a stack.",
    body: "Quipu didn’t start with Rust. It started with a diagnosis: harnesses run out of context in four distinct ways. Each got its own defence, and the architecture followed from the defences.",
    quote: "Governance is context optimization.",
    original: "La gobernanza ES la optimización de contexto.",
    code: "visible_tools = policy(role, workspace, assets)",
    source: "Quipu · docs/architecture.md",
  },
  {
    question: "How do the parts meet?",
    principle: "Fix the contracts before the code.",
    body: "Nine contracts define how the gateway, optimizer, control plane and agents talk — before most of them exist. The seams are agreed first, so the parts can be built in parallel, by people or by agents.",
    quote: "Contracts are stable: changing one is a breaking change.",
    original: "Contratos (estables — cambiarlos es un breaking change).",
    source: "Quipu · MASTER-PLAN §6.2",
  },
  {
    question: "What is already decided?",
    principle: "Write decisions down, with the reason and the owner.",
    body: "Some choices are closed on purpose. Writing them down stops them from being re-litigated in every session — including sessions with AI agents that weren’t there when they were made.",
    quote: "Fixed decisions — don’t re-litigate without the owner.",
    original: "Decisiones fijadas (no re-litigar sin el usuario).",
    source: "Quipu · MASTER-PLAN §4",
  },
  {
    question: "Where does it fail?",
    principle: "Make the test able to fail.",
    body: "The end-to-end harness ships with a negative control: run it with the wrong allow-list and it has to go red. If it stays green, the harness is what’s broken.",
    quote: "A harness you have only ever seen pass has proven nothing.",
    original: "Un harness que solo se ha visto pasar no ha demostrado nada.",
    code: "CURATED=add,get_time,echo bash dev/smoke-e2e.sh   # must FAIL",
    source: "Quipu · dev/README.md",
  },
  {
    question: "What is actually proven?",
    principle: "State the honest limit.",
    body: "Deployment artifacts that were never executed are marked as verified by inspection only. Targets a phase can’t meet by construction are exempted — and the plan names the mechanism that will.",
    quote: "Verified only by inspection: they do not count as tested.",
    original: "Verificados solo por inspección: no cuentan como probados.",
    source: "Quipu · MASTER-PLAN §13",
  },
];

/** One agent task, run twice: tools straight into the harness vs through the gateway. */
export const WINDOW = 200_000;
export const contextTask = "Why did last night’s deploy fail? Open an issue with the root cause.";
export const contextSteps = [
  { title: "Assemble the context", direct: 101_200, firewall: 4_700, note: "96 tools with full schemas + 6 skills loaded in full — vs the 9 tools this role may use, as short signatures." },
  { title: "Reason", direct: 600, firewall: 600, note: "The model decides it needs the CI logs for run 8812." },
  { title: "Call a tool", direct: 150, firewall: 850, note: "ci.get_run_logs(run: 8812) — through the gateway, the full schema is disclosed on first use." },
  { title: "Observe", direct: 72_000, firewall: 1_200, note: "All 72k tokens of log enter the context — vs the failing stage and its error, plus a handle to the full log." },
  { title: "Reason again", direct: 700, firewall: 700, note: "A migration timed out. The model searches the code for it." },
  { title: "Observe", direct: 31_000, firewall: 1_600, note: "40 matches in full — vs top matches with file:line references. The direct window overflows; the harness compacts." },
  { title: "Ask before writing", direct: 400, firewall: 400, note: "issues.create is a write: through the gateway it waits for a human to approve it." },
  { title: "Answer", direct: 900, firewall: 900, note: "An issue is opened — one written from a context that lost the early log lines to compaction." },
];

export const experiments = [
  {
    id: "EXP-01",
    title: "Remembering the real world wrong",
    project: "NOCLIP",
    date: "2026-09-22",
    status: "concluded",
    question: "Can a procedurally generated building feel wrong — instead of just random, or just decayed?",
    hypothesis: "Wrongness is semantic. Noise reads as decay; a correct memory of a place with a few precise errors reads as dread.",
    result:
      "Twelve memory errors — a clock without hands, an EXIT sign on a blank wall, carpet climbing the wall — at most three per chunk. A reachability test guarantees no error ever blocks the route.",
  },
  {
    id: "EXP-02",
    title: "Measuring a sound instead of trusting it",
    project: "NOCLIP",
    date: "2026-09",
    status: "concluded",
    question: "Does a procedurally generated reverb actually sound like the room it claims to be?",
    hypothesis: "If each room’s impulse response is generated per material, its RT60 per band should measure within spec.",
    result:
      "“Dark” materials measured bright. The tail is now three independent noise bands through Linkwitz–Riley filters, and per-band RT60 measures within a few percent of spec.",
  },
  {
    id: "EXP-03",
    title: "A latency target that was impossible by construction",
    project: "Quipu",
    date: "2026-07-25",
    status: "concluded",
    question: "Should the Phase 0 walking skeleton already meet the data plane’s latency SLOs?",
    hypothesis: "A skeleton should be held to the final targets from day one, so regressions are caught early.",
    result:
      "A p50 ≤ 1 ms budget containing a network call is impossible arithmetic. Phase 0 is exempt from two SLO rows, and the plan names the snapshot that restores them.",
  },
  {
    id: "EXP-04",
    title: "The model is not a file",
    project: "Sovran",
    date: "2026-08-22",
    status: "concluded",
    question: "How should a client’s 3D house configuration be saved?",
    hypothesis: "The obvious design: export the model — geometry, textures — and store the file.",
    result:
      "All geometry is procedural. A saved model is ~300 bytes of JSON, validated on read; the price is recomputed, never trusted from storage.",
  },
  {
    id: "EXP-05",
    title: "Projection versus search",
    project: "Quipu",
    date: "2026-07",
    status: "open",
    question: "Is a deterministic, identity-projected tool surface better than letting the agent search for tools?",
    hypothesis: "Yes: a surface computed from identity costs fewer tokens and fails less than a search the agent has to drive.",
    result: "Pending — the Context Ledger (Phase 3) will count tokens saved per day, team and asset.",
  },
] as const;

export const archive = [
  { year: "2024", title: "Generative AI: a new frontier in DevOps automation", kind: "Published research · ESPE" },
  { year: "2023", title: "Generating code from visual interfaces with LLMs", kind: "Accepted paper" },
  { year: "—", title: "CAG Engine — cache-augmented generation to spend fewer tokens", kind: "Research prototype" },
];

export const lineage = [
  {
    year: "2023",
    title: "The model writes code",
    body: "FunCodeGenerator: sketch a wireframe, and a vision model returns a working prototype you can annotate and iterate.",
  },
  {
    year: "2024",
    title: "The model operates infrastructure",
    body: "Quasar: a local Llama 3 8B writes Terraform for AWS, treats apply errors as observations and loops until it works.",
  },
  {
    year: "THEN",
    title: "Agents coordinate",
    body: "KODA: multi-agent DevOps workflows with LangGraph, A2A and MCP — and research on cache-augmented generation.",
  },
  {
    year: "2026",
    title: "Context becomes the resource",
    body: "Quipu: the gateway that decides what a harness gets to see — governance and context optimization as one mechanism.",
  },
  {
    year: "2026",
    title: "Agents become a workforce",
    body: "NOCLIP: a game built by parallel agent workstreams under contracts, verifiers and independent research passes.",
  },
];

export const practices = [
  { title: "Spec before code", body: "Brainstorm → an approved spec → a phase plan of bite-sized TDD tasks. The plan is the entry point for any new session, human or agent." },
  { title: "One fresh agent per task", body: "Each task goes to a new subagent with only its packet, then a two-stage review before the next one starts." },
  { title: "Verification before completion", body: "“Done” means the commands ran and the evidence is shown — tests, lint, the deliverable actually running. Never a claim." },
  { title: "Agents need eyes", body: "Playwright with fixed seeds and scripted routes: screenshots, FPS logs and a debug hook let agents verify what they built." },
  { title: "Two agents, one question", body: "For open design problems, independent research passes from different agents against the same build — then a synthesis into contracts." },
  { title: "Memory is a file", body: "Lessons go into NOTES.md — one per entry, updated instead of duplicated — and CLAUDE.md / AGENTS.md live in every repository." },
];

const W = 63;
const center = (text: string, width: number) => {
  const left = Math.floor((width - text.length) / 2);
  return " ".repeat(Math.max(left, 0)) + text + " ".repeat(Math.max(width - text.length - left, 0));
};
const full = (t: string) => `|${center(t, W)}|`;
const half = (a: string, b: string) => `|${center(a, 31)}|${center(b, 31)}|`;
const ruleFull = `+${"-".repeat(W)}+`;
const ruleHalf = `+${"-".repeat(31)}+${"-".repeat(31)}+`;

/** Task packet, drawn the way RFCs draw packet headers. */
export const packet = [
  " 0                   1                   2                   3",
  " 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1",
  "+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+",
  full("OBJECTIVE"),
  ruleFull,
  full("FILES TO CREATE / TOUCH"),
  ruleHalf,
  half("CONTRACTS CONSUMED", "CONTRACTS PRODUCED"),
  ruleHalf,
  full("TDD: test first · watch it fail · minimal code · green"),
  ruleHalf,
  half("VERIFICATION COMMAND", "ACCEPTANCE CRITERIA"),
  ruleHalf,
].join("\n");

export const offers = [
  {
    title: "AI systems that survive production",
    body: "Agents, MCP servers and gateways, tool governance, context budgets, evaluation that can fail — designed as systems, not demos.",
  },
  {
    title: "Cloud architecture on AWS",
    body: "Event-driven and serverless, containers on ECS or EKS, the right store for each access pattern — with the trade-offs written down.",
  },
  {
    title: "From ambiguity to a phased plan",
    body: "Contracts, SLOs, decision records, honest limits and a verification path — and then building it, phase by phase.",
  },
  {
    title: "Harnesses for AI-assisted engineering",
    body: "Skills, subagent workflows, verifiers and memory, so what agents produce is something your team can review and trust.",
  },
];
