/**
 * Общий справочник фортуны для клиента и API.
 * Соответствует FortuneDefinition из docs/miniapp-endpoints.md.
 */
export type FortuneRarity = "common" | "rare" | "legendary";

export interface FortuneDefinition {
  id: string;
  text: string;
  rarity: FortuneRarity;
  createdAt: string;
}

const TEXTS = [
  "EVERYTHING IS BASED ON @BASE PUMP 🚀",
  "ONCHAIN SUMMER NEVER ENDS ☀️",
  "MINT THE COOKIE, HODL THE CRUMB 🍪",
  "BASED AND BLUE-PILLED 🔵",
  "YOUR GAS IS LOW, BUT YOUR VIBE IS HIGH ✨",
  "EXIT LIQUIDITY? NO, JUST COOKIE LIQUIDITY 🍬",
  "BORN ONCHAIN, RAISED BY DEGENS 👶",
  "WAGMI: WE ARE ALL GONNA MINT COOKIES 🥛",
  "JESSE POLLAK APPROVES THIS MESSAGE 🔵",
  "0.000001 ETH FOR A CRUMB? BULLISH 📈",
  "STAY BASED, STAY CRUNCHY 🛡️",
  "DEGEN LEVEL: MAXIMUM CRUNCH 👹",
  "PAPER HANDS CRUMBLE, DIAMOND HANDS CLINK 💎",
  "ONCHAIN IS THE NEW ONLINE 🌐",
  "GO TO BASE, DON'T LOOK BACK 🔵",
];

const CREATED_AT = "2025-01-01T00:00:00.000Z";

/** Список фортуны с id и редкостью (этап 1: все common) */
export const FORTUNE_DEFINITIONS: FortuneDefinition[] = TEXTS.map((text, i) => ({
  id: `fortune_${i}`,
  text,
  rarity: "common" as FortuneRarity,
  createdAt: CREATED_AT,
}));

/** Только тексты — для обратной совместимости в UI */
export const FORTUNES_TEXTS = TEXTS;
