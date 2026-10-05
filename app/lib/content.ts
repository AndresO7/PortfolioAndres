/**
 * Everything the reel says, in English and Spanish. Copy comes from the live
 * portfolio (github.com/AndresO7/Portafolio) so the facts stay the same across
 * both. `es` is typed as `typeof en`, so a missing translation fails the build.
 */

export type Locale = "en" | "es";

export const identity = {
  name: "Andres Ortiz",
  first: "ANDRES",
  last: "ORTIZ",
  email: "andres.ortiz.h.2001@gmail.com",
  github: "https://github.com/AndresO7",
  githubHandle: "AndresO7",
  timezone: "UTC−5",
} as const;

/** The reel is cut into scenes; the HUD reads these to label where you are. */
export const sceneIds = [
  "title",
  "manifesto",
  "record",
  "profile",
  "work",
  "method",
  "context",
  "lab",
  "lineage",
  "harness",
  "handshake",
] as const;

export type SceneId = (typeof sceneIds)[number];

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

/** One agent task, run twice: tools straight into the harness vs through the gateway. */
export const WINDOW = 200_000;
export const contextTokens = [
  { direct: 101_200, firewall: 4_700 },
  { direct: 600, firewall: 600 },
  { direct: 150, firewall: 850 },
  { direct: 72_000, firewall: 1_200 },
  { direct: 700, firewall: 700 },
  { direct: 31_000, firewall: 1_600 },
  { direct: 400, firewall: 400 },
  { direct: 900, firewall: 900 },
];

/** Numbers are the same in every language; only the sentences around them change. */
export const recordValues = [
  { value: 363, unit: "", source: "NOCLIP · tests/unit", asOf: "2026-09-25" },
  { value: 57, unit: "", source: "Quipu · docs/MASTER-PLAN.md §13", asOf: "2026-07-26" },
  { value: 300, unit: "B", source: "sovran-cost-calculator · specs", asOf: "2026-08-22" },
  { value: 9, unit: "", source: "Quipu · docs/MASTER-PLAN.md §6.2", asOf: "2026-07-25" },
  { value: 18, unit: "%", source: "NOCLIP · docs/NOTES.md", asOf: "2026-09-22" },
] as const;

const links = {
  quipu: { href: "https://github.com/AndresO7/Quipu", label: "github.com/AndresO7/Quipu" },
  sovran: { href: "https://github.com/AndresO7/sovran-cost-calculator", label: "github.com/AndresO7/sovran-cost-calculator" },
  quasar: { href: "https://github.com/AndresO7/Quasar", label: "github.com/AndresO7/Quasar" },
  funcode: { href: "https://github.com/AndresO7/FunCodeGenerator", label: "github.com/AndresO7/FunCodeGenerator" },
  lending: { href: "https://github.com/AndresO7/Proyecto_distribuidas_jar", label: "github.com/AndresO7/Proyecto_distribuidas_jar" },
};

const stacks = {
  quipu: ["Rust", "Tokio · Axum", "Python · FastAPI", "Next.js", "Postgres + pgvector", "Keycloak", "AWS · Terraform"],
  noclip: ["TypeScript", "Three.js", "Web Audio", "Vite", "Vitest", "Playwright", "Blender (scripted)"],
  sovran: ["Next.js 16", "React Three Fiber", "GSAP", "Supabase", "Postgres · RLS", "Vitest", "Zod"],
  quasar: ["Python", "LangChain", "Ollama · Llama 3 8B", "Terraform", "AWS", "Next.js"],
  funcode: ["Next.js", "tldraw", "GPT-4 Vision", "Tailwind"],
};

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
const packet = (l: { objective: string; files: string; consumed: string; produced: string; tdd: string; verify: string; accept: string }) =>
  [
    " 0                   1                   2                   3",
    " 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1",
    "+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+",
    full(l.objective),
    ruleFull,
    full(l.files),
    ruleHalf,
    half(l.consumed, l.produced),
    ruleHalf,
    full(l.tdd),
    ruleHalf,
    half(l.verify, l.accept),
    ruleHalf,
  ].join("\n");

/* ——————————————————————————————— English ——————————————————————————————— */

const en = {
  lang: { en: "EN", es: "ES", label: "Language", switchTo: "Switch language" },

  sound: { on: "Sound on", off: "Sound off", label: "Sound", hint: "Best with sound — switch it on, bottom right" },

  profile: {
    role: "Software Engineer",
    focus: "AI systems · software & cloud architecture",
    /** [brackets] mark the words set in acid */
    statement:
      "I build systems at the intersection of [software architecture,] [cloud infrastructure] and [artificial intelligence] — and investigate what comes next.",
    base: "Quito, Ecuador",
    languages: "Spanish · English",
  },

  credentials: [
    { label: "AWS Solutions Architect", note: "Amazon Web Services", kind: "Certified" },
    { label: "Claude Code", note: "Agentic development", kind: "Certified" },
    { label: "GitHub Campus Expert", note: "GitHub Education · 2023", kind: "Program" },
  ],

  scenes: {
    title: "Title",
    manifesto: "Kinetic type",
    record: "The record",
    profile: "Profile",
    work: "Selected work",
    method: "Method",
    context: "Context",
    lab: "Lab",
    lineage: "Lineage",
    harness: "Harness",
    handshake: "Handshake",
  } satisfies Record<SceneId, string>,

  hud: {
    reel: "Systems reel — 2026",
    bar: "Bar",
    index: "Scene index",
    close: "Close [esc]",
    openIndex: "Open scene index",
    cursorIndex: "Index",
    cursorClose: "Close",
    cutTo: "Cut to",
    cursorOpen: "Open",
  },

  loader: {
    aria: "Loading",
    prod: "Prod.",
    prodValue: "Andres Ortiz — Systems reel",
    director: "Director",
    roll: "Roll",
    scene: "Scene",
    take: "Take",
    camera: "Camera",
    fps: "FPS",
    date: "Date",
    status: "Status",
    lines: [
      "Mounting statue.glb — 87,547 tris",
      "Compiling dither shader",
      "Setting type — Archivo 62% ↔ 125%",
      "Syncing clock — 128 BPM",
      "Rolling",
    ],
  },

  hero: {
    rings: [
      "SOFTWARE ENGINEER — AI SYSTEMS — CLOUD ARCHITECTURE — QUITO, EC — ",
      "SYSTEMS, NOT DEMOS + REEL 2026 + 128 BPM + ",
    ],
  },

  manifesto: {
    words: ["SYSTEMS", "NOT", "DEMOS"],
    sr: "Systems, not demos.",
    caption:
      "Agents, MCP servers and gateways, tool governance, context budgets, evaluation that can fail — designed as systems, not demos.",
    word: "Word",
  },

  record: {
    title: "The record",
    sub: "Every number here was taken from a real repository.",
    fact: "Fact",
    source: "Source",
    bytes: " bytes",
    facts: [
      "unit tests guarding a world that is generated, not authored",
      "tests written first and green in conduit, the Rust data plane, when Phase 0 closed",
      "of JSON store an entire saved 3D model — because the model was never a file",
      "contracts fixed between components before the code that implements them",
      "of one CPU core: the worst-case procedural audio scene, measured offline",
    ],
  },

  profileSection: {
    kicker: "Profile",
    question: "— Who is this?",
    caption: "The engineer, under red light",
    hover: "Hover — see through the halftone",
    cursor: "Look",
    role: "Role",
    focus: "Focus",
    base: "Base",
    languages: "Languages",
  },

  work: {
    title: "Selected work",
    projectsLabel: "Projects",
    fig: "Fig.",
    problem: "Problem",
    architecture: "Architecture",
    result: "Result",
    learned: "Learned",
    repository: "Repository ↗",
    alsoBuilt: "Also built",
    back: "↑ Back to the stage",
    projects: [
      {
        id: "quipu",
        name: "Quipu",
        tagline: "Enterprise AI asset gateway",
        year: "2026",
        context: "Own product · in progress",
        state: "Phase 0 complete · Phases 1–8 designed",
        stack: stacks.quipu,
        link: links.quipu,
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
        stack: stacks.noclip,
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
        stack: stacks.sovran,
        link: links.sovran,
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
        stack: stacks.quasar,
        link: links.quasar,
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
        stack: stacks.funcode,
        link: links.funcode,
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
        link: links.lending,
        problem: "A monolithic lending system mixes users, loans, payments and inventory in one deployable.",
        architecture:
          "An API gateway in front of six JVM services — users, loans, payments, notifications, books, inventory — on a shared Docker bridge network.",
        result: "Seven containers composed into one system.",
        learning: "Boundaries are a design decision before they’re an infrastructure one.",
        figure: "One gateway, six domains",
      },
    ] as Project[],
    also: [
      { name: "Cloud Bot", note: "Natural-language automation of AWS deployments", stack: "Go · Kafka" },
      { name: "Pico y Placa", note: "Quito’s driving-restriction rules as a tested library", stack: "TypeScript · Jest" },
      { name: "PetShop", note: "Technical test on the PetStore API", stack: "Next.js 15 · React 19 · Zustand" },
      { name: "Landing pages", note: "Including ISCD, a security company", stack: "Next.js" },
    ],
  },

  method: {
    kicker: "Method",
    question: "— How do you think?",
    title: "METHOD",
    lede: "How the thinking runs — shown by quoting the documents it produced. Spanish originals stay next to the translation.",
    steps: [
      {
        question: "Why does it break?",
        principle: "Name the real constraint before choosing a stack.",
        body: "Quipu didn’t start with Rust. It started with a diagnosis: harnesses run out of context in four distinct ways. Each got its own defence, and the architecture followed from the defences.",
        quote: "Governance is context optimization.",
        aside: "La gobernanza ES la optimización de contexto.",
        code: "visible_tools = policy(role, workspace, assets)",
        source: "Quipu · docs/architecture.md",
      },
      {
        question: "How do the parts meet?",
        principle: "Fix the contracts before the code.",
        body: "Nine contracts define how the gateway, optimizer, control plane and agents talk — before most of them exist. The seams are agreed first, so the parts can be built in parallel, by people or by agents.",
        quote: "Contracts are stable: changing one is a breaking change.",
        aside: "Contratos (estables — cambiarlos es un breaking change).",
        source: "Quipu · MASTER-PLAN §6.2",
      },
      {
        question: "What is already decided?",
        principle: "Write decisions down, with the reason and the owner.",
        body: "Some choices are closed on purpose. Writing them down stops them from being re-litigated in every session — including sessions with AI agents that weren’t there when they were made.",
        quote: "Fixed decisions — don’t re-litigate without the owner.",
        aside: "Decisiones fijadas (no re-litigar sin el usuario).",
        source: "Quipu · MASTER-PLAN §4",
      },
      {
        question: "Where does it fail?",
        principle: "Make the test able to fail.",
        body: "The end-to-end harness ships with a negative control: run it with the wrong allow-list and it has to go red. If it stays green, the harness is what’s broken.",
        quote: "A harness you have only ever seen pass has proven nothing.",
        aside: "Un harness que solo se ha visto pasar no ha demostrado nada.",
        code: "CURATED=add,get_time,echo bash dev/smoke-e2e.sh   # must FAIL",
        source: "Quipu · dev/README.md",
      },
      {
        question: "What is actually proven?",
        principle: "State the honest limit.",
        body: "Deployment artifacts that were never executed are marked as verified by inspection only. Targets a phase can’t meet by construction are exempted — and the plan names the mechanism that will.",
        quote: "Verified only by inspection: they do not count as tested.",
        aside: "Verificados solo por inspección: no cuentan como probados.",
        source: "Quipu · MASTER-PLAN §13",
      },
    ] as { question: string; principle: string; body: string; quote: string; aside: string; code?: string; source: string }[],
  },

  context: {
    kicker: "Context",
    question: "— Do you understand AI beyond an API call?",
    window: "Window",
    titleA: "Context is",
    titleB: "the resource",
    taskLabel: "Task",
    task: "Why did last night’s deploy fail? Open an issue with the root cause.",
    direct: "Direct — 12 MCP servers, 96 tools, 6 skills",
    firewall: "Through Quipu — the surface this identity may see",
    tok: "tok",
    loop: "Agent loop",
    overflow: "Overflow — the harness compacts",
    steps: [
      { title: "Assemble the context", note: "96 tools with full schemas + 6 skills loaded in full — vs the 9 tools this role may use, as short signatures." },
      { title: "Reason", note: "The model decides it needs the CI logs for run 8812." },
      { title: "Call a tool", note: "ci.get_run_logs(run: 8812) — through the gateway, the full schema is disclosed on first use." },
      { title: "Observe", note: "All 72k tokens of log enter the context — vs the failing stage and its error, plus a handle to the full log." },
      { title: "Reason again", note: "A migration timed out. The model searches the code for it." },
      { title: "Observe", note: "40 matches in full — vs top matches with file:line references. The direct window overflows; the harness compacts." },
      { title: "Ask before writing", note: "issues.create is a write: through the gateway it waits for a human to approve it." },
      { title: "Answer", note: "An issue is opened — one written from a context that lost the early log lines to compaction." },
    ],
  },

  lab: {
    kicker: "Lab",
    question: "— Do you investigate?",
    title: "Experiments",
    status: { concluded: "concluded", open: "open" } as Record<string, string>,
    fields: { question: "Question", hypothesis: "Hypothesis", result: "Result" },
    cursorOpen: "Open",
    cursorClose: "Close",
    archive: "Archive",
    archiveNote: "Earlier investigations, as the earlier portfolio records them.",
    experiments: [
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
    ],
    archiveItems: [
      { year: "2024", title: "Generative AI: a new frontier in DevOps automation", kind: "Published research · ESPE" },
      { year: "2023", title: "Generating code from visual interfaces with LLMs", kind: "Accepted paper" },
      { year: "—", title: "CAG Engine — cache-augmented generation to spend fewer tokens", kind: "Research prototype" },
    ],
  },

  lineage: {
    title: "Lineage",
    sub: "From the model writing code to agents as a workforce.",
    timeline: "Timeline — 2023 → 2026",
    playhead: "Playhead",
    items: [
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
        year: "2026",
        title: "Context becomes the resource",
        body: "Quipu: the gateway that decides what a harness gets to see — governance and context optimization as one mechanism.",
      },
      {
        year: "2026",
        title: "Agents become a workforce",
        body: "NOCLIP: a game built by parallel agent workstreams under contracts, verifiers and independent research passes.",
      },
    ],
  },

  harness: {
    kicker: "Harness",
    question: "— How do you work with AI tools?",
    titleA: "Agents need",
    titleB: "a harness",
    caption: "Task packet — drawn the way RFCs draw packet headers",
    packetLabel: "Task packet diagram",
    note:
      "NOCLIP was built by five parallel workstreams — level generation, the camcorder post pipeline, audio, entities and UI — each against its own dev harness. Verifier passes flagged: log soft-lock · seed links · Lessee ambient · pacing · line of sight.",
    packet: packet({
      objective: "OBJECTIVE",
      files: "FILES TO CREATE / TOUCH",
      consumed: "CONTRACTS CONSUMED",
      produced: "CONTRACTS PRODUCED",
      tdd: "TDD: test first · watch it fail · minimal code · green",
      verify: "VERIFICATION COMMAND",
      accept: "ACCEPTANCE CRITERIA",
    }),
    practices: [
      { title: "Spec before code", body: "Brainstorm → an approved spec → a phase plan of bite-sized TDD tasks. The plan is the entry point for any new session, human or agent." },
      { title: "One fresh agent per task", body: "Each task goes to a new subagent with only its packet, then a two-stage review before the next one starts." },
      { title: "Verification before completion", body: "“Done” means the commands ran and the evidence is shown — tests, lint, the deliverable actually running. Never a claim." },
      { title: "Agents need eyes", body: "Playwright with fixed seeds and scripted routes: screenshots, FPS logs and a debug hook let agents verify what they built." },
      { title: "Two agents, one question", body: "For open design problems, independent research passes from different agents against the same build — then a synthesis into contracts." },
      { title: "Memory is a file", body: "Lessons go into NOTES.md — one per entry, updated instead of duplicated — and CLAUDE.md / AGENTS.md live in every repository." },
    ],
  },

  handshake: {
    kicker: "Handshake",
    question: "— What could you do for us?",
    words: ["Have", "a system", "worth", "investigating?"],
    lede: "I’m looking for teams building AI systems that have to work in production — where architecture, cloud and AI can’t be pulled apart. Based in Quito (UTC−5), working in Spanish or English.",
    cta: "Start a conversation",
    cursorCta: "Write ↗",
    subject: "A system worth investigating",
    copy: "Copy",
    copied: "Copied ✓",
    cursorCopied: "Copied",
    offers: [
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
    ],
    creditsTitle: "End credits",
    credits: {
      directed: "Directed & engineered by",
      role: "Role",
      based: "Based in",
      languages: "Languages",
      built: "Built with",
      builtValue: "Next.js · Three.js · React Three Fiber · GSAP · Lenis",
      set: "Set in",
      setValue: "Archivo 62–125% · JetBrains Mono",
      shot: "Shot at",
      shotValue: "128 BPM · 60 FPS",
    },
    fin: "Fin.",
    end: "End of reel — thanks for watching",
    rewind: "↑ Rewind to 00:00",
    cursorRewind: "Rewind",
  },
};

export type Content = typeof en;

/* ——————————————————————————————— Español ——————————————————————————————— */

const es: Content = {
  lang: { en: "EN", es: "ES", label: "Idioma", switchTo: "Cambiar idioma" },

  sound: { on: "Con sonido", off: "Sin sonido", label: "Sonido", hint: "Mejor con sonido — actívalo abajo a la derecha" },

  profile: {
    role: "Ingeniero de software",
    focus: "Sistemas de IA · arquitectura de software y cloud",
    statement:
      "Construyo sistemas en la intersección de la [arquitectura de software,] la [infraestructura cloud] y la [inteligencia artificial] — e investigo lo que viene después.",
    base: "Quito, Ecuador",
    languages: "Español · Inglés",
  },

  credentials: [
    { label: "AWS Solutions Architect", note: "Amazon Web Services", kind: "Certificado" },
    { label: "Claude Code", note: "Desarrollo agéntico", kind: "Certificado" },
    { label: "GitHub Campus Expert", note: "GitHub Education · 2023", kind: "Programa" },
  ],

  scenes: {
    title: "Título",
    manifesto: "Tipografía cinética",
    record: "El registro",
    profile: "Perfil",
    work: "Trabajo seleccionado",
    method: "Método",
    context: "Contexto",
    lab: "Lab",
    lineage: "Linaje",
    harness: "Harness",
    handshake: "Contacto",
  },

  hud: {
    reel: "Reel de sistemas — 2026",
    bar: "Compás",
    index: "Índice de escenas",
    close: "Cerrar [esc]",
    openIndex: "Abrir el índice de escenas",
    cursorIndex: "Índice",
    cursorClose: "Cerrar",
    cutTo: "Ir a",
    cursorOpen: "Abrir",
  },

  loader: {
    aria: "Cargando",
    prod: "Prod.",
    prodValue: "Andres Ortiz — Reel de sistemas",
    director: "Director",
    roll: "Rollo",
    scene: "Escena",
    take: "Toma",
    camera: "Cámara",
    fps: "FPS",
    date: "Fecha",
    status: "Estado",
    lines: [
      "Montando statue.glb — 87.547 tris",
      "Compilando el shader de dither",
      "Componiendo tipos — Archivo 62% ↔ 125%",
      "Sincronizando el reloj — 128 BPM",
      "Rodando",
    ],
  },

  hero: {
    rings: [
      "INGENIERO DE SOFTWARE — SISTEMAS DE IA — ARQUITECTURA CLOUD — QUITO, EC — ",
      "SISTEMAS, NO DEMOS + REEL 2026 + 128 BPM + ",
    ],
  },

  manifesto: {
    words: ["SISTEMAS", "NO", "DEMOS"],
    sr: "Sistemas, no demos.",
    caption:
      "Agentes, servidores y gateways MCP, gobernanza de herramientas, presupuestos de contexto, evaluación que puede fallar — diseñados como sistemas, no como demos.",
    word: "Palabra",
  },

  record: {
    title: "El registro",
    sub: "Cada número de aquí salió de un repositorio real.",
    fact: "Dato",
    source: "Fuente",
    bytes: " bytes",
    facts: [
      "tests unitarios que custodian un mundo generado, no escrito a mano",
      "tests escritos primero y en verde en conduit, el data plane en Rust, al cerrar la Fase 0",
      "de JSON guardan un modelo 3D completo — porque el modelo nunca fue un archivo",
      "contratos fijados entre componentes antes del código que los implementa",
      "de un núcleo de CPU: la escena de audio procedural más exigente, medida offline",
    ],
  },

  profileSection: {
    kicker: "Perfil",
    question: "— ¿Quién es?",
    caption: "El ingeniero, bajo luz roja",
    hover: "Pasa el cursor — mira a través del halftone",
    cursor: "Mirar",
    role: "Rol",
    focus: "Enfoque",
    base: "Base",
    languages: "Idiomas",
  },

  work: {
    title: "Trabajo seleccionado",
    projectsLabel: "Proyectos",
    fig: "Fig.",
    problem: "Problema",
    architecture: "Arquitectura",
    result: "Resultado",
    learned: "Aprendido",
    repository: "Repositorio ↗",
    alsoBuilt: "También construí",
    back: "↑ Volver al escenario",
    projects: [
      {
        id: "quipu",
        name: "Quipu",
        tagline: "Gateway empresarial de activos de IA",
        year: "2026",
        context: "Producto propio · en progreso",
        state: "Fase 0 completa · Fases 1–8 diseñadas",
        stack: stacks.quipu,
        link: links.quipu,
        problem:
          "Los gateways MCP centralizan herramientas pero inundan el contexto del harness: demasiadas herramientas, schemas verbosos, resultados gigantes, flujos que necesitan muchas skills.",
        architecture:
          "Un data plane en Rust es la única entrada MCP y solo aplica reglas; un optimizador en Python compila paquetes de contexto por identidad; un control plane sobre Postgres + pgvector gobierna políticas y auditoría. Nueve contratos fijan las costuras.",
        result: "57 tests escritos primero y en verde, un harness end-to-end con 24 asserts y un control negativo que tiene que fallar.",
        learning: "Pon la invariante en un solo lugar.",
        figure: "Cuerdas anudadas — una por contrato",
      },
      {
        id: "noclip",
        name: "NOCLIP",
        tagline: "Terror liminal found-footage para el navegador",
        year: "2026",
        context: "Personal · repositorio privado",
        state: "6 niveles construidos · pasadas de verificación en curso",
        stack: stacks.noclip,
        problem:
          "Hacer que un lugar se sienta mal sin diseñarlo a mano: todo lo que se ve y se oye se genera en ejecución a partir de una semilla, y la misma semilla siempre debe producir el mismo mundo.",
        architecture:
          "Streams de RNG con semilla → un layout de datos puros → streaming por chunks con luz horneada → un pipeline de post estilo VHS. Un director de tensión controla las entidades y mueve el audio HRTF con reverb procedural por habitación.",
        result: "363 tests unitarios; rutas de Playwright con semillas fijas, capturas y logs de FPS.",
        learning: "Mide lo que crees que construiste.",
        figure: "Un pasillo infinito — una semilla, el mismo edificio",
      },
      {
        id: "sovran",
        name: "Sovran",
        tagline: "Configurador 3D para un estudio de arquitectura de lujo en Londres",
        year: "2026",
        context: "Trabajo para cliente",
        state: "Entregado · auth y modelos guardados en ago 2026",
        stack: stacks.sovran,
        link: links.sovran,
        problem:
          "Que los propietarios configuren en 3D una extensión trasera y la conversión del ático, y vean en vivo un rango de precio que sigue la guía de precios del propio estudio — zona por zona.",
        architecture:
          "Un estado reducer (unos veinte escalares) alimenta a la vez un calculatePrice() puro y modelos procedurales en R3F. Supabase para auth, almacenamiento jsonb detrás de row-level security y miniaturas.",
        result: "Un diseño guardado pesa ~300 bytes. 50 tests fijan la guía de precios, las zonas y la persistencia.",
        learning: "Los artefactos generativos guardan sus parámetros, no su resultado.",
        figure: "Casa, extensión, ático — veinte escalares",
      },
      {
        id: "quasar",
        name: "Quasar",
        tagline: "Un agente DevOps conversacional que escribe Terraform",
        year: "2024",
        context: "Prototipo de investigación",
        state: "Prototipo de 2024",
        stack: stacks.quasar,
        link: links.quasar,
        problem: "Personas sin experiencia en DevOps necesitan infraestructura en la nube y no saben escribir Terraform.",
        architecture:
          "Un chat loop alrededor de un Llama 3 8B local: entrevista al usuario, genera Terraform para AWS, lee los errores del apply, repara el código hasta que funciona y luego explica qué construyó y cuánto cuesta por hora.",
        result: "El ciclo completo — entrevistar, generar, aplicar, reparar, explicar — y un paper de 2024 sobre IA generativa para DevOps.",
        learning: "Los errores son observaciones.",
        figure: "terraform apply — fallar, observar, reparar",
      },
      {
        id: "funcode",
        name: "FunCode",
        tagline: "De un boceto a un prototipo funcional",
        year: "2023–24",
        context: "Prototipo de investigación",
        state: "Prototipo 2023–24",
        stack: stacks.funcode,
        link: links.funcode,
        problem: "Convertir un wireframe a mano alzada en un prototipo funcional es lento, y el boceto ya dice casi todo lo que el código debe hacer.",
        architecture:
          "Un canvas de tldraw; la selección se renderiza como imagen junto con su texto y se envía a GPT-4 Vision; vuelve al canvas un prototipo HTML de un solo archivo para anotarlo e iterar.",
        result: "El paper aceptado en 2023 sobre generación de código a partir de interfaces visuales con LLMs.",
        learning: "El boceto se vuelve la especificación.",
        figure: "Wireframe → capas → interfaz",
      },
      {
        id: "lending",
        name: "Préstamos",
        tagline: "Un sistema de biblioteca descompuesto en servicios",
        year: "2024",
        context: "Proyecto universitario",
        state: "Trabajo de curso 2024",
        stack: ["Java 17", "Microservicios", "API gateway", "Docker Compose"],
        link: links.lending,
        problem: "Un sistema de préstamos monolítico mezcla usuarios, préstamos, pagos e inventario en un solo desplegable.",
        architecture:
          "Un API gateway frente a seis servicios JVM — usuarios, préstamos, pagos, notificaciones, libros, inventario — en una red bridge compartida de Docker.",
        result: "Siete contenedores compuestos en un solo sistema.",
        learning: "Los límites son una decisión de diseño antes que de infraestructura.",
        figure: "Un gateway, seis dominios",
      },
    ],
    also: [
      { name: "Cloud Bot", note: "Despliegues en AWS automatizados con lenguaje natural", stack: "Go · Kafka" },
      { name: "Pico y Placa", note: "Las reglas de restricción vehicular de Quito como librería testeada", stack: "TypeScript · Jest" },
      { name: "PetShop", note: "Prueba técnica sobre la API de PetStore", stack: "Next.js 15 · React 19 · Zustand" },
      { name: "Landing pages", note: "Entre ellas ISCD, una empresa de seguridad", stack: "Next.js" },
    ],
  },

  method: {
    kicker: "Método",
    question: "— ¿Cómo piensas?",
    title: "MÉTODO",
    lede: "Cómo corre el pensamiento — citando los documentos que produjo. Los originales en español van junto a su traducción.",
    steps: [
      {
        question: "¿Por qué se rompe?",
        principle: "Nombra la restricción real antes de elegir el stack.",
        body: "Quipu no empezó con Rust. Empezó con un diagnóstico: los harnesses se quedan sin contexto de cuatro formas distintas. Cada una recibió su propia defensa, y la arquitectura salió de las defensas.",
        quote: "La gobernanza ES la optimización de contexto.",
        aside: "Governance is context optimization.",
        code: "visible_tools = policy(role, workspace, assets)",
        source: "Quipu · docs/architecture.md",
      },
      {
        question: "¿Cómo se encuentran las partes?",
        principle: "Fija los contratos antes que el código.",
        body: "Nueve contratos definen cómo hablan el gateway, el optimizador, el control plane y los agentes — antes de que la mayoría exista. Las costuras se acuerdan primero, así las partes se construyen en paralelo, por personas o por agentes.",
        quote: "Contratos (estables — cambiarlos es un breaking change).",
        aside: "Contracts are stable: changing one is a breaking change.",
        source: "Quipu · MASTER-PLAN §6.2",
      },
      {
        question: "¿Qué ya está decidido?",
        principle: "Escribe las decisiones, con la razón y el responsable.",
        body: "Algunas decisiones se cierran a propósito. Escribirlas evita que se vuelvan a discutir en cada sesión — incluidas las sesiones con agentes de IA que no estaban cuando se tomaron.",
        quote: "Decisiones fijadas (no re-litigar sin el usuario).",
        aside: "Fixed decisions — don’t re-litigate without the owner.",
        source: "Quipu · MASTER-PLAN §4",
      },
      {
        question: "¿Dónde falla?",
        principle: "Haz que el test pueda fallar.",
        body: "El harness end-to-end trae un control negativo: córrelo con la allow-list equivocada y tiene que ponerse en rojo. Si sigue en verde, lo que está roto es el harness.",
        quote: "Un harness que solo se ha visto pasar no ha demostrado nada.",
        aside: "A harness you have only ever seen pass has proven nothing.",
        code: "CURATED=add,get_time,echo bash dev/smoke-e2e.sh   # debe FALLAR",
        source: "Quipu · dev/README.md",
      },
      {
        question: "¿Qué está realmente probado?",
        principle: "Declara el límite honesto.",
        body: "Los artefactos de despliegue que nunca se ejecutaron se marcan como verificados solo por inspección. Las metas que una fase no puede cumplir por construcción se eximen — y el plan nombra el mecanismo que sí las cumplirá.",
        quote: "Verificados solo por inspección: no cuentan como probados.",
        aside: "Verified only by inspection: they do not count as tested.",
        source: "Quipu · MASTER-PLAN §13",
      },
    ],
  },

  context: {
    kicker: "Contexto",
    question: "— ¿Entiendes la IA más allá de una llamada a una API?",
    window: "Ventana",
    titleA: "El contexto es",
    titleB: "el recurso",
    taskLabel: "Tarea",
    task: "¿Por qué falló el deploy de anoche? Abre un issue con la causa raíz.",
    direct: "Directo — 12 servidores MCP, 96 herramientas, 6 skills",
    firewall: "A través de Quipu — la superficie que esta identidad puede ver",
    tok: "tok",
    loop: "Ciclo del agente",
    overflow: "Desborde — el harness compacta",
    steps: [
      { title: "Armar el contexto", note: "96 herramientas con schemas completos + 6 skills cargadas enteras — vs las 9 herramientas que este rol puede usar, como firmas cortas." },
      { title: "Razonar", note: "El modelo decide que necesita los logs de CI del run 8812." },
      { title: "Llamar una herramienta", note: "ci.get_run_logs(run: 8812) — a través del gateway, el schema completo se revela en el primer uso." },
      { title: "Observar", note: "Los 72k tokens del log entran al contexto — vs la etapa que falló y su error, más un handle al log completo." },
      { title: "Razonar de nuevo", note: "Una migración excedió el tiempo límite. El modelo la busca en el código." },
      { title: "Observar", note: "40 coincidencias completas — vs las mejores coincidencias con referencias archivo:línea. La ventana directa se desborda; el harness compacta." },
      { title: "Preguntar antes de escribir", note: "issues.create es una escritura: a través del gateway espera a que una persona la apruebe." },
      { title: "Responder", note: "Se abre un issue — escrito desde un contexto que perdió las primeras líneas del log al compactar." },
    ],
  },

  lab: {
    kicker: "Lab",
    question: "— ¿Investigas?",
    title: "Experimentos",
    status: { concluded: "concluido", open: "abierto" },
    fields: { question: "Pregunta", hypothesis: "Hipótesis", result: "Resultado" },
    cursorOpen: "Abrir",
    cursorClose: "Cerrar",
    archive: "Archivo",
    archiveNote: "Investigaciones anteriores, tal como las registra el portafolio anterior.",
    experiments: [
      {
        id: "EXP-01",
        title: "Recordar mal el mundo real",
        project: "NOCLIP",
        date: "2026-09-22",
        status: "concluded",
        question: "¿Puede un edificio generado proceduralmente sentirse mal — en vez de solo aleatorio, o solo deteriorado?",
        hypothesis: "Lo inquietante es semántico. El ruido se lee como deterioro; el recuerdo correcto de un lugar con unos pocos errores precisos se lee como pavor.",
        result:
          "Doce errores de memoria — un reloj sin manecillas, un letrero de SALIDA en una pared vacía, alfombra que trepa por la pared — como máximo tres por chunk. Un test de alcanzabilidad garantiza que ningún error bloquee la ruta.",
      },
      {
        id: "EXP-02",
        title: "Medir un sonido en vez de confiar en él",
        project: "NOCLIP",
        date: "2026-09",
        status: "concluded",
        question: "¿Una reverb generada proceduralmente suena de verdad como la habitación que dice ser?",
        hypothesis: "Si la respuesta al impulso de cada habitación se genera por material, su RT60 por banda debería medir dentro de la especificación.",
        result:
          "Los materiales “oscuros” medían brillantes. La cola ahora son tres bandas de ruido independientes con filtros Linkwitz–Riley, y el RT60 por banda mide a pocos puntos porcentuales de la especificación.",
      },
      {
        id: "EXP-03",
        title: "Una meta de latencia imposible por construcción",
        project: "Quipu",
        date: "2026-07-25",
        status: "concluded",
        question: "¿El walking skeleton de la Fase 0 ya debería cumplir los SLOs de latencia del data plane?",
        hypothesis: "Un esqueleto debería medirse contra las metas finales desde el primer día, para detectar regresiones temprano.",
        result:
          "Un presupuesto de p50 ≤ 1 ms que contiene una llamada de red es aritmética imposible. La Fase 0 queda exenta de dos filas del SLO, y el plan nombra el snapshot que las restaura.",
      },
      {
        id: "EXP-04",
        title: "El modelo no es un archivo",
        project: "Sovran",
        date: "2026-08-22",
        status: "concluded",
        question: "¿Cómo se debe guardar la configuración 3D de la casa de un cliente?",
        hypothesis: "El diseño obvio: exportar el modelo — geometría, texturas — y guardar el archivo.",
        result:
          "Toda la geometría es procedural. Un modelo guardado son ~300 bytes de JSON, validados al leerse; el precio se recalcula, nunca se confía en el almacenado.",
      },
      {
        id: "EXP-05",
        title: "Proyección versus búsqueda",
        project: "Quipu",
        date: "2026-07",
        status: "open",
        question: "¿Es mejor una superficie de herramientas determinista, proyectada por identidad, que dejar que el agente busque herramientas?",
        hypothesis: "Sí: una superficie calculada a partir de la identidad cuesta menos tokens y falla menos que una búsqueda que el agente tiene que conducir.",
        result: "Pendiente — el Context Ledger (Fase 3) contará los tokens ahorrados por día, equipo y activo.",
      },
    ],
    archiveItems: [
      { year: "2024", title: "IA Generativa: una nueva frontera en la automatización DevOps", kind: "Investigación publicada · ESPE" },
      { year: "2023", title: "Generación de código desde interfaces visuales mediante LLMs", kind: "Paper aceptado" },
      { year: "—", title: "CAG Engine — generación aumentada por caché para gastar menos tokens", kind: "Prototipo de investigación" },
    ],
  },

  lineage: {
    title: "Linaje",
    sub: "Del modelo que escribe código a los agentes como fuerza de trabajo.",
    timeline: "Línea de tiempo — 2023 → 2026",
    playhead: "Cabezal",
    items: [
      {
        year: "2023",
        title: "El modelo escribe código",
        body: "FunCodeGenerator: dibujas un wireframe y un modelo de visión devuelve un prototipo funcional que puedes anotar e iterar.",
      },
      {
        year: "2024",
        title: "El modelo opera infraestructura",
        body: "Quasar: un Llama 3 8B local escribe Terraform para AWS, trata los errores del apply como observaciones y repite hasta que funciona.",
      },
      {
        year: "2026",
        title: "El contexto se vuelve el recurso",
        body: "Quipu: el gateway que decide qué puede ver un harness — gobernanza y optimización de contexto como un solo mecanismo.",
      },
      {
        year: "2026",
        title: "Los agentes se vuelven fuerza de trabajo",
        body: "NOCLIP: un juego construido por flujos paralelos de agentes bajo contratos, verificadores y pasadas de investigación independientes.",
      },
    ],
  },

  harness: {
    kicker: "Harness",
    question: "— ¿Cómo trabajas con herramientas de IA?",
    titleA: "Los agentes necesitan",
    titleB: "un harness",
    caption: "Paquete de tarea — dibujado como los RFC dibujan las cabeceras de paquetes",
    packetLabel: "Diagrama del paquete de tarea",
    note:
      "NOCLIP se construyó con cinco flujos paralelos — generación de niveles, el pipeline de post de la videocámara, audio, entidades e interfaz — cada uno contra su propio harness de desarrollo. Las pasadas de verificación marcaron: soft-lock del log · enlaces de semilla · ambiente del Lessee · ritmo · línea de visión.",
    packet: packet({
      objective: "OBJETIVO",
      files: "ARCHIVOS A CREAR / TOCAR",
      consumed: "CONTRATOS CONSUMIDOS",
      produced: "CONTRATOS PRODUCIDOS",
      tdd: "TDD: test primero · verlo fallar · código mínimo · verde",
      verify: "COMANDO DE VERIFICACIÓN",
      accept: "CRITERIOS DE ACEPTACIÓN",
    }),
    practices: [
      { title: "Spec antes que código", body: "Lluvia de ideas → una spec aprobada → un plan por fases de tareas TDD pequeñas. El plan es el punto de entrada de cualquier sesión nueva, humana o de agente." },
      { title: "Un agente nuevo por tarea", body: "Cada tarea va a un subagente nuevo solo con su paquete, y luego pasa por una revisión en dos etapas antes de empezar la siguiente." },
      { title: "Verificar antes de terminar", body: "“Listo” significa que los comandos corrieron y la evidencia está a la vista — tests, lint, el entregable funcionando. Nunca una afirmación." },
      { title: "Los agentes necesitan ojos", body: "Playwright con semillas fijas y rutas guionadas: capturas, logs de FPS y un hook de depuración para que los agentes verifiquen lo que construyeron." },
      { title: "Dos agentes, una pregunta", body: "Para problemas de diseño abiertos, pasadas de investigación independientes de distintos agentes sobre el mismo build — y luego una síntesis en contratos." },
      { title: "La memoria es un archivo", body: "Las lecciones van a NOTES.md — una por entrada, actualizada en vez de duplicada — y CLAUDE.md / AGENTS.md viven en cada repositorio." },
    ],
  },

  handshake: {
    kicker: "Contacto",
    question: "— ¿Qué podrías hacer por nosotros?",
    words: ["¿Tienes", "un sistema", "digno de", "investigar?"],
    lede: "Busco equipos que construyan sistemas de IA que tengan que funcionar en producción — donde la arquitectura, la nube y la IA no se pueden separar. Desde Quito (UTC−5), trabajando en español o en inglés.",
    cta: "Iniciar una conversación",
    cursorCta: "Escribir ↗",
    subject: "Un sistema digno de investigar",
    copy: "Copiar",
    copied: "Copiado ✓",
    cursorCopied: "Copiado",
    offers: [
      {
        title: "Sistemas de IA que sobreviven a producción",
        body: "Agentes, servidores y gateways MCP, gobernanza de herramientas, presupuestos de contexto, evaluación que puede fallar — diseñados como sistemas, no como demos.",
      },
      {
        title: "Arquitectura cloud en AWS",
        body: "Event-driven y serverless, contenedores en ECS o EKS, el almacén correcto para cada patrón de acceso — con los trade-offs por escrito.",
      },
      {
        title: "De la ambigüedad a un plan por fases",
        body: "Contratos, SLOs, registros de decisiones, límites honestos y un camino de verificación — y luego construirlo, fase por fase.",
      },
      {
        title: "Harnesses para ingeniería asistida por IA",
        body: "Skills, flujos con subagentes, verificadores y memoria, para que lo que producen los agentes sea algo que tu equipo pueda revisar y en lo que pueda confiar.",
      },
    ],
    creditsTitle: "Créditos finales",
    credits: {
      directed: "Dirigido y desarrollado por",
      role: "Rol",
      based: "Desde",
      languages: "Idiomas",
      built: "Construido con",
      builtValue: "Next.js · Three.js · React Three Fiber · GSAP · Lenis",
      set: "Tipografía",
      setValue: "Archivo 62–125% · JetBrains Mono",
      shot: "Rodado a",
      shotValue: "128 BPM · 60 FPS",
    },
    fin: "Fin.",
    end: "Fin del reel — gracias por ver",
    rewind: "↑ Rebobinar a 00:00",
    cursorRewind: "Rebobinar",
  },
};

export const content: Record<Locale, Content> = { en, es };
