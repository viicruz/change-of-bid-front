//* Components imports
import { typeScale } from "@/src/components/design/design-data"
import { Code, DesignSection } from "@/src/components/design/design-primitives"
import { HighlightWord } from "@/src/components/ui/brand"

//* Lib imports
import { cn } from "@/src/lib/utils"

export function TypographySection() {
  return (
    <DesignSection
      id="tipografia"
      number="02"
      title="Tipografia"
      description="Duas famílias do Google Fonts. Bungee grita — títulos, botões, valores e selos. Chakra Petch conversa — texto corrido, labels e formulários, com um toque tech de card game."
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-7">
        <div className="flex flex-col gap-3 border-4 border-black bg-brand-ink p-6 text-white shadow-hard-8 shadow-brand-red">
          <div className="text-[13px] font-bold tracking-[1px] text-brand-yellow uppercase">
            Display · 400
          </div>
          <div className="font-heading text-[72px] leading-none">Bungee</div>
          <div className="font-heading text-xl leading-[1.3] break-words text-[#D9D4E0]">
            ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789 R$ ×#!?
          </div>
          <div className="text-sm text-[#D9D4E0]">
            Títulos, botões, valores em R$, selos, números de passo. Sempre peso
            400 (é a única), nunca em parágrafos.
          </div>
        </div>
        <div className="flex flex-col gap-3 border-4 border-border bg-card p-6 shadow-hard-8">
          <div className="text-[13px] font-bold tracking-[1px] text-red-text uppercase">
            Texto · 400 / 500 / 600 / 700
          </div>
          <div className="text-[64px] leading-none font-bold">Chakra Petch</div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xl">
            <span className="font-normal">Regular</span>
            <span className="font-medium">Medium</span>
            <span className="font-semibold">SemiBold</span>
            <span className="font-bold">Bold</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Parágrafos, labels, campos, tabelas, navegação. Labels em CAIXA ALTA
            com 1px de tracking.
          </div>
        </div>
      </div>

      <div className="border-4 border-border bg-card shadow-hard-8">
        {typeScale.map((item) => (
          <div
            key={item.name}
            className="flex flex-wrap items-baseline gap-x-6 gap-y-2 border-b-3 border-line-soft px-5 py-4"
          >
            <div className="flex flex-[0_0_200px] flex-col gap-1">
              <strong className="text-sm tracking-[1px] uppercase">
                {item.name}
              </strong>
              <span className="font-mono text-xs text-muted-foreground">
                {item.spec}
              </span>
            </div>
            <div
              className={cn(
                "min-w-0 flex-[1_1_320px] break-words",
                item.display && "font-heading",
                item.uppercase && "uppercase"
              )}
              style={{
                fontSize: item.size,
                fontWeight: item.weight,
                lineHeight: item.lineHeight,
                letterSpacing: item.tracking,
              }}
            >
              {item.sample}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-5">
        <div className="flex-[1_1_280px] border-3 border-input bg-card p-4">
          <strong className="font-heading text-[15px]">
            Destaque de palavra
          </strong>
          <p className="mt-2 mb-3 text-sm text-muted-foreground">
            Uma palavra por título ganha caixa vermelha inclinada (-8°) com
            sombra amarela.
          </p>
          <span className="font-heading text-[28px]">
            DÊ O{" "}
            <HighlightWord className="border-3 px-2.5 shadow-hard-4 shadow-brand-yellow">
              LANCE
            </HighlightWord>
          </span>
        </div>
        <div className="flex-[1_1_280px] border-3 border-input bg-card p-4">
          <strong className="font-heading text-[15px]">
            Texto com contorno
          </strong>
          <p className="mt-2 mb-3 text-sm text-muted-foreground">
            Amarelo sobre fundo variável leva contorno preto de 3px para
            funcionar nos dois temas.
          </p>
          <span className="font-heading text-4xl text-brand-yellow [-webkit-text-stroke:3px_var(--brand-ink)] [paint-order:stroke_fill]">
            JOGO.
          </span>
        </div>
        <div className="flex-[1_1_280px] border-3 border-input bg-card p-4">
          <strong className="font-heading text-[15px]">Números</strong>
          <p className="mt-2 mb-3 text-sm text-muted-foreground">
            Valores e cronômetros em Bungee com <Code>tabular-nums</Code> para
            não &quot;dançar&quot;.
          </p>
          <span className="font-heading text-[32px] tabular-nums">
            00:18:42
          </span>
        </div>
      </div>
    </DesignSection>
  )
}
