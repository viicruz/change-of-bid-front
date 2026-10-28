//* Components imports
import {
  borderWidths,
  shadows,
  spacingScale,
} from "@/src/components/design/design-data"
import {
  Code,
  DesignSection,
  Panel,
} from "@/src/components/design/design-primitives"

export function ShapeSection() {
  return (
    <DesignSection
      id="forma"
      number="03"
      title="Forma, espaço e sombra"
      description={
        <>
          A estética é de carta impressa e HQ: traço grosso, cor chapada, sombra
          dura. Raio de borda é sempre <Code>0</Code> — inclusive em inputs, que
          precisam de <Code>border-radius: 0</Code> explícito.
        </>
      }
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-7">
        <Panel className="flex flex-col gap-3.5 p-5">
          <h3 className="cob-display m-0 text-lg">Bordas</h3>
          {borderWidths.map((border) => (
            <div key={border.width} className="flex items-center gap-3.5">
              <span
                aria-hidden="true"
                className="block h-10 w-16 flex-none border-solid border-(--text)"
                style={{ borderWidth: border.width }}
              />
              <div>
                <strong className="text-sm">{border.width}</strong>
                <div className="text-[13px] text-(--muted)">{border.use}</div>
              </div>
            </div>
          ))}
        </Panel>

        <Panel className="flex flex-col gap-[18px] p-5">
          <h3 className="cob-display m-0 text-lg">Sombras</h3>
          <div className="flex flex-wrap gap-x-[26px] gap-y-[22px]">
            {shadows.map((shadow) => (
              <div
                key={shadow.name}
                className="flex flex-col items-start gap-2.5"
              >
                <span
                  aria-hidden="true"
                  className="block h-12 w-16 border-3 border-black bg-(--surface-2)"
                  style={{ boxShadow: shadow.css }}
                />
                <span className="text-xs font-bold">{shadow.name}</span>
              </div>
            ))}
          </div>
          <p className="m-0 text-[13px] text-(--muted)">
            Cor da sombra: vermelho (ação/destaque), amarelo (sobre vermelho e
            no tema escuro) ou <Code>--shadow</Code> (neutra, muda com o tema).
            Nunca blur.
          </p>
        </Panel>

        <Panel className="flex flex-col gap-3 p-5">
          <h3 className="cob-display m-0 text-lg">Inclinação &amp; rotação</h3>
          <div className="flex flex-wrap items-center gap-[18px] py-2.5">
            <span className="cob-display -skew-x-10 border-3 border-black bg-(--cob-yellow) px-3 py-1.5 text-[13px] text-(--cob-tinta)">
              skew −10°
            </span>
            <span className="cob-display -skew-x-8 border-3 border-black bg-(--cob-red) px-3 py-1.5 text-[13px] text-white">
              skew −8°
            </span>
            <span className="cob-display -rotate-6 border-3 border-black bg-white px-3 py-1.5 text-[13px] text-(--cob-tinta) shadow-[4px_4px_0_#000]">
              rotate −6°
            </span>
            <span className="cob-display rotate-5 border-3 border-black bg-(--cob-tinta) px-3 py-1.5 text-[13px] text-(--cob-yellow)">
              rotate 5°
            </span>
          </div>
          <p className="m-0 text-[13px] text-(--muted)">
            Skew em tags de seção e palavras de destaque. Rotação entre −16° e
            13° em cartas e selos soltos. Faixas (marquee) a −1,5°. Conteúdo de
            leitura nunca inclina.
          </p>
        </Panel>
      </div>

      <Panel className="flex flex-col gap-3 p-5">
        <h3 className="cob-display m-0 text-lg">Escala de espaçamento</h3>
        <div className="flex flex-col gap-2">
          {spacingScale.map((space) => (
            <div key={space.value} className="flex items-center gap-3.5">
              <span className="cob-display w-14 flex-none text-right text-sm">
                {space.value}
              </span>
              <span
                aria-hidden="true"
                className="block h-[18px] flex-none border-2 border-black bg-(--cob-red)"
                style={{ width: space.value }}
              />
              <span className="text-[13px] text-(--muted)">{space.use}</span>
            </div>
          ))}
        </div>
        <p className="m-0 text-[13px] text-(--muted)">
          Layout: conteúdo em <Code>max-width: 1280px</Code>, margem lateral{" "}
          <Code>clamp(16px, 4vw, 48px)</Code>, alvos de toque ≥ 44px.
        </p>
      </Panel>
    </DesignSection>
  )
}
