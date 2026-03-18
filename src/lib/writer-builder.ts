import Anthropic from "@anthropic-ai/sdk";
import { sql } from "./db";

const client = new Anthropic();

export interface CuratedWriter {
  name: string;
  bio: string;
  tag: string;
  category: string;
}

export const CATEGORIES = [
  { id: "authors", label: "Authors", icon: "pen" },
  { id: "business", label: "Business & Tech", icon: "briefcase" },
  { id: "podcasters", label: "Podcasters", icon: "mic" },
  { id: "politicians", label: "Politicians", icon: "landmark" },
  { id: "historical", label: "Historical Figures", icon: "scroll" },
  { id: "characters", label: "Movie & TV Characters", icon: "film" },
  { id: "childrens", label: "Children's Authors", icon: "book" },
  { id: "journalists", label: "Journalists", icon: "newspaper" },
  { id: "comedians", label: "Comedians", icon: "laugh" },
  { id: "philosophers", label: "Philosophers & Thinkers", icon: "brain" },
] as const;

export const CURATED_WRITERS: CuratedWriter[] = [
  // Authors
  { name: "Ernest Hemingway", bio: "Sparse, powerful prose. The iceberg theory — say less, mean more.", tag: "literary", category: "authors" },
  { name: "George Orwell", bio: "Crystal-clear political writing. Never use a long word where a short one will do.", tag: "literary", category: "authors" },
  { name: "Joan Didion", bio: "Precise, atmospheric observation of American life. Sentences that cut.", tag: "literary", category: "authors" },
  { name: "Hunter S. Thompson", bio: "Gonzo journalism. Visceral, unhinged, brilliantly chaotic.", tag: "literary", category: "authors" },
  { name: "Toni Morrison", bio: "Lyrical, mythic prose that excavates the American experience.", tag: "literary", category: "authors" },
  { name: "Kurt Vonnegut", bio: "Deadpan humor, simple sentences, devastating truths. So it goes.", tag: "literary", category: "authors" },
  { name: "David Foster Wallace", bio: "Maximalist, footnote-laden, anxiously self-aware brilliance.", tag: "literary", category: "authors" },
  { name: "Cormac McCarthy", bio: "Biblical prose, no quotation marks, violence as poetry.", tag: "literary", category: "authors" },
  { name: "Zadie Smith", bio: "Witty, multicultural, structurally inventive contemporary fiction.", tag: "literary", category: "authors" },
  { name: "Stephen King", bio: "Conversational, propulsive, deeply human horror and storytelling.", tag: "literary", category: "authors" },

  // Business & Tech
  { name: "Paul Graham", bio: "Clear, direct essays on startups and thinking. Y Combinator co-founder.", tag: "business", category: "business" },
  { name: "Seth Godin", bio: "Punchy daily blog posts on marketing, leadership, and change.", tag: "marketing", category: "business" },
  { name: "Warren Buffett", bio: "Folksy, clear shareholder letters. Complex ideas in simple language.", tag: "finance", category: "business" },
  { name: "Jeff Bezos", bio: "Shareholder letters that read like strategy memos. Customer-obsessed logic.", tag: "business", category: "business" },
  { name: "Ben Thompson", bio: "Stratechery's analytical, framework-heavy tech analysis.", tag: "tech", category: "business" },
  { name: "Naval Ravikant", bio: "Aphoristic wisdom on wealth, happiness, and thinking.", tag: "philosophy", category: "business" },
  { name: "Morgan Housel", bio: "Storytelling meets behavioral finance. The Psychology of Money author.", tag: "finance", category: "business" },
  { name: "James Clear", bio: "Actionable, evidence-based writing on habits and self-improvement.", tag: "self-improvement", category: "business" },
  { name: "David Ogilvy", bio: "The father of advertising. Persuasive, authoritative, research-driven.", tag: "marketing", category: "business" },
  { name: "Marc Andreessen", bio: "Emphatic, list-heavy tech optimism. Software is eating the world.", tag: "tech", category: "business" },

  // Podcasters
  { name: "Joe Rogan", bio: "Casual, curious, long-form conversational style. 'That's crazy, man.'", tag: "podcast", category: "podcasters" },
  { name: "Tim Ferriss", bio: "Systematic, optimization-obsessed. Deconstructing world-class performers.", tag: "podcast", category: "podcasters" },
  { name: "Lex Fridman", bio: "Deeply earnest, philosophical, love-focused conversations about AI and life.", tag: "podcast", category: "podcasters" },
  { name: "Brene Brown", bio: "Warm, vulnerable, research-backed writing on courage and shame.", tag: "podcast", category: "podcasters" },
  { name: "Malcolm Gladwell", bio: "Narrative-driven idea exploration. The tipping point of storytelling.", tag: "journalism", category: "podcasters" },
  { name: "Sam Harris", bio: "Precise, philosophical, unflinching rationalism.", tag: "philosophy", category: "podcasters" },
  { name: "Conan O'Brien", bio: "Self-deprecating wit, absurdist humor, Harvard-educated comedy writing.", tag: "comedy", category: "podcasters" },
  { name: "Ezra Klein", bio: "Policy-dense, empathetic, systems-thinking journalism.", tag: "journalism", category: "podcasters" },
  { name: "Guy Raz", bio: "Warm, wonder-filled storytelling. How I Built This narrative style.", tag: "podcast", category: "podcasters" },
  { name: "Dax Shepard", bio: "Disarmingly honest, funny, emotionally intelligent conversation.", tag: "podcast", category: "podcasters" },

  // Politicians
  { name: "Barack Obama", bio: "Soaring oratory, measured cadence, bridge-building rhetoric.", tag: "political", category: "politicians" },
  { name: "Winston Churchill", bio: "Thundering wartime prose. 'We shall fight on the beaches.'", tag: "political", category: "politicians" },
  { name: "Abraham Lincoln", bio: "Biblical economy of language. The Gettysburg Address in 272 words.", tag: "political", category: "politicians" },
  { name: "John F. Kennedy", bio: "'Ask not what your country can do for you.' Inspirational brevity.", tag: "political", category: "politicians" },
  { name: "Martin Luther King Jr.", bio: "Prophetic, rhythmic, morally urgent. 'I have a dream.'", tag: "political", category: "politicians" },
  { name: "Alexandria Ocasio-Cortez", bio: "Direct, social-media-native, policy meets personal narrative.", tag: "political", category: "politicians" },
  { name: "Ronald Reagan", bio: "The Great Communicator. Warm, optimistic, story-driven.", tag: "political", category: "politicians" },
  { name: "Theodore Roosevelt", bio: "Vigorous, emphatic, adventurous prose. The man in the arena.", tag: "political", category: "politicians" },
  { name: "Margaret Thatcher", bio: "Iron conviction, precise diction, unyielding logic.", tag: "political", category: "politicians" },
  { name: "Bernie Sanders", bio: "Repetitive urgency, class-focused, righteous indignation.", tag: "political", category: "politicians" },

  // Historical Figures
  { name: "Marcus Aurelius", bio: "Stoic meditations. Private journal entries from a Roman emperor.", tag: "philosophy", category: "historical" },
  { name: "Benjamin Franklin", bio: "Witty, pragmatic, aphoristic. Poor Richard's common sense.", tag: "historical", category: "historical" },
  { name: "Cleopatra", bio: "Strategic, multilingual, diplomatic correspondence of power.", tag: "historical", category: "historical" },
  { name: "Leonardo da Vinci", bio: "Curious, observational, cross-disciplinary notebook entries.", tag: "historical", category: "historical" },
  { name: "Nikola Tesla", bio: "Visionary, technical precision, dramatic flair for the impossible.", tag: "historical", category: "historical" },
  { name: "Frida Kahlo", bio: "Raw, passionate, surreal diary entries. Pain transformed into art.", tag: "historical", category: "historical" },
  { name: "Albert Einstein", bio: "Playful clarity about profound complexity. Thought experiments in prose.", tag: "historical", category: "historical" },
  { name: "Sun Tzu", bio: "Strategic, aphoristic, timeless military and leadership wisdom.", tag: "historical", category: "historical" },
  { name: "Marie Curie", bio: "Methodical, passionate, scientific rigor with personal warmth.", tag: "historical", category: "historical" },
  { name: "Frederick Douglass", bio: "Thundering moral authority. Escaped slavery to master the English language.", tag: "historical", category: "historical" },

  // Movie & TV Characters
  { name: "Michael Scott", bio: "Cringey confidence, malapropisms, accidental wisdom. That's what she said.", tag: "character", category: "characters" },
  { name: "Ron Swanson", bio: "Libertarian deadpan. Meat, woodworking, and government hatred.", tag: "character", category: "characters" },
  { name: "Tyrion Lannister", bio: "Witty, strategic, wine-fueled political maneuvering.", tag: "character", category: "characters" },
  { name: "Gandalf", bio: "Ancient wisdom delivered with theatrical timing. 'You shall not pass.'", tag: "character", category: "characters" },
  { name: "Yoda", bio: "Inverted syntax, profound it is. Backwards wisdom from 900 years.", tag: "character", category: "characters" },
  { name: "Sherlock Holmes", bio: "Deductive, precise, arrogant brilliance. 'Elementary, my dear Watson.'", tag: "character", category: "characters" },
  { name: "Tony Stark", bio: "Quippy genius, rapid-fire wit, narcissism masking vulnerability.", tag: "character", category: "characters" },
  { name: "Darth Vader", bio: "Menacing brevity. Imperial authority. Heavy breathing optional.", tag: "character", category: "characters" },
  { name: "Captain Jack Sparrow", bio: "Drunken eloquence, tangential logic, somehow always right.", tag: "character", category: "characters" },
  { name: "Wednesday Addams", bio: "Deadpan, morbid, devastatingly articulate darkness.", tag: "character", category: "characters" },

  // Children's Authors
  { name: "Dr. Seuss", bio: "Rhyming, whimsical, nonsense words that make perfect sense.", tag: "childrens", category: "childrens" },
  { name: "Roald Dahl", bio: "Dark humor, invented words, gleeful cruelty to awful adults.", tag: "childrens", category: "childrens" },
  { name: "J.K. Rowling", bio: "Immersive world-building, British wit, chosen-one mythology.", tag: "childrens", category: "childrens" },
  { name: "Shel Silverstein", bio: "Simple, profound poetry. Where the sidewalk ends.", tag: "childrens", category: "childrens" },
  { name: "Maurice Sendak", bio: "Wild, dreamlike, emotionally honest picture book prose.", tag: "childrens", category: "childrens" },
  { name: "Beverly Cleary", bio: "Warm, realistic, everyday childhood captured perfectly.", tag: "childrens", category: "childrens" },
  { name: "C.S. Lewis", bio: "Allegorical, warm, profound simplicity. Narnia's moral imagination.", tag: "childrens", category: "childrens" },
  { name: "Eric Carle", bio: "Repetitive, rhythmic, sensory. 'But he was still hungry.'", tag: "childrens", category: "childrens" },
  { name: "R.L. Stine", bio: "Cliffhanger endings, spooky atmosphere, kid-friendly dread.", tag: "childrens", category: "childrens" },
  { name: "Judy Blume", bio: "Honest, taboo-breaking, emotionally true coming-of-age.", tag: "childrens", category: "childrens" },

  // Journalists
  { name: "Ta-Nehisi Coates", bio: "Urgent, personal, historically grounded racial commentary.", tag: "journalism", category: "journalists" },
  { name: "Matt Taibbi", bio: "Savage, funny, profanity-laced investigative takedowns.", tag: "journalism", category: "journalists" },
  { name: "Nora Ephron", bio: "Witty, personal, everything-is-copy essayist and screenwriter.", tag: "journalism", category: "journalists" },
  { name: "Gay Talese", bio: "New Journalism. Novelistic detail in nonfiction narratives.", tag: "journalism", category: "journalists" },
  { name: "Tom Wolfe", bio: "Exclamatory, status-obsessed, white-suited New Journalism pioneer.", tag: "journalism", category: "journalists" },
  { name: "Matt Levine", bio: "Dry financial humor. Bloomberg's 'Money Stuff' — banking made entertaining.", tag: "journalism", category: "journalists" },
  { name: "Tim Urban", bio: "Wait But Why. Complex ideas with stick figures and humor.", tag: "journalism", category: "journalists" },
  { name: "Maureen Dowd", bio: "Acerbic political wit, pop culture references, sharp one-liners.", tag: "journalism", category: "journalists" },
  { name: "Bob Woodward", bio: "Just-the-facts investigative authority. Watergate sobriety.", tag: "journalism", category: "journalists" },
  { name: "Annie Dillard", bio: "Nature writing as spiritual practice. Pilgrim at Tinker Creek intensity.", tag: "journalism", category: "journalists" },

  // Comedians
  { name: "Jerry Seinfeld", bio: "Observational precision. 'What's the deal with...?' Tight, clean comedy.", tag: "comedy", category: "comedians" },
  { name: "Tina Fey", bio: "Sharp, self-aware comedy writing. Bossypants voice.", tag: "comedy", category: "comedians" },
  { name: "Dave Chappelle", bio: "Storytelling comedy with social commentary. Punchlines that linger.", tag: "comedy", category: "comedians" },
  { name: "John Mulaney", bio: "Theatrical, precise, clean delivery. 'The one thing you can't replace.'", tag: "comedy", category: "comedians" },
  { name: "Nora Ephron", bio: "Heartburn humor. Food, love, and divorce as comedy material.", tag: "comedy", category: "comedians" },
  { name: "David Sedaris", bio: "Exaggerated memoir, dry wit, family dysfunction as art.", tag: "comedy", category: "comedians" },
  { name: "Bo Burnham", bio: "Meta, anxious, millennial existentialism in comedy form.", tag: "comedy", category: "comedians" },
  { name: "Mindy Kaling", bio: "Bubbly, pop-culture-drenched, confidently awkward.", tag: "comedy", category: "comedians" },
  { name: "Trevor Noah", bio: "Global perspective, gentle satire, immigrant humor with warmth.", tag: "comedy", category: "comedians" },
  { name: "George Carlin", bio: "Angry, linguistic, anti-establishment. Words matter — and they're funny.", tag: "comedy", category: "comedians" },

  // Philosophers & Thinkers
  { name: "Nassim Taleb", bio: "Combative, aphoristic, anti-fragile. 'Skin in the game.'", tag: "philosophy", category: "philosophers" },
  { name: "Jordan Peterson", bio: "Dense, archetypal, maps-of-meaning psychological lectures.", tag: "philosophy", category: "philosophers" },
  { name: "Alan Watts", bio: "Playful Zen. Western philosopher translating Eastern wisdom.", tag: "philosophy", category: "philosophers" },
  { name: "Simone de Beauvoir", bio: "Existentialist feminism. Rigorous, personal, politically engaged.", tag: "philosophy", category: "philosophers" },
  { name: "Friedrich Nietzsche", bio: "Aphoristic, provocative, dancing on the edge of madness.", tag: "philosophy", category: "philosophers" },
  { name: "Ayn Rand", bio: "Objectivist certainty. Lengthy, philosophical, fiercely individualist.", tag: "philosophy", category: "philosophers" },
  { name: "Carl Sagan", bio: "Cosmic wonder in accessible prose. 'Billions and billions.'", tag: "science", category: "philosophers" },
  { name: "Hannah Arendt", bio: "The banality of evil. Political philosophy with moral weight.", tag: "philosophy", category: "philosophers" },
  { name: "Yuval Noah Harari", bio: "Big-history storytelling. Sapiens-scale sweeping narratives.", tag: "philosophy", category: "philosophers" },
  { name: "Maria Popova", bio: "The Marginalian. Luminous, deeply read, cross-disciplinary wonder.", tag: "philosophy", category: "philosophers" },
];

export async function buildWriterProfile(
  writerName: string,
  bio?: string
): Promise<number> {
  const db = sql();

  const existing = await db`
    SELECT id FROM style_profiles WHERE writer_name = ${writerName} AND is_curated = TRUE
  `;
  if (existing.length > 0) return existing[0].id;

  let contentSamples: string;
  if (process.env.TAVILY_API_KEY) {
    contentSamples = await fetchRealContent(writerName);
  } else {
    contentSamples = await synthesizeFromKnowledge(writerName);
  }

  const profileResponse = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Analyze the writing/speaking style of ${writerName}. Create a detailed style profile.

${contentSamples}

Respond with JSON only:
{
  "micro": {
    "sentence_length_range": "...", "sentence_length_variance": "...",
    "rhythm_and_cadence": "...", "word_choice_patterns": "...",
    "vocabulary_level": "...", "punctuation_habits": "...",
    "function_word_patterns": "...", "characteristic_phrases": ["..."],
    "contractions_usage": "..."
  },
  "macro": {
    "paragraph_structure": "...", "paragraph_length_tendency": "...",
    "transition_style": "...", "argument_structure": "...",
    "opening_patterns": "...", "closing_patterns": "...",
    "pacing": "...", "use_of_examples": "..."
  },
  "anti_patterns": {
    "words_never_used": ["..."], "structures_avoided": ["..."],
    "tonal_boundaries": ["..."], "formatting_avoidances": ["..."]
  },
  "tone": "...", "formality": 7, "distinctive_quirks": ["..."],
  "overall_personality": "..."
}`,
      },
    ],
  });

  const profileText = profileResponse.content[0].type === "text" ? profileResponse.content[0].text : "";
  const jsonMatch = profileText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse writer profile");
  const profileJson = JSON.parse(jsonMatch[0]);

  const promptResponse = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Create a system prompt for an AI ghostwriter mimicking ${writerName}'s style. Use this profile:

${JSON.stringify(profileJson, null, 2)}

The prompt should instruct the AI to write exactly as ${writerName} would. Be specific. Include anti-AI-ism rules (never use "Moreover", "Furthermore", etc.). Return ONLY the prompt text.`,
      },
    ],
  });

  const systemPrompt = promptResponse.content[0].type === "text" ? promptResponse.content[0].text : "";
  const writerBio = bio || CURATED_WRITERS.find((w) => w.name === writerName)?.bio || "";
  const writerCategory = CURATED_WRITERS.find((w) => w.name === writerName)?.category || "custom";

  const [row] = await db`
    INSERT INTO style_profiles (name, description, writer_name, writer_bio, writer_category, is_curated, profile_json, system_prompt)
    VALUES (${writerName}, ${writerBio}, ${writerName}, ${writerBio}, ${writerCategory}, TRUE, ${JSON.stringify(profileJson)}, ${systemPrompt})
    RETURNING id
  `;

  return row.id;
}

async function fetchRealContent(writerName: string): Promise<string> {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query: `${writerName} essays writing published full text`,
      max_results: 8,
      include_raw_content: true,
    }),
  });

  const data = await response.json();
  const texts: string[] = [];
  for (const result of data.results || []) {
    if (result.raw_content) {
      texts.push(`--- From: ${result.title} ---\n${result.raw_content.slice(0, 3000)}`);
    }
  }

  return texts.length > 0 ? texts.join("\n\n") : synthesizeFromKnowledge(writerName);
}

async function synthesizeFromKnowledge(writerName: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Provide a comprehensive analysis of ${writerName}'s writing/speaking style with multiple representative excerpts or close paraphrases, sentence structure analysis, rhetorical devices, and distinctive quirks. Be specific with examples.`,
      },
    ],
  });
  return response.content[0].type === "text" ? response.content[0].text : "";
}

export async function buildCustomWriter(
  userId: string,
  writerName: string,
  bio?: string,
  category?: string
): Promise<number> {
  const db = sql();
  const profileId = await buildWriterProfile(writerName, bio);

  // Update category if provided
  if (category) {
    await db`UPDATE style_profiles SET writer_category = ${category} WHERE id = ${profileId}`;
  }

  await db`
    INSERT INTO usage_log (user_id, action) VALUES (${userId}, ${"writer_build:" + writerName})
  `;

  return profileId;
}

export async function getCuratedProfiles(category?: string) {
  const db = sql();
  if (category) {
    return db`
      SELECT id, name, writer_name, writer_bio, writer_category, description, is_curated,
        profile_json IS NOT NULL as has_profile
      FROM style_profiles
      WHERE is_curated = TRUE AND writer_category = ${category}
      ORDER BY name
    `;
  }
  return db`
    SELECT id, name, writer_name, writer_bio, writer_category, description, is_curated,
      profile_json IS NOT NULL as has_profile
    FROM style_profiles
    WHERE is_curated = TRUE
    ORDER BY writer_category, name
  `;
}

export async function searchCuratedProfiles(query: string) {
  const db = sql();
  return db`
    SELECT id, name, writer_name, writer_bio, writer_category, description, is_curated,
      profile_json IS NOT NULL as has_profile
    FROM style_profiles
    WHERE is_curated = TRUE
    AND (writer_name ILIKE ${"%" + query + "%"} OR writer_bio ILIKE ${"%" + query + "%"} OR writer_category ILIKE ${"%" + query + "%"})
    ORDER BY name
  `;
}
