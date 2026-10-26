export const cardSearchTypes = [
  { value: "Effect Monster", messageKey: "effectMonster" },
  { value: "Flip Effect Monster", messageKey: "flipEffectMonster" },
  { value: "Flip Tuner Effect Monster", messageKey: "flipTunerEffectMonster" },
  { value: "Gemini Monster", messageKey: "geminiMonster" },
  { value: "Normal Monster", messageKey: "normalMonster" },
  { value: "Normal Tuner Monster", messageKey: "normalTunerMonster" },
  {
    value: "Pendulum Effect Monster",
    messageKey: "pendulumEffectMonster",
  },
  {
    value: "Pendulum Flip Effect Monster",
    messageKey: "pendulumFlipEffectMonster",
  },
  {
    value: "Pendulum Normal Monster",
    messageKey: "pendulumNormalMonster",
  },
  {
    value: "Pendulum Tuner Effect Monster",
    messageKey: "pendulumTunerEffectMonster",
  },
  { value: "Ritual Effect Monster", messageKey: "ritualEffectMonster" },
  { value: "Ritual Monster", messageKey: "ritualMonster" },
  { value: "Spell Card", messageKey: "spellCard" },
  { value: "Spirit Monster", messageKey: "spiritMonster" },
  { value: "Toon Monster", messageKey: "toonMonster" },
  { value: "Trap Card", messageKey: "trapCard" },
  { value: "Tuner Monster", messageKey: "tunerMonster" },
  { value: "Union Effect Monster", messageKey: "unionEffectMonster" },
  { value: "Fusion Monster", messageKey: "fusionMonster" },
  { value: "Link Monster", messageKey: "linkMonster" },
  {
    value: "Pendulum Effect Fusion Monster",
    messageKey: "pendulumEffectFusionMonster",
  },
  { value: "Synchro Monster", messageKey: "synchroMonster" },
  {
    value: "Synchro Pendulum Effect Monster",
    messageKey: "synchroPendulumEffectMonster",
  },
  { value: "Synchro Tuner Monster", messageKey: "synchroTunerMonster" },
  { value: "XYZ Monster", messageKey: "xyzMonster" },
  {
    value: "XYZ Pendulum Effect Monster",
    messageKey: "xyzPendulumEffectMonster",
  },
  { value: "Skill Card", messageKey: "skillCard" },
  { value: "Token", messageKey: "token" },
] as const

export type CardSearchType = (typeof cardSearchTypes)[number]["value"]

export function isCardSearchType(value: string): value is CardSearchType {
  return cardSearchTypes.some((cardType) => cardType.value === value)
}
