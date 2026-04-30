// Real Claude outputs captured via scripts/capture-voice-samples.ts on
// 2026-04-30 using the same model and brief as /api/demo. These are the
// canonical samples consumed by HomepageCinematic and MarketingFilm.
//
// Brief: "Write a paragraph about why the best ideas come when you're not trying"

export type VoiceSample = {
  writer: string;
  slug: string;
  photoSlug: string; // matches /public/writers/{slug}.{jpg,png}
  cadenceLabel: string; // shown as eyebrow on each card
  sample: string;
};

export const VOICE_SAMPLES: VoiceSample[] = [
  {
    writer: "Joan Didion",
    slug: "joan-didion",
    photoSlug: "joan-didion",
    cadenceLabel: "22-word avg · long recursive lines",
    sample:
      "The best ideas come when you're not trying, which is another way of saying they come when you have stopped performing the act of thinking and have instead allowed the mind to return to its own rhythms, the way one allows a horse to find its way home in the dark. I have noticed that my own ideas arrive in the shower, or on the freeway between the San Bernardino exit and the merge toward LAX, or in the specific quality of boredom that descends at a dinner party in Brentwood when someone is explaining their position on interest rates — which is to say they arrive precisely when I have abandoned the notion that I am the kind of person who has ideas worth having.",
  },
  {
    writer: "Ernest Hemingway",
    slug: "ernest-hemingway",
    photoSlug: "ernest-hemingway",
    cadenceLabel: "8-word avg · short declarative",
    sample:
      "The best ideas came when you walked. Or when you were in the shower. Or when you were looking at the water. You did not sit at the desk and wait for them. That was no good. You could sit there all day and nothing would come and you would feel bad. But then you would go out and walk by the river and you would not think about the problem and the idea would be there.",
  },
  {
    writer: "Paul Graham",
    slug: "paul-graham",
    photoSlug: "paul-graham",
    cadenceLabel: "15-word avg · analytical essay",
    sample:
      "The reason the best ideas come when you're not trying is that your conscious mind is terrible at making novel connections but excellent at getting in the way. When you're actively trying to solve a problem, you're basically running a search through familiar territory — the same neural pathways you've worn smooth through repetition. But when you're in the shower or walking the dog, your unconscious mind starts doing something more like annealing in metallurgy: it lets connections form at random and keeps the ones that reduce tension in your overall mental model.",
  },
  {
    writer: "Barack Obama",
    slug: "barack-obama",
    photoSlug: "barack-obama",
    cadenceLabel: "rule-of-three · measured oratory",
    sample:
      "Look, we've all been there — you're wrestling with a problem at your desk, grinding through draft after draft, proposal after proposal, and nothing quite clicks. Then you step away. You're out for a walk, or you're washing dishes, or you're throwing a ball with your kid in the backyard, and suddenly — there it is. The answer you've been chasing reveals itself, not because you forced it, but because you made room for it.",
  },
  {
    writer: "Toni Morrison",
    slug: "toni-morrison",
    photoSlug: "toni-morrison",
    cadenceLabel: "musical, weighted · oral tradition",
    sample:
      "The best ideas arrive like uninvited grace, slipping through the mind's unguarded door when vigilance has gone slack and the soul sits idle in its own quiet company — peeling an orange, say, or watching rain bead and merge on glass, the fingers doing their small work while the brain lies fallow as turned earth in winter. It is then, in that deliberate inattention, that knowing rises up whole and gleaming from wherever it is such things wait.",
  },
];

export const VOICE_SAMPLE_BRIEF =
  "Write a paragraph about why the best ideas come when you're not trying";

// Convenience: the 3 used in HomepageCinematic's hero strip.
export const HERO_VOICE_SAMPLES: VoiceSample[] = [
  VOICE_SAMPLES[0], // Didion
  VOICE_SAMPLES[1], // Hemingway
  VOICE_SAMPLES[2], // Paul Graham
];
