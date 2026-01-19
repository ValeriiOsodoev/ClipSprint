export type ToolConfig = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  href: string;
  ctaText: string;
  features: string[];
  steps: { title: string; description: string }[];
  exampleOutput: string[];
  color: "blue" | "purple";
};

export const TOOLS: ToolConfig[] = [
  {
    id: "script-kit",
    name: "YouTube Script Kit",
    tagline: "From topic to ready-to-record script in 60 seconds",
    description:
      "Generate titles, hooks, outlines, and CTAs that actually sound like YouTube — not corporate blog posts.",
    href: "/tools/script-kit",
    ctaText: "Try Script Kit",
    color: "blue",
    features: [
      "15 titles labeled SEO / click / balanced",
      "10 hook openings (5–15 sec each)",
      "Timestamped outline for 2/5/10/20 min videos",
      "Intro + CTA tailored to your goal (views/subs/sales)",
      "Output in Russian or English",
    ],
    steps: [
      {
        title: "Enter your niche & topic",
        description: "e.g., 'Programming' + 'How to learn Python in 2024'",
      },
      {
        title: "Pick duration, style & goal",
        description: "2–20 min, calm or energetic, optimize for views/subs/sales",
      },
      {
        title: "Copy & record",
        description: "Get titles, hooks, outline, intro, and CTA — ready to use",
      },
    ],
    exampleOutput: [
      "[SEO] How to Learn Python in 2024: Complete Beginner's Roadmap",
      "[click] I mass-Learned Python in 30 Days — Here's What Happened",
      "[hook] \"You've mass-wasted 100 hours on the wrong tutorials. Here's the fastest path that actually works.\"",

    ],
  },
  {
    id: "retention-doctor",
    name: "Retention Doctor",
    tagline: "Find and fix the moments where viewers leave",
    description:
      "Paste your script, get a drop-off map, tighter rewrites, pattern interrupts, and B-roll ideas with timestamps.",
    href: "/tools/retention-doctor",
    ctaText: "Fix My Script",
    color: "purple",
    features: [
      "Drop-off map: weak sections flagged with reasons",
      "Tight script: same message, no filler",
      "Pattern interrupts every N seconds (you choose)",
      "B-roll & visual insert suggestions with timestamps",
      "Copy-paste ready rewrites for each weak section",
    ],
    steps: [
      {
        title: "Paste your script",
        description: "Any length — works best with 2–20 min scripts",
      },
      {
        title: "Set video length & interrupt frequency",
        description: "Choose how often you want attention resets (20–60 sec)",
      },
      {
        title: "Review & apply fixes",
        description: "Copy rewrites, add interrupts, plan your B-roll",
      },
    ],
    exampleOutput: [
      "[0:45] ❓ Question: 'But what if you don't have 4 hours a day?'",
      "[1:30] 🎬 Scene change: Cut to screen recording of the actual setup",
      "[2:15] B-roll: Show typing on keyboard + text 'Day 1 vs Day 30'",
    ],
  },
];

export const FAQ_ITEMS = [
  {
    question: "Does it write in Russian and English?",
    answer:
      "Yes. Both tools support Russian (default) and English output. The UI is in English, but all generated content — titles, hooks, outlines, rewrites — will be in your chosen language.",
  },
  {
    question: "Does it store my scripts on the server?",
    answer:
      "No. Your scripts are sent to the AI for processing but are never stored on our servers. Generation history is saved locally in your browser (localStorage) and never leaves your device.",
  },
  {
    question: "Is this a full video editor?",
    answer:
      "No. This is a writing tool. It generates the text and structure for your videos — you still record and edit in your preferred software (Premiere, DaVinci, CapCut, etc.).",
  },
  {
    question: "How fast is it?",
    answer:
      "Script Kit generates in 5–15 seconds. Retention Doctor takes 10–20 seconds depending on script length. Both tools stream results as they're generated.",
  },
  {
    question: "What should I paste in?",
    answer:
      "For Script Kit: just your topic idea (1–2 sentences). For Retention Doctor: your full script text — the more complete, the better the analysis.",
  },
  {
    question: "Will it work for my niche?",
    answer:
      "It works for any YouTube niche — tech, lifestyle, education, gaming, business, fitness. The output adapts to the topic and style you provide.",
  },
  {
    question: "What if the output isn't good?",
    answer:
      "Regenerate with a more specific topic or different settings. The AI output varies — treat it as a strong first draft, not a final script. Your generations are saved locally so you can compare.",
  },
];
