//* Design system reference data (mirrors /design-system/DesignSystem.dc.html)

export const brandColors = [
  {
    name: "Vermelho Lance",
    short: "Primária",
    hex: "#F80D17",
    on: "#FFFFFF",
    use: "Ação principal, ao vivo, urgência, destaque de palavra. Texto branco só em 18px+.",
  },
  {
    name: "Amarelo Arremate",
    short: "Secundária",
    hex: "#F6BA04",
    on: "#0E0B13",
    use: "Destaques, sucesso, saldo, faixa de agendados. Sempre com texto quase-preto.",
  },
  {
    name: "Tinta",
    short: "Base",
    hex: "#0E0B13",
    on: "#F6BA04",
    use: "Fundo escuro, chips, cabeçalhos de tabela, footer.",
  },
  {
    name: "Contorno",
    short: "Traço",
    hex: "#000000",
    on: "#FFFFFF",
    use: "Bordas de 2–4px em todos os blocos de marca, nos dois temas.",
  },
]

export const supportColors = [
  { hex: "#B0000A", use: "Listra escura do vermelho (comprometido)" },
  { hex: "#C40008", use: "Vermelho como texto · claro" },
  { hex: "#FF5A61", use: "Vermelho como texto · escuro" },
  { hex: "#8F6600", use: "Amarelo como texto · claro" },
  { hex: "#231B2E", use: "Palco atrás das cartas" },
  { hex: "#3A3342", use: "Palco de lote encerrado" },
  { hex: "#FFF3C4", use: 'Linha "seu lance" · claro' },
  { hex: "#3A2E10", use: 'Linha "seu lance" · escuro' },
]

export const themeTokens = [
  { name: "--bg", light: "#F7F5FA", dark: "#0E0B13", use: "Fundo da página" },
  {
    name: "--bg-alt",
    light: "#ECE8F1",
    dark: "#16111D",
    use: "Seções alternadas",
  },
  {
    name: "--surface",
    light: "#FFFFFF",
    dark: "#1E1828",
    use: "Cards, painéis, tabelas",
  },
  {
    name: "--surface-2",
    light: "#F1EEF4",
    dark: "#2A2235",
    use: "Áreas internas, trilhos",
  },
  { name: "--text", light: "#0E0B13", dark: "#FFFFFF", use: "Texto principal" },
  {
    name: "--muted",
    light: "#4A4453",
    dark: "#C9C2D3",
    use: "Texto secundário, labels",
  },
  {
    name: "--ink",
    light: "#0E0B13",
    dark: "#000000",
    use: "Contorno de cards",
  },
  {
    name: "--shadow",
    light: "#0E0B13",
    dark: "#F6BA04",
    use: "Sombra neutra (vira amarela no escuro)",
  },
  {
    name: "--edge",
    light: "#0E0B13",
    dark: "#F6BA04",
    use: "Botão de contorno",
  },
  {
    name: "--field-edge",
    light: "#0E0B13",
    dark: "#8C8299",
    use: "Borda de campos e chips",
  },
  {
    name: "--input-bg",
    light: "#FFFFFF",
    dark: "#120E18",
    use: "Fundo de campos",
  },
  {
    name: "--line-soft",
    light: "#E2DEE8",
    dark: "#2F2639",
    use: "Divisórias de lista e tabela",
  },
  {
    name: "--red-text",
    light: "#C40008",
    dark: "#FF5A61",
    use: "Links, erros, valores",
  },
  {
    name: "--yellow-text",
    light: "#8F6600",
    dark: "#F6BA04",
    use: "Amarelo usado como texto",
  },
  {
    name: "--head-bg",
    light: "#FFFFFF",
    dark: "#0E0B13",
    use: "Fundo do header",
  },
]

//* WCAG relative luminance / contrast ratio
function luminance(hex: string) {
  const value = hex.replace("#", "")
  const [r, g, b] = [0, 2, 4]
    .map((index) => Number.parseInt(value.slice(index, index + 2), 16) / 255)
    .map((channel) =>
      channel <= 0.03928
        ? channel / 12.92
        : Math.pow((channel + 0.055) / 1.055, 2.4)
    )

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(foreground: string, background: string) {
  const a = luminance(foreground)
  const b = luminance(background)

  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

type ContrastVerdict = "AA" | "AA grande" | "Evitar"

const verdictBadge: Record<ContrastVerdict, { bg: string; fg: string }> = {
  AA: { bg: "#F6BA04", fg: "#0E0B13" },
  "AA grande": { bg: "#FFFFFF", fg: "#0E0B13" },
  Evitar: { bg: "#F80D17", fg: "#FFFFFF" },
}

const contrastPairDefinitions = [
  ["#0E0B13", "#F6BA04", "Texto em botões e faixas amarelas"],
  ["#FFFFFF", "#F80D17", "Texto em botões vermelhos (Bungee 18px+)"],
  ["#F6BA04", "#0E0B13", "Chips escuros, cronômetro, prefixo R$"],
  ["#0E0B13", "#FFFFFF", "Texto principal · tema claro"],
  ["#FFFFFF", "#1E1828", "Texto principal · tema escuro"],
  ["#4A4453", "#FFFFFF", "Texto secundário · claro"],
  ["#C9C2D3", "#1E1828", "Texto secundário · escuro"],
  ["#C40008", "#FFFFFF", "Links, erros e valores · claro"],
  ["#FF5A61", "#1E1828", "Links, erros e valores · escuro"],
  ["#8F6600", "#FFFFFF", "Amarelo como texto · claro"],
  ["#F80D17", "#FFFFFF", 'Carimbo "Arrematado!" (24px)'],
  ["#F80D17", "#F7F5FA", "Vermelho de marca como texto pequeno"],
] as const

export const contrastPairs = contrastPairDefinitions.map(([fg, bg, use]) => {
  const ratio = contrastRatio(fg, bg)
  const verdict: ContrastVerdict =
    ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA grande" : "Evitar"

  return {
    fg,
    bg,
    use,
    ratio: `${ratio.toFixed(1).replace(".", ",")}:1`,
    verdict,
    badge: verdictBadge[verdict],
  }
})

type TypeScaleItem = {
  name: string
  spec: string
  display: boolean
  size: string
  weight: number
  lineHeight: number
  uppercase?: boolean
  tracking?: string
  sample: string
}

export const typeScale: TypeScaleItem[] = [
  {
    name: "Display",
    spec: "Bungee · clamp(44–92px) · 0.98",
    display: true,
    size: "64px",
    weight: 400,
    lineHeight: 1,
    tracking: "-1px",
    sample: "DÊ O LANCE",
  },
  {
    name: "H1",
    spec: "Bungee · clamp(32–64px) · 1.0",
    display: true,
    size: "48px",
    weight: 400,
    lineHeight: 1,
    sample: "Lotes ao vivo",
  },
  {
    name: "H2",
    spec: "Bungee · 28px",
    display: true,
    size: "28px",
    weight: 400,
    lineHeight: 1.1,
    sample: "Histórico de lances",
  },
  {
    name: "H3 / card",
    spec: "Bungee · 18px · 1.15",
    display: true,
    size: "18px",
    weight: 400,
    lineHeight: 1.15,
    sample: "Magnum the Reliever",
  },
  {
    name: "Valor",
    spec: "Bungee · 26–48px · tabular",
    display: true,
    size: "36px",
    weight: 400,
    lineHeight: 1.05,
    sample: "R$ 245,00",
  },
  {
    name: "Corpo G",
    spec: "Chakra 400 · 18–20px · 1.5",
    display: false,
    size: "20px",
    weight: 400,
    lineHeight: 1.5,
    sample: "Staples do meta, raridades e aquela carta que falta no seu deck.",
  },
  {
    name: "Corpo",
    spec: "Chakra 400 · 16px · 1.55",
    display: false,
    size: "16px",
    weight: 400,
    lineHeight: 1.55,
    sample: "Kit para começar Labrynth com extras para o Extra Deck.",
  },
  {
    name: "Pequeno",
    spec: "Chakra 600 · 14px",
    display: false,
    size: "14px",
    weight: 600,
    lineHeight: 1.4,
    sample: "Fusão · Near Mint · EN · 14 lances",
  },
  {
    name: "Label",
    spec: "Chakra 700 · 12–14px · CAIXA ALTA · +1px",
    display: false,
    size: "13px",
    weight: 700,
    lineHeight: 1.2,
    uppercase: true,
    tracking: "1px",
    sample: "Lance atual",
  },
  {
    name: "Botão",
    spec: "Bungee · 15 / 18 / 22px",
    display: true,
    size: "18px",
    weight: 400,
    lineHeight: 1,
    sample: "Dar lance",
  },
]

export const borderWidths = [
  { width: "2px", use: "Badges pequenos, miniaturas, chips de tempo" },
  { width: "3px", use: "Campos, botões P, chips, tags" },
  { width: "4px", use: "Cards, painéis, botões M/GG, faixas" },
  { width: "8px", use: "Linha vermelha no topo do footer" },
]

export const shadows = [
  { name: "3px", css: "3px 3px 0 var(--cob-red)" },
  { name: "4px", css: "4px 4px 0 var(--cob-red)" },
  { name: "6px", css: "6px 6px 0 var(--cob-yellow)" },
  { name: "8px", css: "8px 8px 0 var(--shadow)" },
  { name: "12px", css: "12px 12px 0 var(--cob-red)" },
]

export const spacingScale = [
  { value: 4, use: "Ajuste fino" },
  { value: 8, use: "Ícone ↔ texto, chips" },
  { value: 12, use: "Dentro de cards" },
  { value: 16, use: "Padding de linhas, gutter mínimo" },
  { value: 20, use: "Campos de formulário" },
  { value: 24, use: "Padding de painéis" },
  { value: 32, use: "Gap entre cards" },
  { value: 40, use: "Colunas principais" },
  { value: 48, use: "Título de seção ↔ conteúdo" },
  { value: 56, use: "Hero, blocos grandes" },
  { value: 72, use: "Seção (mín.)" },
  { value: 112, use: "Seção (máx.)" },
]

export const buttonVariantsTable = [
  {
    variant: "Primário",
    use: "A ação principal da tela: Dar lance, Criar conta, Entrar.",
    rule: "Um por bloco. Texto Bungee ≥ 18px (contraste AA grande).",
  },
  {
    variant: "Secundário",
    use: "Ação de destaque fora do fluxo: Criar conta no header.",
    rule: "Sombra vermelha. Texto sempre quase-preto.",
  },
  {
    variant: "Escuro",
    use: "Ações em cards sobre fundo amarelo: Me avise.",
    rule: "Vira amarelo quando ativo (toggle).",
  },
  {
    variant: "Contorno",
    use: "Alternativa ao primário: Criar conta grátis, Sacar, Ver detalhes.",
    rule: "Usa --edge; sem sombra.",
  },
  {
    variant: "Link",
    use: "Ações terciárias: Esqueci minha senha, Voltar.",
    rule: "Sublinhado, --red-text, área ≥ 44px.",
  },
]

export const motionTable = [
  {
    name: "Pulso ao vivo",
    duration: "1.1s",
    ease: "ease-in-out · infinito",
    className: ".cob-dot",
    where: 'Selos e links "Ao vivo"',
  },
  {
    name: "Faixa",
    duration: "30s",
    ease: "linear · infinito",
    className: ".cob-marquee",
    where: "Faixa amarela da LP",
  },
  {
    name: "Levantar card",
    duration: ".16s",
    ease: "ease",
    className: ".cob-lift",
    where: "Cards de lote (hover)",
  },
  {
    name: "Apertar botão",
    duration: ".12s",
    ease: "ease",
    className: ".cob-btn",
    where: "Botões e links-botão",
  },
  {
    name: "Foco de campo",
    duration: ".12s",
    ease: "ease",
    className: ".cob-input",
    where: "Inputs (sombra amarela)",
  },
  {
    name: "Pop",
    duration: ".25s",
    ease: "ease-out",
    className: ".cob-pop",
    where: "Confirmações e avisos de sucesso",
  },
  {
    name: "Troca de tema",
    duration: ".2s",
    ease: "ease",
    className: ".cob-root",
    where: "Fundo e texto ao alternar tema",
  },
  {
    name: "Cronômetro",
    duration: "1s",
    ease: "passo a passo",
    className: "setInterval",
    where: "Cards, lote, carteira",
  },
]

export const marqueeWords = ["Dê seu lance", "Arremate", "Duele", "Colecione"]

export const voiceDo = [
  '"Ative sua carta-armadilha: um lance no último segundo muda o duelo."',
  '"Quem pisca, perde a carta."',
  '"Direto pro cemitério" para lotes encerrados.',
  '"O lance mínimo agora é R$ 250,00." — erro claro, com o número.',
  "Botões com verbo: Dar lance, Me avise, Sacar.",
]

export const voiceDont = [
  '"Ops, seu lance foi pro Shadow Realm!" — piada em erro de dinheiro confunde.',
  '"Valor inválido." — não diz o que fazer.',
  "Botões genéricos: OK, Enviar, Clique aqui.",
  'Prometer o que o produto não garante ("o mais seguro do Brasil").',
  "Emoji no lugar de ícone.",
]
