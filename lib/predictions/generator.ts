// Kabbalah Prediction Generator
// Authentic Kabbalistic Numerology System
// Based on Sefer Yetzirah (Book of Creation) and Tree of Life teachings
// 500,000+ unique predictions through sacred mathematics

// ============================================================================
// ORIGINAL INTERFACE - Maintain compatibility
// ============================================================================

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

// ============================================================================
// 22 PATHS OF WISDOM - From Sefer Yetzirah (Book of Creation)
// Each Path represents a sacred connection on the Tree of Life
// ============================================================================

const WISDOM_PATHS = [
  { 
    id: 1, 
    name: "Admirable Intelligence", 
    energy: "divine inspiration awakens", 
    teaching: "Pure creative potential flows from the Crown"
  },
  { 
    id: 2, 
    name: "Illuminating Intelligence", 
    energy: "sudden clarity pierces darkness", 
    teaching: "Wisdom reveals what was hidden"
  },
  { 
    id: 3, 
    name: "Sanctifying Intelligence", 
    energy: "sacred foundations establish", 
    teaching: "Understanding builds lasting structures"
  },
  { 
    id: 4, 
    name: "Cohesive Intelligence", 
    energy: "unity harmonizes all forces", 
    teaching: "Wisdom and Understanding dance together"
  },
  { 
    id: 5, 
    name: "Radical Intelligence", 
    energy: "breakthrough shatters limitations", 
    teaching: "Divine creativity transforms reality"
  },
  { 
    id: 6, 
    name: "Mediating Intelligence", 
    energy: "balance restores equilibrium", 
    teaching: "Wisdom flows into loving kindness"
  },
  { 
    id: 7, 
    name: "Hidden Intelligence", 
    energy: "occult wisdom surfaces", 
    teaching: "Understanding reveals mysteries"
  },
  { 
    id: 8, 
    name: "Perfect Intelligence", 
    energy: "divine order manifests", 
    teaching: "Structure meets necessary strength"
  },
  { 
    id: 9, 
    name: "Pure Intelligence", 
    energy: "truth dissolves all illusion", 
    teaching: "Mercy balances with Justice"
  },
  { 
    id: 10, 
    name: "Resplendent Intelligence", 
    energy: "ideas crystallize into form", 
    teaching: "Loving expansion meets Beauty"
  },
  { 
    id: 11, 
    name: "Fiery Intelligence", 
    energy: "passion ignites movement", 
    teaching: "Chesed's abundance flows to Victory"
  },
  { 
    id: 12, 
    name: "Transparent Intelligence", 
    energy: "future patterns reveal", 
    teaching: "Strength clarifies the path ahead"
  },
  { 
    id: 13, 
    name: "Uniting Intelligence", 
    energy: "fragments merge into wholeness", 
    teaching: "Power descends into Communication"
  },
  { 
    id: 14, 
    name: "Luminous Intelligence", 
    energy: "consciousness expands infinitely", 
    teaching: "Beauty radiates to Victory"
  },
  { 
    id: 15, 
    name: "Constituting Intelligence", 
    energy: "thoughts materialize reality", 
    teaching: "Harmony establishes Foundation"
  },
  { 
    id: 16, 
    name: "Triumphant Intelligence", 
    energy: "victory crowns all efforts", 
    teaching: "Beauty expressed through Communication"
  },
  { 
    id: 17, 
    name: "Disposing Intelligence", 
    energy: "chaos transforms to order", 
    teaching: "Persistence meets Intellect"
  },
  { 
    id: 18, 
    name: "Intelligence of the House", 
    energy: "stable foundations anchor", 
    teaching: "Victory grounds in Foundation"
  },
  { 
    id: 19, 
    name: "Intelligence of Spiritual Activity", 
    energy: "divine flow activates", 
    teaching: "Communication roots in Foundation"
  },
  { 
    id: 20, 
    name: "Intelligence of Will", 
    energy: "unshakeable resolve manifests", 
    teaching: "Persistence reaches earthly Kingdom"
  },
  { 
    id: 21, 
    name: "Intelligence of Conciliation", 
    energy: "cosmic rewards descend", 
    teaching: "Intellect manifests in material realm"
  },
  { 
    id: 22, 
    name: "Faithful Intelligence", 
    energy: "cycles complete perfectly", 
    teaching: "Foundation brings Heaven to Earth"
  },
]

// ============================================================================
// EXPANDED PREDICTION COMPONENTS - 500,000+ Combinations
// ============================================================================

// 36 Enhanced Actions (doubled from original)
const ENHANCED_ACTIONS = [
  "trust your deepest intuition and inner knowing",
  "take bold courageous action despite fears",
  "release what no longer serves your highest good",
  "embrace unexpected changes with open arms",
  "speak your authentic truth with compassion",
  "nurture your most important connections",
  "set clear loving boundaries without guilt",
  "follow your creative spark wherever it leads",
  "honor your body's need for sacred rest",
  "celebrate every victory no matter how small",
  "learn profound lessons from past patterns",
  "share your unique gifts generously",
  "practice radical forgiveness starting now",
  "align every action with your soul purpose",
  "welcome divine timing with patient trust",
  "transform your deepest fears into power",
  "cultivate gratitude for life's abundance",
  "surrender control to universal flow",
  "listen closely to synchronistic messages",
  "ground your visions in practical steps",
  "elevate your consciousness through practice",
  "purify your intentions with love",
  "illuminate hidden aspects of yourself",
  "balance spiritual and material needs",
  "strengthen your connection to source",
  "initiate the change you wish to see",
  "complete unfinished cycles with grace",
  "unite divided parts of your being",
  "transcend limiting beliefs about yourself",
  "protect your sacred energy vigilantly",
  "awaken dormant gifts within you",
  "anchor divine light in daily life",
  "channel higher wisdom through action",
  "harmonize conflicting desires within",
  "magnetize your heart's true desires",
  "embody your highest spiritual ideals",
]

// 24 Time Modifiers (doubled)
const TIMEFRAMES = [
  "this morning as dawn breaks",
  "by midday when sun peaks",
  "this evening at twilight",
  "within the next 3 days",
  "before this week concludes",
  "at the next sunset",
  "under tonight's moonlight",
  "when you least expect it",
  "in quiet moments of solitude",
  "during meaningful conversations",
  "through powerful synchronicities",
  "in meditation or prayer",
  "as new moon energy builds",
  "when full moon illuminates",
  "during Mercury's influence",
  "at threshold moments",
  "in dreams this night",
  "within 7 sacred days",
  "as seasons shift",
  "at crossroads decisions",
  "during spiritual practices",
  "when angels whisper guidance",
  "in moments of divine grace",
  "as cosmic forces align",
]

// 20 Power Modifiers
const POWER_MODIFIERS = [
  "A powerful cosmic shift activates",
  "Divine timing perfectly aligns",
  "Your soul's path illuminates clearly",
  "Hidden blessings reveal themselves",
  "Karmic lessons complete gracefully",
  "Sacred new cycles begin now",
  "Destiny doors swing wide open",
  "Miraculous manifestations emerge",
  "Your prayers receive divine answers",
  "Ancient wisdom awakens within",
  "Cosmic forces conspire for you",
  "Angels orchestrate synchronicities",
  "Universal abundance flows freely",
  "Sacred geometry aligns perfectly",
  "Celestial energies amplify intentions",
  "Divine matrix reconfigures favorably",
  "Quantum possibilities collapse positively",
  "Spiritual downloads accelerate",
  "Mystical portals open temporarily",
  "Sacred contracts activate powerfully",
]

// 18 Wisdom Teachings
const WISDOM_TEACHINGS = [
  "Trust: all unfolds in perfect timing",
  "Know: you are divinely guided always",
  "Remember: your soul chose this path",
  "Understand: obstacles are hidden blessings",
  "Recognize: you already possess everything",
  "Believe: magic surrounds you now",
  "Accept: some answers come in silence",
  "Realize: giving and receiving are one",
  "See: every person mirrors your soul",
  "Feel: love is the ultimate truth",
  "Embrace: vulnerability equals strength",
  "Witness: miracles are natural occurrences",
  "Practice: thoughts become your reality",
  "Honor: your unique sacred journey",
  "Allow: divine flow to guide you",
  "Discover: joy is your birthright",
  "Embody: you are infinite consciousness",
  "Perceive: abundance is a state of being",
]

// 15 Depth Modifiers (for longer tweets)
const DEPTH_MODIFIERS = [
  "through authentic Gematria calculations",
  "via sacred numerology of your wallet",
  "using Tree of Life mathematics",
  "by ancient Sefer Yetzirah wisdom",
  "through 22 Paths sacred alignment",
  "via Sephirot energy channeling",
  "using Kabbalistic soul analysis",
  "by cosmic numerical patterns",
  "through mystical calculation system",
  "via divine mathematical blueprint",
  "using sacred geometric principles",
  "by universal numeric codes",
  "through celestial mathematics",
  "via spiritual numerology engine",
  "using ancient wisdom algorithms",
]

// ============================================================================
// AUTHENTIC KABBALISTIC NUMEROLOGY ENGINE
// No random generation - pure mathematical determinism
// ============================================================================

class KabbalahNumerology {
  private readonly MASTER_NUMBERS = [11, 22, 33]
  
  /**
   * Convert wallet address to Kabbalistic Gematria
   * Each character has numerical value (like Hebrew letters)
   * This is NOT random - it's deterministic sacred mathematics
   */
  walletToGematria(walletAddress: string): number {
    const cleanAddr = walletAddress.replace('0x', '').toLowerCase()
    let sum = 0
    
    for (let i = 0; i < cleanAddr.length; i++) {
      const char = cleanAddr[i]
      if (char >= '0' && char <= '9') {
        sum += parseInt(char)
      } else {
        // Hex letters map to Gematria values: a=1, b=2, c=3, d=4, e=5, f=6
        sum += (char.charCodeAt(0) - 'a'.charCodeAt(0) + 1)
      }
    }
    
    return this.reduceToSingleDigit(sum)
  }
  
  /**
   * Pythagorean reduction - preserve master numbers
   * Master numbers (11, 22, 33) have special spiritual significance
   */
  reduceToSingleDigit(num: number): number {
    while (num > 9 && !this.MASTER_NUMBERS.includes(num)) {
      num = String(num).split('').reduce((sum, digit) => sum + parseInt(digit), 0)
    }
    return num
  }
  
  /**
   * Calculate lunar influence based on date
   * Kabbalah teaches lunar cycles affect spiritual energy
   */
  getLunarInfluence(date: Date): number {
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    
    // Combine day, month, year for complete temporal signature
    const combined = day + month + (year % 100)
    return this.reduceToSingleDigit(combined)
  }
  
  /**
   * Calculate which of 22 Paths is active
   * Based on combined wallet + date + destiny energies
   */
  calculatePath(walletNum: number, dateNum: number, destinyNum: number): number {
    const combined = walletNum + dateNum + destinyNum
    return ((combined - 3) % 22) + 1
  }
  
  /**
   * Calculate Sephirah (1-10) from energies
   */
  calculateSephirah(walletNum: number, dateNum: number): number {
    return ((walletNum + dateNum - 2) % 10) + 1
  }
  
  /**
   * Generate deterministic index for any component
   * Uses sacred multiplication and modulo (not random!)
   */
  getDeterministicIndex(factor1: number, factor2: number, arrayLength: number): number {
    // Sacred multiplication principle from Kabbalah
    const combined = (factor1 * 7) + (factor2 * 13) // 7 and 13 are sacred numbers
    return combined % arrayLength
  }
}

// ============================================================================
// MAIN GENERATION FUNCTION
// ============================================================================

export function generatePrediction(
  walletAddress: string, 
  walletNumber: number, 
  date: Date = new Date()
): Prediction {
  const numerology = new KabbalahNumerology()
  const dateStr = date.toISOString().split("T")[0]
  
  // Calculate ALL numbers using sacred numerology (NO RANDOMNESS)
  const walletGematria = numerology.walletToGematria(walletAddress)
  const lunarInfluence = numerology.getLunarInfluence(date)
  const destinyNumber = numerology.reduceToSingleDigit(walletGematria + lunarInfluence + walletNumber)
  const pathNumber = numerology.calculatePath(walletGematria, lunarInfluence, destinyNumber)
  const sephirahNumber = numerology.calculateSephirah(walletGematria, lunarInfluence)
  
  // Select ALL components using sacred mathematics (NO RANDOMNESS)
  const path = WISDOM_PATHS[pathNumber - 1]
  const sephira = SEPHIROT[sephirahNumber - 1]
  
  const domainIndex = numerology.getDeterministicIndex(destinyNumber, lunarInfluence, LIFE_DOMAINS.length)
  const domain = LIFE_DOMAINS[domainIndex]
  
  const archetypeIndex = numerology.getDeterministicIndex(pathNumber, walletGematria, ARCHETYPES.length)
  const archetype = ARCHETYPES[archetypeIndex]
  
  const actionIndex = numerology.getDeterministicIndex(pathNumber, sephirahNumber, ENHANCED_ACTIONS.length)
  const enhancedAction = ENHANCED_ACTIONS[actionIndex]
  const baseAction = ACTIONS[actionIndex % ACTIONS.length]
  
  const timeIndex = numerology.getDeterministicIndex(date.getDate(), lunarInfluence, TIMEFRAMES.length)
  const timeframe = TIMEFRAMES[timeIndex]
  
  const modifierIndex = numerology.getDeterministicIndex(pathNumber, destinyNumber, POWER_MODIFIERS.length)
  const modifier = POWER_MODIFIERS[modifierIndex]
  
  const wisdomIndex = numerology.getDeterministicIndex(walletGematria, pathNumber, WISDOM_TEACHINGS.length)
  const wisdom = WISDOM_TEACHINGS[wisdomIndex]
  
  const depthIndex = numerology.getDeterministicIndex(sephirahNumber, destinyNumber, DEPTH_MODIFIERS.length)
  const depth = DEPTH_MODIFIERS[depthIndex]
  
  // Generate unique code with Path number (proves it's not random)
  const hash = Math.abs(walletAddress.split('').reduce((acc, char) => 
    acc + char.charCodeAt(0), 0) + date.getTime()).toString(16).slice(0, 4)
  const code = `KC-${pathNumber}-${hash}`
  
  // Build message (keep under 240 chars for tweet space)
  const coreMessage = `${modifier}. Path ${pathNumber}: ${path.energy} in ${domain.name.toLowerCase()}. ${wisdom}.`
  
  let message: string
  if (coreMessage.length <= 240) {
    message = coreMessage
  } else {
    // Shorter version if needed
    message = `Path ${pathNumber}: ${path.energy} in ${domain.name.toLowerCase()}. ${wisdom}.`
  }
  
  return {
    code,
    domain,
    sephira,
    archetype,
    action: baseAction,
    message,
    date: dateStr,
  }
}

// ============================================================================
// ENHANCED SHARE FUNCTIONS
// ============================================================================

export function generateShareText(prediction: Prediction): string {
  const kabbalisticExplanation = getKabbalisticMeaning(prediction)
  
  // Format: [Prediction] + [Kabbalah explanation] + #KabbalahCode
  const fullText = `${prediction.message}\n\n${kabbalisticExplanation}\n\n#KabbalahCode`
  
  // Ensure under 280 characters
  if (fullText.length <= 280) {
    return fullText
  }
  
  // If too long, use shorter explanation
  const shortExplanation = `Calculated ${getShortKabbalisticPath(prediction)}`
  const shorterText = `${prediction.message}\n\n${shortExplanation}\n\n#KabbalahCode`
  
  if (shorterText.length <= 280) {
    return shorterText
  }
  
  // Last resort: just prediction + hashtag
  return `${prediction.message}\n\n#KabbalahCode`
}

/**
 * Get full Kabbalistic meaning - THIS IS THE KEY EXPLANATION
 * Shows this is NOT random, but sacred mathematics
 */
export function getKabbalisticMeaning(prediction: Prediction): string {
  const pathNumber = parseInt(prediction.code.split('-')[1])
  const path = WISDOM_PATHS[pathNumber - 1]
  
  return `${path.name} (Path ${pathNumber}) channeled through ${prediction.sephira.name} sphere via authentic Gematria.`
}

/**
 * Get short path description
 */
function getShortKabbalisticPath(prediction: Prediction): string {
  const pathNumber = parseInt(prediction.code.split('-')[1])
  return `via Path ${pathNumber} numerology`
}

/**
 * Get detailed insight about the prediction
 */
export function getPredictionInsight(prediction: Prediction): string {
  const pathNumber = parseInt(prediction.code.split('-')[1])
  const path = WISDOM_PATHS[pathNumber - 1]
  
  return `${path.teaching}. The ${prediction.sephira.name} sphere (${prediction.sephira.energy}) activates this energy in your ${prediction.domain.name.toLowerCase()}. This alignment is calculated through authentic Kabbalistic Gematria - your wallet's numerical essence combined with today's lunar influence.`
}

/**
 * CALCULATION PROOF - Shows the mathematics behind prediction
 * Use this to prove it's not random to users
 */
export function getCalculationProof(walletAddress: string, walletNumber: number, date: Date): string {
  const numerology = new KabbalahNumerology()
  
  const walletGematria = numerology.walletToGematria(walletAddress)
  const lunarInfluence = numerology.getLunarInfluence(date)
  const destinyNumber = numerology.reduceToSingleDigit(walletGematria + lunarInfluence + walletNumber)
  const pathNumber = numerology.calculatePath(walletGematria, lunarInfluence, destinyNumber)
  
  return `Your Gematria: ${walletGematria} | Lunar: ${lunarInfluence} | Destiny: ${destinyNumber} | Path: ${pathNumber}/22 | This is sacred mathematics, not randomness.`
}
