// Pure data — no server dependencies. Safe to import from client components.

export interface CuratedWriter {
  name: string;
  bio: string;
  tag: string;
  category: string;
}

export const CATEGORIES = [
  { id: "authors", label: "Authors", icon: "pen" },
  { id: "business", label: "Business & Tech", icon: "briefcase" },
  { id: "podcasters", label: "Podcasters & Creators", icon: "mic" },
  { id: "politicians", label: "Politicians & Leaders", icon: "landmark" },
  { id: "historical", label: "Historical Writers", icon: "scroll" },
  { id: "childrens", label: "Children's Authors", icon: "book" },
  { id: "journalists", label: "Journalists & Essayists", icon: "newspaper" },
  { id: "comedians", label: "Comedy Writers", icon: "laugh" },
  { id: "philosophers", label: "Philosophers & Thinkers", icon: "brain" },
  { id: "scientists", label: "Science Writers", icon: "microscope" },
] as const;

// Every writer here must have EXTENSIVE published writing or transcribed speech
// sufficient to build a near-perfect voice model.
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

  // Historical Writers
  { name: "Marcus Aurelius", bio: "Stoic meditations. Private journal entries from a Roman emperor. Full text of Meditations survives.", tag: "philosophy", category: "historical" },
  { name: "Benjamin Franklin", bio: "Witty, pragmatic, aphoristic. Autobiography + Poor Richard's Almanack + hundreds of letters.", tag: "historical", category: "historical" },
  { name: "Frederick Douglass", bio: "Thundering moral authority. Three autobiographies + hundreds of published speeches.", tag: "historical", category: "historical" },
  { name: "Mark Twain", bio: "America's voice. Dozens of novels, essays, speeches, and thousands of letters.", tag: "literary", category: "historical" },
  { name: "Virginia Woolf", bio: "Stream of consciousness pioneer. Novels, essays, diaries, and thousands of letters.", tag: "literary", category: "historical" },
  { name: "Oscar Wilde", bio: "Epigrammatic wit. Plays, novels, essays, letters, and courtroom transcripts.", tag: "literary", category: "historical" },
  { name: "Ralph Waldo Emerson", bio: "Transcendentalist essays. Hundreds of published lectures and journal entries.", tag: "philosophy", category: "historical" },
  { name: "Jane Austen", bio: "Ironic social observation. Six novels + extensive surviving letters.", tag: "literary", category: "historical" },
  { name: "Charles Dickens", bio: "Vivid, serialized storytelling. 15 novels + journalism + thousands of letters.", tag: "literary", category: "historical" },
  { name: "H.L. Mencken", bio: "Acerbic American commentary. Decades of newspaper columns + books + memoirs.", tag: "journalism", category: "historical" },

  // Science Writers
  { name: "Carl Sagan", bio: "Cosmic wonder in accessible prose. 600+ papers, 20+ books, Cosmos transcripts.", tag: "science", category: "scientists" },
  { name: "Richard Feynman", bio: "Playful genius explaining physics. Lectures, books, letters, interviews.", tag: "science", category: "scientists" },
  { name: "Oliver Sacks", bio: "Neurological case studies as literature. 14 books of compassionate scientific writing.", tag: "science", category: "scientists" },
  { name: "Stephen Jay Gould", bio: "300 consecutive monthly essays in Natural History. Evolutionary storytelling.", tag: "science", category: "scientists" },
  { name: "Rachel Carson", bio: "Silent Spring. Lyrical environmental writing that changed policy.", tag: "science", category: "scientists" },
  { name: "Neil deGrasse Tyson", bio: "Popular science communication. Books, columns, transcribed lectures.", tag: "science", category: "scientists" },
  { name: "Steven Pinker", bio: "Cognitive science + clear writing advocacy. 12 books on language and mind.", tag: "science", category: "scientists" },
  { name: "Mary Roach", bio: "Irreverent deep dives into bodies, space, and the gross. 7 bestselling books.", tag: "science", category: "scientists" },
  { name: "Atul Gawande", bio: "Surgeon-writer. New Yorker essays + 4 books on medicine and performance.", tag: "science", category: "scientists" },
  { name: "Ed Yong", bio: "Atlantic science journalist. Pulitzer-winning coverage + bestselling books.", tag: "science", category: "scientists" },

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
  { name: "Fran Lebowitz", bio: "New York curmudgeon. Metropolitan Life essays — caustic, precise, hilarious.", tag: "comedy", category: "comedians" },
  { name: "David Sedaris", bio: "Exaggerated memoir, dry wit, family dysfunction as art.", tag: "comedy", category: "comedians" },
  { name: "Bo Burnham", bio: "Meta, anxious, millennial existentialism in comedy form.", tag: "comedy", category: "comedians" },
  { name: "Mindy Kaling", bio: "Bubbly, pop-culture-drenched, confidently awkward.", tag: "comedy", category: "comedians" },
  { name: "Trevor Noah", bio: "Global perspective, gentle satire, immigrant humor with warmth.", tag: "comedy", category: "comedians" },
  { name: "George Carlin", bio: "Angry, linguistic, anti-establishment. Words matter — and they're funny.", tag: "comedy", category: "comedians" },

  // Philosophers
  { name: "Nassim Taleb", bio: "Combative, aphoristic, anti-fragile. 'Skin in the game.'", tag: "philosophy", category: "philosophers" },
  { name: "Jordan Peterson", bio: "Dense, archetypal, maps-of-meaning psychological lectures.", tag: "philosophy", category: "philosophers" },
  { name: "Alan Watts", bio: "Playful Zen. Western philosopher translating Eastern wisdom.", tag: "philosophy", category: "philosophers" },
  { name: "Simone de Beauvoir", bio: "Existentialist feminism. Rigorous, personal, politically engaged.", tag: "philosophy", category: "philosophers" },
  { name: "Friedrich Nietzsche", bio: "Aphoristic, provocative, dancing on the edge of madness.", tag: "philosophy", category: "philosophers" },
  { name: "Ayn Rand", bio: "Objectivist certainty. Lengthy, philosophical, fiercely individualist.", tag: "philosophy", category: "philosophers" },
  { name: "Hannah Arendt", bio: "The banality of evil. Political philosophy with moral weight.", tag: "philosophy", category: "philosophers" },
  { name: "Yuval Noah Harari", bio: "Big-history storytelling. Sapiens-scale sweeping narratives.", tag: "philosophy", category: "philosophers" },
  { name: "Maria Popova", bio: "The Marginalian. Luminous, deeply read, cross-disciplinary wonder.", tag: "philosophy", category: "philosophers" },
];
