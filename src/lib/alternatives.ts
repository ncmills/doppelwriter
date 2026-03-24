export interface Alternative {
  slug: string;
  competitor: string;
  tagline: string;
  reasons: { title: string; description: string }[];
  competitorPrice: string;
  competitorLimitation: string;
}

export const ALTERNATIVES: Alternative[] = [
  {
    slug: "chatgpt",
    competitor: "ChatGPT",
    tagline: "ChatGPT writes like ChatGPT. DoppelWriter writes like you.",
    reasons: [
      { title: "Voice matching, not generic output", description: "ChatGPT uses one voice for everyone. DoppelWriter analyzes YOUR writing and generates content that matches your rhythm, vocabulary, and personality." },
      { title: "Learns from your edits", description: "When you correct DoppelWriter's output, it remembers. ChatGPT starts from scratch every conversation." },
      { title: "140+ famous writer voices", description: "Write like Hemingway, Paul Graham, or Obama. ChatGPT can try to imitate, but it doesn't have forensic style profiles." },
      { title: "Purpose-built for writing", description: "ChatGPT is a general-purpose chatbot. DoppelWriter is built specifically for writing — with tracked changes, voice merging, and style analysis." },
    ],
    competitorPrice: "Free / $20 mo",
    competitorLimitation: "No voice matching — same AI voice for everyone",
  },
  {
    slug: "jasper",
    competitor: "Jasper",
    tagline: "Jasper does brand voice. DoppelWriter does YOUR voice.",
    reasons: [
      { title: "Personal voice, not brand guidelines", description: "Jasper's brand voice is a set of rules you define manually. DoppelWriter extracts your voice automatically from writing samples." },
      { title: "75% cheaper", description: "DoppelWriter Pro is $19/month. Jasper starts at $49/month for similar features." },
      { title: "Individual writers, not marketing teams", description: "Jasper is built for content teams producing marketing copy. DoppelWriter is for anyone who writes." },
      { title: "Famous writer voices included", description: "Write like any iconic author. Jasper doesn't offer this." },
    ],
    competitorPrice: "$49/mo",
    competitorLimitation: "Brand voice only — can't match individual personal writing style",
  },
  {
    slug: "grammarly",
    competitor: "Grammarly",
    tagline: "Grammarly fixes your grammar. DoppelWriter captures your voice.",
    reasons: [
      { title: "Different tools, different jobs", description: "Grammarly corrects errors and suggests improvements. DoppelWriter generates and rewrites entire pieces in your voice. Use both." },
      { title: "Voice-aware writing, not just correctness", description: "Grammarly's tone detector suggests generic tones. DoppelWriter builds a forensic voice profile from your actual writing." },
      { title: "Full content generation", description: "Grammarly edits what you've written. DoppelWriter can write entire pieces from a brief — in your voice." },
      { title: "Famous writer voices", description: "Write like Hemingway or Joan Didion. Grammarly has no concept of stylistic voice matching." },
    ],
    competitorPrice: "Free / $12 mo",
    competitorLimitation: "Grammar and tone only — no voice cloning or content generation",
  },
  {
    slug: "copy-ai",
    competitor: "Copy.ai",
    tagline: "Copy.ai generates marketing copy. DoppelWriter writes like you.",
    reasons: [
      { title: "Personal voice vs brand templates", description: "Copy.ai uses templates and brand rules. DoppelWriter analyzes your actual writing to capture your unique voice." },
      { title: "Not just for marketing", description: "Copy.ai targets marketing teams. DoppelWriter works for emails, speeches, essays, blog posts — anything you write." },
      { title: "More affordable", description: "DoppelWriter Pro is $19/month. Copy.ai starts at $49/month." },
      { title: "Forensic voice analysis", description: "DoppelWriter examines 30+ dimensions of your writing. Copy.ai's brand voice is surface-level tone matching." },
    ],
    competitorPrice: "$49/mo",
    competitorLimitation: "Template-based marketing copy — no personal voice matching",
  },
  {
    slug: "writesonic",
    competitor: "Writesonic",
    tagline: "Writesonic generates SEO content. DoppelWriter makes it sound like you.",
    reasons: [
      { title: "Voice authenticity vs content volume", description: "Writesonic optimizes for SEO and speed. DoppelWriter optimizes for sounding like a real person — you." },
      { title: "Personal voice cloning", description: "Upload your writing samples and DoppelWriter learns your voice. Writesonic offers generic tone selectors." },
      { title: "Famous writer library", description: "140+ iconic writers to write like. Writesonic has no equivalent." },
      { title: "Learns from corrections", description: "Edit DoppelWriter's output and it gets better. Writesonic doesn't learn from your feedback." },
    ],
    competitorPrice: "$16/mo",
    competitorLimitation: "SEO content focus — no personal voice matching",
  },
  {
    slug: "quillbot",
    competitor: "QuillBot",
    tagline: "QuillBot paraphrases. DoppelWriter writes in your voice.",
    reasons: [
      { title: "Generation vs paraphrasing", description: "QuillBot rephrases existing text. DoppelWriter generates entirely new content — in your personal voice." },
      { title: "Voice matching, not synonyms", description: "QuillBot swaps words. DoppelWriter captures your sentence rhythm, vocabulary patterns, and personality." },
      { title: "Full writing workflow", description: "DoppelWriter handles the entire writing process: draft, edit, revise, export. QuillBot is a single-step tool." },
      { title: "Famous writer voices", description: "Write like any iconic author. QuillBot just paraphrases in generic modes (fluency, formal, simple)." },
    ],
    competitorPrice: "Free / $10 mo",
    competitorLimitation: "Paraphrasing only — no original content generation or voice matching",
  },
  {
    slug: "wordtune",
    competitor: "Wordtune",
    tagline: "Wordtune rewrites sentences. DoppelWriter captures your entire voice.",
    reasons: [
      { title: "Whole-document voice, not sentence-level", description: "Wordtune suggests sentence alternatives. DoppelWriter transforms entire pieces into your voice — or generates from scratch." },
      { title: "Personal voice profiles", description: "Upload writing samples and DoppelWriter builds a forensic voice model. Wordtune uses generic tone options." },
      { title: "Famous writer voices", description: "140+ iconic writers. Wordtune offers no style matching." },
      { title: "Full generation capability", description: "DoppelWriter creates entire essays, speeches, and emails from a brief. Wordtune only rewrites existing text." },
    ],
    competitorPrice: "Free / $10 mo",
    competitorLimitation: "Sentence-level rewriting only — no voice cloning or full generation",
  },
  {
    slug: "rytr",
    competitor: "Rytr",
    tagline: "Rytr is a budget AI writer. DoppelWriter writes like you.",
    reasons: [
      { title: "Voice matching changes everything", description: "Rytr generates generic content in preset tones. DoppelWriter learns YOUR voice from samples and writes like you." },
      { title: "Quality over quantity", description: "Rytr focuses on speed and volume. DoppelWriter focuses on voice authenticity — sounding like a real person." },
      { title: "Famous writer library", description: "Write like Hemingway, Paul Graham, or any iconic author. Rytr has no equivalent." },
      { title: "Dynamic learning", description: "DoppelWriter learns from your edits and gets better over time. Rytr stays static." },
    ],
    competitorPrice: "Free / $9 mo",
    competitorLimitation: "Template-based content — no personal voice matching or learning",
  },
];

export function getAlternative(slug: string): Alternative | undefined {
  return ALTERNATIVES.find((a) => a.slug === slug);
}
