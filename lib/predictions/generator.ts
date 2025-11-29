// Kabbalah Prediction Generator

const LIFE_DOMAINS = [
  { id: "career", name: "Career & Purpose", hebrew: "פרנסה" },
  { id: "love", name: "Love & Relationships", hebrew: "אהבה" },
  { id: "health", name: "Health & Vitality", hebrew: "בריאות" },
  { id: "wealth", name: "Wealth & Abundance", hebrew: "עושר" },
  { id: "family", name: "Family & Home", hebrew: "משפחה" },
  { id: "creativity", name: "Creativity & Expression", hebrew: "יצירה" },
  { id: "spirituality", name: "Spirituality & Growth", hebrew: "רוחניות" },
  { id: "knowledge", name: "Knowledge & Wisdom", hebrew: "חכמה" },
  { id: "community", name: "Community & Service", hebrew: "קהילה" },
  { id: "transformation", name: "Transformation", hebrew: "שינוי" },
  { id: "protection", name: "Protection & Safety", hebrew: "הגנה" },
  { id: "manifestation", name: "Manifestation", hebrew: "התגשמות" },
]

const SEPHIROT = [
  { id: 1, name: "Kether", meaning: "Crown", energy: "Divine Will" },
  { id: 2, name: "Chokmah", meaning: "Wisdom", energy: "Creative Force" },
  { id: 3, name: "Binah", meaning: "Understanding", energy: "Form & Structure" },
  { id: 4, name: "Chesed", meaning: "Loving-kindness", energy: "Expansion" },
  { id: 5, name: "Gevurah", meaning: "Strength", energy: "Discipline" },
  { id: 6, name: "Tiphereth", meaning: "Beauty", energy: "Harmony" },
  { id: 7, name: "Netzach", meaning: "Victory", energy: "Persistence" },
  { id: 8, name: "Hod", meaning: "Splendor", energy: "Communication" },
  { id: 9, name: "Yesod", meaning: "Foundation", energy: "Connection" },
  { id: 10, name: "Malkuth", meaning: "Kingdom", energy: "Manifestation" },
]

const ARCHETYPES = [
  "The Warrior",
  "The Sage",
  "The Healer",
  "The Creator",
  "The Ruler",
  "The Lover",
  "The Seeker",
  "The Magician",
  "The Innocent",
  "The Rebel",
  "The Caregiver",
  "The Jester",
]

const ACTIONS = [
  "embrace",
  "release",
  "cultivate",
  "transform",
  "protect",
  "illuminate",
  "balance",
  "strengthen",
  "surrender",
  "initiate",
  "complete",
  "connect",
  "separate",
  "unite",
  "transcend",
  "ground",
  "elevate",
  "purify",
]

const PREDICTIONS_TEMPLATES = [
  "The {sephira} energy flows through your {domain}. {action} the {quality} within you.",
  "Today, {sephira} guides your path in {domain}. Your inner {archetype} calls you to {action}.",
  "Sacred vibrations of {sephira} illuminate your {domain}. {action} what no longer serves you.",
  "The Tree of Life reveals: {sephira} awakens in your {domain}. {action} with wisdom.",
  "Your destiny number {number} resonates with {sephira}. In matters of {domain}, {action} boldly.",
]

export interface Prediction {
  code: string
  domain: (typeof LIFE_DOMAINS)[number]
  sephira: (typeof SEPHIROT)[number]
  archetype: string
  action: string
  message: string
  date: string
}

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
}

export function generatePrediction(walletAddress: string, walletNumber: number, date: Date = new Date()): Prediction {
  // Create seed from wallet + date
  const dateStr = date.toISOString().split("T")[0]
  const seedString = walletAddress.toLowerCase() + dateStr
  let seed = 0
  for (let i = 0; i < seedString.length; i++) {
    seed = (seed << 5) - seed + seedString.charCodeAt(i)
    seed = seed & seed
  }

  const random = seededRandom(Math.abs(seed))

  // Select elements based on seeded random
  const domain = LIFE_DOMAINS[Math.floor(random() * LIFE_DOMAINS.length)]
  const sephira = SEPHIROT[Math.floor(random() * SEPHIROT.length)]
  const archetype = ARCHETYPES[Math.floor(random() * ARCHETYPES.length)]
  const action = ACTIONS[Math.floor(random() * ACTIONS.length)]
  const template = PREDICTIONS_TEMPLATES[Math.floor(random() * PREDICTIONS_TEMPLATES.length)]

  // Generate unique code
  const codeHash = Math.abs(seed).toString(16).slice(0, 6)
  const code = `KC-${codeHash}`

  // Build message
  const message = template
    .replace("{sephira}", sephira.name)
    .replace("{domain}", domain.name.toLowerCase())
    .replace("{action}", action.charAt(0).toUpperCase() + action.slice(1))
    .replace("{archetype}", archetype)
    .replace("{quality}", sephira.energy.toLowerCase())
    .replace("{number}", walletNumber.toString())

  return {
    code,
    domain,
    sephira,
    archetype,
    action,
    message,
    date: dateStr,
  }
}

export function generateShareText(prediction: Prediction): string {
  return `${prediction.message}

${prediction.code} #KabbalahCode

Discover your destiny: kabbalahcode.app`
}
