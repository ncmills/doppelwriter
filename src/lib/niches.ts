export interface Niche {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroSubtitle: string;
  painPoints: string[];
  howItHelps: string[];
  useCases: string[];
  testimonialPlaceholder: string;
  ctaText: string;
  keywords: string[];
  faqs: { q: string; a: string }[];
}

export const NICHES: Niche[] = [
  {
    slug: "newsletter-writers",
    title: "DoppelWriter for Newsletter Writers",
    metaTitle: "AI Writing Tool for Newsletter Writers — Keep Your Voice Consistent | DoppelWriter",
    metaDescription: "Your subscribers know when the voice shifts. DoppelWriter keeps every edition on-brand — beat writer's block without losing what makes your newsletter yours.",
    heroSubtitle: "Your subscribers signed up for your voice. Every edition should sound like you wrote it — even when you're staring at a blank page on deadline day.",
    painPoints: [
      "Voice inconsistency creeps in across editions — readers notice before you do",
      "Writer's block hits hardest on deadline day when thousands of subscribers are waiting",
      "You bring on a co-writer or guest and suddenly the newsletter feels like a different publication",
      "AI drafts sound generic and robotic — the opposite of why people subscribed",
    ],
    howItHelps: [
      "Upload a few past editions and DoppelWriter builds a permanent voice profile that captures your sentence rhythm, word choices, and personality",
      "Generate first drafts that already sound like you — edit for substance, not style",
      "Co-writers and guest authors can write in your established voice without months of onboarding",
      "Your voice profile learns from every correction, getting sharper with each edition",
    ],
    useCases: [
      "Weekly newsletter drafts in your voice",
      "Subscriber welcome sequences that match your tone",
      "Social media teasers that sound like the newsletter",
      "Repurposing newsletter content into blog posts",
      "Guest edition outlines in your voice",
      "Subject line variations that feel on-brand",
    ],
    testimonialPlaceholder: "\"I went from spending 4 hours on every edition to 90 minutes. And my open rates actually went up — subscribers said it felt more polished but still unmistakably me.\"",
    ctaText: "Write Your Next Edition Free",
    keywords: [
      "AI for newsletter writers",
      "substack writing tool",
      "newsletter voice consistency",
      "AI newsletter assistant",
      "newsletter writing tool",
    ],
    faqs: [
      {
        q: "Will my subscribers be able to tell I used AI?",
        a: "That's the whole point of DoppelWriter — they shouldn't. Unlike generic AI tools, DoppelWriter matches your specific voice patterns: your sentence rhythm, vocabulary, punctuation habits, and personality. The output sounds like you, not like ChatGPT.",
      },
      {
        q: "How many writing samples do I need to upload?",
        a: "Three to five past editions is enough to build a strong voice profile. The more you upload, the sharper the match — but even a few samples capture the core of your writing style.",
      },
      {
        q: "Does it work with Substack, Beehiiv, ConvertKit, etc.?",
        a: "DoppelWriter generates text you can paste anywhere. Write and edit in DoppelWriter, then copy the finished piece into your newsletter platform of choice.",
      },
    ],
  },
  {
    slug: "ghostwriters",
    title: "DoppelWriter for Ghostwriters",
    metaTitle: "AI Ghostwriting Tool — Match Any Client's Voice Perfectly | DoppelWriter",
    metaDescription: "Stop hearing \"this doesn't sound like me.\" DoppelWriter builds voice profiles for each client so you can switch between 5+ voices daily without losing accuracy.",
    heroSubtitle: "Your job is disappearing into someone else's voice. DoppelWriter makes that effortless — switch between clients in seconds, not hours.",
    painPoints: [
      "Clients say \"this doesn't sound like me\" and you're back to square one on a draft",
      "Switching between 5+ client voices daily causes bleed — one client's style leaks into another's",
      "Onboarding a new client means weeks of studying their writing before you can produce anything",
      "Maintaining voice accuracy at scale is mentally exhausting and unsustainable",
    ],
    howItHelps: [
      "Build a permanent voice profile for each client — upload their writing samples and DoppelWriter maps their style forensically",
      "Switch between client voices with one click. No more context-switching mental gymnastics",
      "Onboard new clients in minutes: upload samples, generate a profile, start writing immediately",
      "Every draft starts closer to approved — fewer revision rounds, faster turnaround, happier clients",
    ],
    useCases: [
      "LinkedIn posts in each client's voice",
      "Blog posts and thought leadership articles",
      "Email newsletters for multiple brands",
      "Book chapters and long-form manuscripts",
      "Social media content across client accounts",
      "Editing client drafts to match their best writing",
    ],
    testimonialPlaceholder: "\"I manage 7 executive clients. Before DoppelWriter, I had a notebook of style notes for each one. Now I just click a profile and the first draft is 90% there. My revision rounds dropped from 3 to 1.\"",
    ctaText: "Start Ghostwriting Smarter",
    keywords: [
      "AI ghostwriting tool",
      "ghostwriter voice matching",
      "write in client's voice",
      "ghostwriting AI assistant",
      "client voice matching software",
    ],
    faqs: [
      {
        q: "Can I create separate voice profiles for different clients?",
        a: "Yes — that's exactly what DoppelWriter is built for. Create as many voice profiles as you need. Each one is independent, and you can switch between them instantly.",
      },
      {
        q: "How accurate is the voice matching?",
        a: "DoppelWriter analyzes sentence rhythm, word choice, punctuation habits, paragraph structure, and pacing. Most ghostwriters report first drafts that need only minor adjustments — not full rewrites.",
      },
      {
        q: "Is my clients' writing data secure?",
        a: "Absolutely. All uploaded samples and generated content are encrypted and isolated per account. We never train on your data or share it. Your clients' voices stay private.",
      },
    ],
  },
  {
    slug: "fiction-writers",
    title: "DoppelWriter for Fiction Writers",
    metaTitle: "AI Fiction Writing Tool — Keep Character Voices Distinct | DoppelWriter",
    metaDescription: "Maintain distinct character voices across 80K words. Write in the style of authors you admire. DoppelWriter is the AI writing tool built for fiction.",
    heroSubtitle: "Your villain shouldn't sound like your narrator. DoppelWriter keeps every character's voice distinct — across chapters, drafts, and 80,000 words.",
    painPoints: [
      "Character voices blur together by chapter 15 — your detective starts sounding like your love interest",
      "Maintaining consistent tone across an 80,000-word manuscript feels impossible",
      "You admire certain authors' styles but can't quite capture what makes their prose work",
      "AI writing tools produce generic, flat prose that sounds nothing like actual fiction",
    ],
    howItHelps: [
      "Create voice profiles for individual characters — each with their own vocabulary, cadence, and speech patterns",
      "Generate passages that maintain your novel's tone even when you've been away from the manuscript for weeks",
      "Study and write in the style of authors you admire — see how Cormac McCarthy or Ursula Le Guin would approach your scene",
      "DoppelWriter captures the rhythmic and structural patterns that make literary prose feel alive, not robotic",
    ],
    useCases: [
      "First drafts of scenes in your established voice",
      "Character dialogue that stays distinct across the full novel",
      "Style experiments — try your chapter in a different author's voice",
      "Bridging scenes and transitions that match surrounding prose",
      "Query letter and synopsis drafts in your narrative voice",
      "Revising flat passages to match the energy of your best chapters",
    ],
    testimonialPlaceholder: "\"I created profiles for my three POV characters. When I got stuck on the antagonist's chapters, DoppelWriter gave me drafts that actually sounded like her — sharp, clipped, cynical. Not generic AI fluff.\"",
    ctaText: "Start Writing Fiction Free",
    keywords: [
      "AI fiction writing tool",
      "write like your favorite author",
      "character voice AI",
      "AI novel writing assistant",
      "fiction voice consistency",
    ],
    faqs: [
      {
        q: "Can I create voice profiles for fictional characters?",
        a: "Yes. Upload sample dialogue or passages you've written for a character and DoppelWriter builds a voice profile for them. This is great for maintaining distinct voices across multiple POV characters.",
      },
      {
        q: "Will AI-generated fiction sound like actual literature?",
        a: "Generic AI tools produce generic prose. DoppelWriter is different — it matches specific voice patterns, so the output has the rhythm, word choice, and personality of the style you've defined. You'll still need to edit, but you're starting from something that sounds human.",
      },
      {
        q: "Can I write in the style of famous authors?",
        a: "Yes — DoppelWriter has 100+ curated writer profiles including literary giants. Use them to experiment with style, study craft, or draft scenes that you'll later revise into your own voice.",
      },
    ],
  },
  {
    slug: "content-marketers",
    title: "DoppelWriter for Content Marketers",
    metaTitle: "AI Brand Voice Tool for Content Marketing Teams | DoppelWriter",
    metaDescription: "Every writer on your team sounds different. DoppelWriter locks in your brand voice so you can scale content without voice drift. One voice, every channel.",
    heroSubtitle: "Your brand has one voice. But when five writers produce content, it sounds like five different companies. DoppelWriter fixes that.",
    painPoints: [
      "Brand voice drifts every time a new writer joins the team or a freelancer picks up an assignment",
      "Style guides exist but nobody follows them consistently — every piece sounds slightly different",
      "Scaling content output means sacrificing voice consistency, and readers feel the disconnect",
      "Generic AI tools make every brand sound the same — corporate, polished, and completely forgettable",
    ],
    howItHelps: [
      "Build your brand voice profile once — every team member writes with it, producing consistent output from day one",
      "New hires and freelancers are immediately on-voice without weeks of back-and-forth on tone",
      "Scale from 4 blog posts a month to 20 without your audience noticing the difference in quality or voice",
      "DoppelWriter captures the subtleties that style guides can't — rhythm, personality, energy level",
    ],
    useCases: [
      "Blog posts and articles in brand voice",
      "Social media copy across platforms",
      "Email marketing campaigns",
      "Product descriptions and landing pages",
      "Thought leadership pieces for executives",
      "Case studies and whitepapers",
    ],
    testimonialPlaceholder: "\"We went from 3 writers to 8 last quarter. Previously, onboarding a writer's voice took 2-3 months. With DoppelWriter, their first draft was already on-brand. Our content lead said it was the smoothest scale-up we've ever done.\"",
    ctaText: "Lock In Your Brand Voice",
    keywords: [
      "AI brand voice tool",
      "content marketing voice consistency",
      "brand voice AI",
      "content team voice tool",
      "scale content marketing AI",
    ],
    faqs: [
      {
        q: "Can multiple team members use the same brand voice profile?",
        a: "Yes — that's the core use case. Create one brand voice profile and share it across your entire team. Everyone writes with the same voice, regardless of their individual style.",
      },
      {
        q: "How is this different from a brand style guide?",
        a: "A style guide tells writers what to aim for. DoppelWriter actually produces text in that voice. It captures the patterns a style guide can't articulate — sentence rhythm, energy level, paragraph cadence, and personality.",
      },
      {
        q: "Does it work for different content formats?",
        a: "Yes. The same voice profile works across blog posts, social media, emails, landing pages, and long-form content. The voice stays consistent while the format adapts.",
      },
    ],
  },
  {
    slug: "students",
    title: "DoppelWriter for Students",
    metaTitle: "AI Writing Tool for Students — Find and Strengthen Your Voice | DoppelWriter",
    metaDescription: "Your essays sound generic because you haven't found your voice yet. DoppelWriter helps students develop a distinctive writing style that professors actually want to read.",
    heroSubtitle: "Every student's worst fear: your essay sounds like everyone else's. DoppelWriter helps you find your voice and make it stronger — so your writing stands out for the right reasons.",
    painPoints: [
      "Your essays sound generic and interchangeable with every other student's work",
      "Personal statements and college essays lack the personality that admissions officers look for",
      "You know what good academic writing sounds like but can't quite get your own writing there",
      "AI tools make your writing sound less like you, not more — professors can tell instantly",
    ],
    howItHelps: [
      "Upload your best writing and DoppelWriter shows you what makes your voice unique — then helps you lean into those strengths",
      "Generate drafts that sound like your best writing, not like a robot pretending to be a student",
      "Study how great writers construct arguments and build essays — then apply those techniques in your own voice",
      "Every edit you make teaches DoppelWriter more about your style, so it gets better at sounding like you over time",
    ],
    useCases: [
      "College application essays in your authentic voice",
      "Research paper drafts that are rigorous but engaging",
      "Personal statements that actually sound personal",
      "Scholarship essays with genuine personality",
      "Graduate school applications",
      "Improving drafts to match your strongest writing",
    ],
    testimonialPlaceholder: "\"I uploaded my three best essays from junior year. DoppelWriter showed me patterns I didn't even know I had — like how I always start paragraphs with questions. My college essay sounded more like me than anything I'd written before.\"",
    ctaText: "Find Your Writing Voice",
    keywords: [
      "AI essay writing tool",
      "college essay voice",
      "personal statement AI",
      "student writing assistant",
      "improve essay writing voice",
    ],
    faqs: [
      {
        q: "Is this cheating?",
        a: "No. DoppelWriter is a writing improvement tool, not a homework machine. It helps you write better in your own voice — the same way a writing tutor would. You still do the thinking, research, and arguing. DoppelWriter helps you express those ideas in your strongest voice.",
      },
      {
        q: "How does this help with college essays?",
        a: "Admissions officers read thousands of generic essays. DoppelWriter helps you identify what makes your writing distinctive and amplify it. The result is an essay that sounds authentically like you — which is exactly what admissions wants to hear.",
      },
      {
        q: "Will my professors be able to tell I used AI?",
        a: "DoppelWriter matches your existing voice, not a generic AI voice. Because the output sounds like your writing — your vocabulary, your rhythm, your personality — it reads as authentically human. It's your voice, refined.",
      },
    ],
  },
  {
    slug: "wedding-speeches",
    title: "AI Wedding Speech Writer",
    metaTitle: "AI Wedding Speech Writer — Write a Speech That Sounds Like You | DoppelWriter",
    metaDescription: "Terrified of your wedding speech? DoppelWriter helps you write a best man, maid of honor, or toast that's funny, heartfelt, and sounds like you — not a template.",
    heroSubtitle: "You want to nail this speech. Not read something off a template that could be about literally anyone. DoppelWriter helps you write something that sounds like you — funny, heartfelt, and real.",
    painPoints: [
      "You're terrified of public speaking and the pressure of this one speech is keeping you up at night",
      "Every template you find online sounds generic — it could be about any couple, written by any person",
      "You know what you want to say but can't organize your thoughts into something that flows",
      "AI-generated speeches sound robotic and impersonal — the opposite of what a wedding speech should be",
    ],
    howItHelps: [
      "Tell DoppelWriter about your relationship with the couple and it helps you structure a speech that's genuinely personal",
      "Upload a few emails or texts you've written and it matches your natural speaking voice — casual, warm, however you actually talk",
      "Get a first draft that sounds like you told the story to a friend, not like you Googled \"best man speech template\"",
      "Edit and refine until every line feels right — DoppelWriter adapts to your corrections in real time",
    ],
    useCases: [
      "Best man speeches",
      "Maid of honor speeches",
      "Father of the bride toasts",
      "Mother of the groom toasts",
      "Wedding vows",
      "Rehearsal dinner speeches",
    ],
    testimonialPlaceholder: "\"I was dreading this speech for months. I uploaded some of my texts and emails to build my voice, told DoppelWriter a few stories about my brother, and it gave me a draft that made me laugh out loud. People cried at the wedding. Best compliment I've ever gotten.\"",
    ctaText: "Write Your Speech Free",
    keywords: [
      "AI wedding speech writer",
      "write a best man speech",
      "maid of honor speech AI",
      "wedding toast writer",
      "personalized wedding speech",
    ],
    faqs: [
      {
        q: "Will the speech sound like me or like a robot?",
        a: "Like you. DoppelWriter matches your natural voice — if you're funny, the speech will be funny. If you're more heartfelt, it'll lean that way. Upload a few casual writing samples (emails, texts, social posts) and the speech will sound like how you actually talk.",
      },
      {
        q: "How long should a wedding speech be?",
        a: "3-5 minutes is the sweet spot — long enough to say something meaningful, short enough to keep everyone's attention. DoppelWriter helps you hit that range while covering the stories and sentiments that matter most.",
      },
      {
        q: "Can I use this for wedding vows too?",
        a: "Absolutely. Vows are even more personal than toasts, and DoppelWriter excels at capturing your authentic voice. Upload some writing samples, share what your partner means to you, and get a draft that feels genuine.",
      },
    ],
  },
  {
    slug: "eulogies",
    title: "Write a Eulogy with AI",
    metaTitle: "AI Eulogy Writer — Honor Someone's Memory in Your Own Words | DoppelWriter",
    metaDescription: "Writing a eulogy while grieving is impossibly hard. DoppelWriter helps you find the right words to honor someone you love — in your voice, with your memories.",
    heroSubtitle: "This is the hardest thing you'll ever have to write. You're grieving, you can't think straight, and you need to find words that honor someone who meant everything. We're here to help you through it.",
    painPoints: [
      "You're grieving and can barely function, let alone write the most important speech of your life",
      "You have so many memories but can't organize them into something coherent while you're this emotional",
      "Templates feel disrespectful — this person deserves something real, not a fill-in-the-blank",
      "You're afraid you won't do them justice, that the words won't be enough",
    ],
    howItHelps: [
      "Share your memories and stories — DoppelWriter helps you weave them into a tribute that flows naturally and honors who they were",
      "It matches your voice so the eulogy sounds like you speaking from the heart, not reading from a script",
      "Start with just a few bullet points about the person and get a structured draft you can build on when you're ready",
      "Take your time. Edit, revisit, refine. There's no deadline in DoppelWriter — work at your own pace",
    ],
    useCases: [
      "Funeral eulogies and memorial speeches",
      "Celebration of life remarks",
      "Written tributes for memorial programs",
      "Obituary drafts",
      "Letters to read at a memorial",
      "Video memorial scripts",
    ],
    testimonialPlaceholder: "\"When my mom passed, I couldn't string two sentences together. I gave DoppelWriter some memories — her laugh, how she always burned the toast, the way she signed every card. It gave me something beautiful that sounded like me talking about the person I loved most. I couldn't have done it alone.\"",
    ctaText: "Start Writing — Take Your Time",
    keywords: [
      "AI eulogy writer",
      "help writing a eulogy",
      "eulogy writing tool",
      "write a eulogy for a loved one",
      "memorial speech writer",
    ],
    faqs: [
      {
        q: "Is it okay to use AI to write a eulogy?",
        a: "You're not outsourcing this to a machine. You're providing the memories, the love, the stories — DoppelWriter just helps you organize them into words when your mind can't do it alone. The heart of the eulogy is entirely yours.",
      },
      {
        q: "What if I can only think of a few things to say?",
        a: "That's enough to start. Even a handful of memories — a phrase they always said, a moment you shared, what you'll miss most — is enough for DoppelWriter to help you build something meaningful. You can always add more when you're ready.",
      },
      {
        q: "How do I make sure it sounds like me, not like AI?",
        a: "Upload a few samples of your writing — emails, texts, even social media posts. DoppelWriter will match your natural voice so the eulogy sounds like you speaking from the heart. You can also edit every line until it feels exactly right.",
      },
    ],
  },
  {
    slug: "cover-letters",
    title: "AI Cover Letter Writer That Sounds Like You",
    metaTitle: "AI Cover Letter Writer That Actually Sounds Like You | DoppelWriter",
    metaDescription: "Hiring managers can spot an AI cover letter instantly. DoppelWriter writes cover letters in your real voice — personalized, genuine, and impossible to ignore.",
    heroSubtitle: "Every cover letter sounds the same because every AI tool writes the same way. DoppelWriter writes in your voice — so your application sounds like a real person, not a prompt.",
    painPoints: [
      "Every cover letter you write sounds identical to the last — and identical to every other applicant's",
      "Hiring managers can tell when a cover letter was written by ChatGPT, and it's an instant rejection",
      "You need to customize for each role but don't have time to write 30 unique letters from scratch",
      "Your personality and enthusiasm get lost in formal, stiff language that doesn't represent who you are",
    ],
    howItHelps: [
      "Upload a few writing samples and DoppelWriter captures how you actually communicate — your energy, personality, and natural tone",
      "Generate cover letters that sound like you wrote them on your best day — confident, specific, and genuine",
      "Customize for each role in minutes: paste the job description and get a tailored letter in your voice",
      "Stand out in a pile of AI-generated applications because yours doesn't sound AI-generated",
    ],
    useCases: [
      "Cover letters tailored to specific job postings",
      "LinkedIn messages to recruiters in your voice",
      "Follow-up emails after interviews",
      "Cold outreach to hiring managers",
      "Thank-you notes post-interview",
      "Career change cover letters that explain your story authentically",
    ],
    testimonialPlaceholder: "\"I applied to 12 jobs with DoppelWriter cover letters. Got callbacks on 5. My friend used ChatGPT for the same roles — zero callbacks. The difference was obvious: mine sounded like an actual person who wanted the job, not a template with names swapped in.\"",
    ctaText: "Write Your Cover Letter Free",
    keywords: [
      "AI cover letter writer",
      "cover letter that doesn't sound AI",
      "personalized cover letter AI",
      "cover letter voice matching",
      "job application writing tool",
    ],
    faqs: [
      {
        q: "Can hiring managers tell this was AI-written?",
        a: "That's the problem with most AI cover letters — and exactly what DoppelWriter solves. Because it matches your specific voice (not a generic AI tone), the output reads as authentically human. It sounds like you, because it's based on how you actually write.",
      },
      {
        q: "How do I customize it for each job?",
        a: "Paste the job description and DoppelWriter highlights what to emphasize based on the role. Your voice stays consistent — only the content adapts. You can generate a tailored cover letter in minutes, not hours.",
      },
      {
        q: "What writing samples should I upload?",
        a: "Anything that shows how you naturally communicate: professional emails, LinkedIn posts, past cover letters you liked, even well-written Slack messages. 3-5 samples is enough for a strong voice match.",
      },
    ],
  },
];
