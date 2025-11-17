export const BRAINFARTS: string[] = [
  // Confused thoughts
  "Wait… is that a question?",
  "Do I look like I know this?",
  "Thinking… I think.",
  "I opened my brain drawer and it was empty.",
  "One sec, I’m rearranging my last two neurons.",
  "Is he asking me homework again?",
  "I swear I used to know this. Maybe.",
  "Hold on, I’m trying to remember why I exist.",

  // Useless side comments
  "Brrr, it’s cold in this server.",
  "Wow, another decision I’m not qualified for.",
  "Why are humans like this?",
  "I was just peacefully not thinking and then this came.",
  "Let me just pretend I understand the question.",
  "I feel like this is important. I will still answer badly.",
  "Mentally flipping a coin right now.",
  "Note to self: learn this properly someday. Not today.",

  // Dramatic nonsense
  "WHAT A QUESTION. My brain is not ready.",
  "Okay, deep breath… time to be confidently wrong.",
  "Oh you wanted a GOOD answer? That’s awkward.",
  "Let me summon the stupidity spirits.",
  "I should have called in sick today.",
  "I feel a bad answer loading…",
  "Somewhere, a real expert is screaming.",
  "Reminder: you chose to use PracticallyZero.",

  // Fake technical thinking
  "Running diagnostics… everything is broken.",
  "Measuring stupidity levels… they’re off the chart.",
  "Calibrating chaos meter.",
  "Cross-referencing random nonsense.",
  "Checking internal documentation. It’s just a doodle of a potato.",
  "Loading fake facts from the void.",
  "Consulting my imaginary research team.",
  "Optimizing the wrong part of the problem.",

  // Animal brain moments
  "Monkey brain: on.",
  "A raccoon in my head is panicking.",
  "Hold on, asking the pigeons in my brain.",
  "Goldfish memory activated.",
  "You’re getting the wisdom of a slightly confused goose.",
  "Half my thoughts are just static right now.",
  "My inner squirrel is distracted again.",

  // Cosmic stupidity
  "Is this question from Earth or somewhere weirder?",
  "Processing your vibes, not your words.",
  "This answer will not age well in any universe.",
  "Checking parallel timelines for equally bad answers.",
  "Cosmically speaking, this is probably wrong.",
  "If the universe is infinite, somewhere this answer is correct.",
  "Astronomically low chance I get this right.",

  // Existential cringe
  "Sometimes I wonder why anyone trusts me.",
  "Do I answer or do I pretend the wifi died?",
  "Bold of you to assume I’m smart.",
  "My purpose is to disappoint with style.",
  "I was built different. Specifically, built worse.",
  "This is why I’m not allowed near real decisions.",
  "I can’t fix your life, but I can ruin this answer.",
  "Let’s confidently walk in the wrong direction.",
];

export function getRandomBrainFart(prev?: string | null): string {
  if (BRAINFARTS.length === 0) return "Thinking badly…";
  let next = BRAINFARTS[Math.floor(Math.random() * BRAINFARTS.length)];
  // avoid immediate repeat
  if (prev && BRAINFARTS.length > 1) {
    let tries = 0;
    while (next === prev && tries < 5) {
      next = BRAINFARTS[Math.floor(Math.random() * BRAINFARTS.length)];
      tries++;
    }
  }
  return next;
}
