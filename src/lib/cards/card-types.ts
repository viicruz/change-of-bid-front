export const cardTypes = ["monster", "spell", "trap", "extra"] as const

export type CardType = (typeof cardTypes)[number]
