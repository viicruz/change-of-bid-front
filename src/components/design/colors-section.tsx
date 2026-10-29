//* Components imports
import {
  brandColors,
  contrastPairs,
  supportColors,
  themeTokens,
} from "@/src/components/design/design-data"
import {
  Code,
  DesignSection,
  SubHeading,
} from "@/src/components/design/design-primitives"

function Swatch({ color }: { color: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className="inline-block size-7 border-2 border-black"
        style={{ background: color }}
      />
      <span className="font-mono text-[13px]">{color}</span>
    </span>
  )
}

export function ColorsSection() {
  return (
    <DesignSection
      id="cores"
      number="01"
      title="Cores"
      className="gap-9"
      description="Duas cores de marca fazem o barulho; o resto fica quieto para elas aparecerem. Vermelho chama para ação, amarelo destaca e celebra, o quase-preto segura tudo."
    >
      <SubHeading>Marca</SubHeading>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-6">
        {brandColors.map((color) => (
          <div
            key={color.hex}
            className="border-4 border-black bg-card shadow-hard-8"
          >
            <div
              className="flex h-37.5 items-end border-b-4 border-black p-3 font-heading text-[28px]"
              style={{ background: color.hex, color: color.on }}
            >
              {color.short}
            </div>
            <div className="flex flex-col gap-1.5 p-3.5">
              <div className="flex items-baseline justify-between gap-2">
                <strong className="font-heading text-base">{color.name}</strong>
                <Code>{color.hex}</Code>
              </div>
              <div className="text-sm leading-[1.45] text-muted-foreground">
                {color.use}
              </div>
            </div>
          </div>
        ))}
      </div>

      <SubHeading>Apoio</SubHeading>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-4">
        {supportColors.map((color) => (
          <div key={color.hex} className="border-3 border-black bg-card">
            <div
              className="h-16 border-b-3 border-black"
              style={{ background: color.hex }}
            />
            <div className="flex flex-col gap-1 p-2.5">
              <Code className="self-start">{color.hex}</Code>
              <div className="text-[13px] leading-[1.4] text-muted-foreground">
                {color.use}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <SubHeading>Tokens de tema</SubHeading>
        <p className="m-0 max-w-180 text-[15px] text-muted-foreground">
          As telas nunca usam hex direto para superfícies e textos: usam
          variáveis CSS que mudam com o tema. Cores de marca (vermelho, amarelo,
          contorno preto) ficam fixas nos dois temas.
        </p>
        <div className="overflow-x-auto border-4 border-border bg-card shadow-hard-8">
          <table className="ds-table">
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Claro</th>
                <th scope="col">Escuro</th>
                <th scope="col">Uso</th>
              </tr>
            </thead>
            <tbody>
              {themeTokens.map((token) => (
                <tr key={token.name}>
                  <td>
                    <Code>{token.name}</Code>
                  </td>
                  <td>
                    <Swatch color={token.light} />
                  </td>
                  <td>
                    <Swatch color={token.dark} />
                  </td>
                  <td className="text-sm text-muted-foreground">{token.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <SubHeading>Contraste (calculado)</SubHeading>
        <p className="m-0 max-w-180 text-[15px] text-muted-foreground">
          Combinações usadas nas telas e a razão de contraste WCAG. &quot;AA
          grande&quot; só vale para texto a partir de 18px bold (ou 24px
          regular) — é por isso que todo botão vermelho usa Bungee 18px+.
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          {contrastPairs.map((pair) => (
            <div
              key={`${pair.fg}-${pair.bg}`}
              className="flex flex-col border-3 border-black bg-card"
            >
              <div
                className="border-b-3 border-black p-4 font-heading text-xl"
                style={{ background: pair.bg, color: pair.fg }}
              >
                Aa Lance
              </div>
              <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                <div className="text-[13px] leading-[1.35] text-muted-foreground">
                  {pair.use}
                </div>
                <div className="flex-none text-right">
                  <div className="font-heading text-base">{pair.ratio}</div>
                  <span
                    className="border-2 border-black px-1.5 py-0.5 text-[11px] font-bold uppercase"
                    style={{ background: pair.badge.bg, color: pair.badge.fg }}
                  >
                    {pair.verdict}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DesignSection>
  )
}
