//* Libraries imports
import { cva, type VariantProps } from "class-variance-authority"
import Image from "next/image"
import type { ReactNode } from "react"

//* Components imports
import { buttonVariantsTable } from "@/src/components/design/design-data"
import { DesignIcon } from "@/src/components/design/design-icons"
import {
  ChoiceTiles,
  SegmentedAndChips,
} from "@/src/components/design/design-interactive"
import {
  Code,
  DesignSection,
  Eyebrow,
  LiveDot,
  Panel,
  Tag,
} from "@/src/components/design/design-primitives"

//* Lib imports
import { cn } from "@/src/lib/utils"

const cobButtonVariants = cva("cob-display rounded-none", {
  variants: {
    variant: {
      primary:
        "border-black bg-(--cob-red) text-white shadow-[6px_6px_0_var(--cob-yellow)]",
      secondary:
        "border-black bg-(--cob-yellow) text-(--cob-tinta) shadow-[6px_6px_0_var(--cob-red)]",
      dark: "border-black bg-(--cob-tinta) text-(--cob-yellow) shadow-[6px_6px_0_var(--cob-red)]",
      outline: "border-(--edge) bg-transparent text-(--edge)",
    },
    size: {
      lg: "border-4 px-7 py-[18px] text-[22px]",
      md: "border-4 px-[22px] py-3.5 text-lg",
      sm: "border-3 px-[18px] py-3 text-[15px] shadow-[4px_4px_0_var(--cob-red)]",
      state: "border-4 px-[18px] py-3 text-base",
    },
  },
  defaultVariants: { variant: "primary", size: "md" },
})

//* Size and variant both set a shadow, so merge them to keep the last one
function cobButton(
  props?: VariantProps<typeof cobButtonVariants>,
  className?: string
) {
  return cn(cobButtonVariants(props), className)
}

function SubTitle({ children }: { children: ReactNode }) {
  return <h3 className="cob-display m-0 text-2xl">{children}</h3>
}

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2.5">
      {children}
      <span className="text-xs text-(--muted)">{label}</span>
    </div>
  )
}

const fieldLabel = "text-sm font-bold tracking-[1px] uppercase"
const fieldBox =
  "flex min-h-[52px] w-full items-center border-3 bg-(--input-bg) px-3.5 py-3 text-base text-(--text)"

const buttonStates = [
  { label: "Normal", className: "" },
  {
    label: "Hover · sobe −3px",
    className: "translate-x-[-3px] translate-y-[-3px]",
  },
  {
    label: "Pressionado · desce 2px",
    className: "translate-x-[2px] translate-y-[2px]",
  },
  {
    label: "Foco (teclado)",
    className: "outline-3 outline-offset-3 outline-(--cob-yellow)",
  },
  { label: "Desabilitado · sem sombra", className: "opacity-45 shadow-none" },
]

function Buttons() {
  return (
    <div className="flex flex-col gap-[18px]">
      <SubTitle>Botões</SubTitle>
      <Panel className="flex flex-col gap-[26px] p-6">
        <div className="flex flex-wrap items-center gap-[22px]">
          <button type="button" className={cobButton({}, "cob-btn")}>
            Primário
          </button>
          <button
            type="button"
            className={cobButton({ variant: "secondary" }, "cob-btn")}
          >
            Secundário
          </button>
          <button
            type="button"
            className={cobButton({ variant: "dark" }, "cob-btn")}
          >
            Escuro
          </button>
          <button
            type="button"
            className={cobButton({ variant: "outline" }, "cob-btn")}
          >
            Contorno
          </button>
          <button
            type="button"
            className="min-h-11 text-[15px] font-bold text-(--red-text) underline"
          >
            Link
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="ds-table min-w-[640px]">
            <thead>
              <tr>
                <th scope="col">Variante</th>
                <th scope="col">Uso</th>
                <th scope="col">Regra</th>
              </tr>
            </thead>
            <tbody>
              {buttonVariantsTable.map((row) => (
                <tr key={row.variant}>
                  <td>
                    <strong>{row.variant}</strong>
                  </td>
                  <td className="text-(--muted)">{row.use}</td>
                  <td className="text-(--muted)">{row.rule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3">
          <Eyebrow>Estados</Eyebrow>
          <div className="flex flex-wrap items-end gap-7">
            {buttonStates.map((state) => (
              <div
                key={state.label}
                className="flex flex-col items-start gap-2.5"
              >
                <span className={cobButton({ size: "state" }, state.className)}>
                  Lance
                </span>
                <span className="text-xs font-bold">{state.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Eyebrow>Tamanhos</Eyebrow>
          <div className="flex flex-wrap items-end gap-[22px]">
            <span className={cobButton({ size: "lg" })}>GG · 22px</span>
            <span className={cobButton({ size: "md" })}>M · 18px</span>
            <span className={cobButton({ variant: "secondary", size: "sm" })}>
              P · 15px
            </span>
            <button
              type="button"
              aria-label="Alternar tema"
              className="cob-btn inline-flex size-11 items-center justify-center border-3 border-black bg-(--cob-yellow) text-(--cob-tinta)"
            >
              <DesignIcon name="sol" size={20} />
            </button>
            <span className="text-xs font-bold text-(--muted)">
              ← só ícone: 44×44, sempre com aria-label
            </span>
          </div>
        </div>
      </Panel>
    </div>
  )
}

function Badges() {
  return (
    <div className="flex flex-col gap-[18px]">
      <SubTitle>Tags, selos e badges</SubTitle>
      <Panel className="flex flex-wrap items-center gap-x-8 gap-y-7 px-6 py-7">
        <Labeled label="Status ao vivo · pulsa">
          <Tag>
            <LiveDot />
            Ao vivo
          </Tag>
        </Labeled>
        <Labeled label="Status agendado">
          <Tag tone="yellow">Agendado</Tag>
        </Labeled>
        <Labeled label="Info neutra">
          <Tag tone="dark">7 cartas</Tag>
        </Labeled>
        <Labeled label="Inverte com o tema">
          <Tag tone="inverse">Encerrado</Tag>
        </Labeled>
        <Labeled label="Badge pequeno">
          <span className="cob-display border-2 border-black bg-(--cob-yellow) px-2 py-0.5 text-[11px] text-(--cob-tinta)">
            Na frente
          </span>
        </Labeled>
        <Labeled label="Badge em lista">
          <span className="cob-display bg-(--cob-red) px-1.5 py-0.5 text-[11px] text-white">
            Maior lance
          </span>
        </Labeled>
        <Labeled label="Quantidade">
          <span className="cob-display border-3 border-black bg-(--cob-yellow) px-[7px] py-0.5 text-[13px] text-(--cob-tinta)">
            ×3
          </span>
        </Labeled>
        <div className="flex flex-col items-start gap-3.5 px-2.5 py-1.5">
          <span className="cob-display -rotate-14 border-5 border-(--cob-red) bg-white px-3.5 py-1.5 text-xl text-(--cob-red) shadow-[5px_5px_0_#000] outline-3 outline-black">
            Arrematado!
          </span>
          <span className="text-xs text-(--muted)">
            Carimbo · só sobre imagem
          </span>
        </div>
        <Labeled label="Adesivo · hero">
          <span className="-rotate-6 border-4 border-black bg-(--cob-yellow) px-3 py-2 text-(--cob-tinta) shadow-[5px_5px_0_#000]">
            <span className="block text-[11px] font-bold tracking-[1px] uppercase">
              Novo lance!
            </span>
            <span className="cob-display text-lg">+ R$ 10,00</span>
          </span>
        </Labeled>
      </Panel>
    </div>
  )
}

function FormFields() {
  return (
    <div className="flex flex-col gap-[18px]">
      <SubTitle>Campos de formulário</SubTitle>
      <Panel className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-7 p-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="ds-input-default" className={fieldLabel}>
            Padrão
          </label>
          <input
            id="ds-input-default"
            type="text"
            placeholder="Clique para ver o foco"
            className={cn("cob-input", fieldBox, "border-(--field-edge)")}
          />
          <span className="text-xs text-(--muted)">
            Foco: sombra amarela 5px, sem outline.
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className={fieldLabel}>Com foco</span>
          <span
            className={cn(
              fieldBox,
              "border-(--field-edge) shadow-[5px_5px_0_var(--cob-yellow)]"
            )}
          >
            duelista@email.com
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className={fieldLabel}>Com erro</span>
          <span className={cn(fieldBox, "border-(--cob-red)")}>duelista@</span>
          <span className="text-sm font-bold text-(--red-text)">
            Esse e-mail não parece válido.
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="ds-input-money" className={fieldLabel}>
            Com prefixo (valor)
          </label>
          <div className="flex">
            <span
              aria-hidden="true"
              className="cob-display flex items-center border-3 border-r-0 border-(--field-edge) bg-(--cob-tinta) px-3.5 text-lg text-(--cob-yellow)"
            >
              R$
            </span>
            <input
              id="ds-input-money"
              type="text"
              inputMode="decimal"
              placeholder="250"
              className="cob-input cob-display min-h-14 min-w-0 flex-1 border-3 border-(--field-edge) bg-(--input-bg) px-3.5 py-3 text-[22px] text-(--text)"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className={fieldLabel}>Com ação (senha)</span>
          <div className="flex">
            <span
              className={cn(
                fieldBox,
                "flex-1 border-r-0 border-(--field-edge)"
              )}
            >
              ••••••••
            </span>
            <span className="flex w-[52px] flex-none items-center justify-center border-3 border-(--field-edge) bg-(--cob-tinta) text-(--cob-yellow)">
              <DesignIcon name="olho" size={20} />
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <span className={fieldLabel}>Checkbox</span>
          <span className="flex items-center gap-2.5 font-semibold">
            <span className="flex size-6 items-center justify-center border-3 border-(--field-edge) bg-(--cob-yellow) text-(--cob-tinta)">
              <DesignIcon name="check" size={14} strokeWidth={4} />
            </span>
            Marcado
          </span>
          <span className="flex items-center gap-2.5 font-semibold">
            <span className="size-6 border-3 border-(--field-edge) bg-(--input-bg)" />
            Desmarcado
          </span>
        </div>
      </Panel>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-7">
        <Panel className="flex flex-col gap-3.5 p-6">
          <Eyebrow>Escolha em bloco (radio)</Eyebrow>
          <ChoiceTiles />
        </Panel>
        <Panel className="flex flex-col gap-3.5 p-6">
          <Eyebrow>Segmentado e chips de filtro</Eyebrow>
          <SegmentedAndChips />
          <span className="text-xs text-(--muted)">
            Selecionado = vermelho com texto branco. Use{" "}
            <Code>aria-pressed</Code>.
          </span>
        </Panel>
      </div>
    </div>
  )
}

const cardStage = "relative border-b-4 px-10 py-[18px]"

function LotCards() {
  return (
    <div className="flex flex-col gap-[18px]">
      <SubTitle>Cards de lote</SubTitle>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-8">
        <div className="flex flex-col gap-2.5">
          <article className="cob-lift border-4 border-(--ink) bg-(--surface) shadow-[8px_8px_0_var(--cob-red)]">
            <div
              className={cn(
                cardStage,
                "border-(--ink) bg-[repeating-linear-gradient(-45deg,rgba(246,186,4,0.10)_0_2px,transparent_2px_14px),var(--cob-stage)]"
              )}
            >
              <span className="cob-display absolute top-0 left-0 flex items-center gap-1.5 border-r-3 border-b-3 border-black bg-(--cob-red) px-2 py-1 text-[11px] text-white">
                <LiveDot size={6} />
                Ao vivo
              </span>
              <Image
                src="/design/magnum-the-reliever.jpg"
                alt="Carta Magnum the Reliever"
                width={813}
                height={1185}
                sizes="(max-width: 640px) 100vw, 360px"
                className="block h-auto w-full"
              />
            </div>
            <div className="flex flex-col gap-2 p-3.5">
              <strong className="cob-display text-[15px]">
                Magnum the Reliever
              </strong>
              <span className="cob-display text-xl">R$ 189,90</span>
              <span className="flex justify-between border-2 border-black bg-(--cob-red) px-2.5 py-1.5 text-xs font-bold text-white uppercase">
                Acabando! <span className="cob-display">00:04:18</span>
              </span>
            </div>
          </article>
          <span className="text-[13px] text-(--muted)">
            <strong className="text-(--text)">Ao vivo</strong> · sombra
            vermelha, selo pulsante, cronômetro.
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          <article className="cob-lift border-4 border-black bg-(--surface) shadow-[8px_8px_0_var(--cob-tinta)]">
            <div
              className={cn(
                cardStage,
                "border-black bg-[repeating-linear-gradient(-45deg,rgba(248,13,23,0.12)_0_2px,transparent_2px_14px),var(--cob-stage)]"
              )}
            >
              <span className="cob-display absolute top-0 left-0 border-r-3 border-b-3 border-black bg-(--cob-yellow) px-2 py-1 text-[11px] text-(--cob-tinta)">
                Agendado
              </span>
              <Image
                src="/design/parallel-teleport.jpg"
                alt="Carta Parallel Teleport"
                width={813}
                height={1185}
                sizes="(max-width: 640px) 100vw, 360px"
                className="block h-auto w-full"
              />
            </div>
            <div className="flex flex-col gap-2 p-3.5">
              <strong className="cob-display text-[15px]">
                Parallel Teleport
              </strong>
              <span className="cob-display flex border-3 border-(--field-edge) text-xs">
                <span className="flex-1 bg-(--cob-tinta) px-2 py-1.5 text-(--cob-yellow)">
                  30 OUT · 20H
                </span>
                <span className="flex-1 px-2 py-1.5">R$ 15,00</span>
              </span>
            </div>
          </article>
          <span className="text-[13px] text-(--muted)">
            <strong className="text-(--text)">Agendado</strong> · vive sobre a
            faixa amarela, sombra preta fixa.
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          <article className="border-4 border-(--ink) bg-(--surface) shadow-[8px_8px_0_var(--shadow)]">
            <div
              className={cn(
                cardStage,
                "overflow-hidden border-(--ink) bg-(--cob-stage-closed)"
              )}
            >
              <Image
                src="/design/performapal-sky-pupil.jpg"
                alt="Carta Performapal Sky Pupil"
                width={813}
                height={1185}
                sizes="(max-width: 640px) 100vw, 360px"
                className="block h-auto w-full opacity-75 contrast-90 grayscale-[0.85]"
              />
              <span className="cob-display absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-14 border-4 border-(--cob-red) bg-white px-2.5 py-1 text-base whitespace-nowrap text-(--cob-red) outline-3 outline-black">
                Arrematado!
              </span>
            </div>
            <div className="flex flex-col gap-2 p-3.5">
              <strong className="cob-display text-[15px]">
                Performapal Sky Pupil
              </strong>
              <span className="cob-display text-xl text-(--red-text)">
                R$ 12,00
              </span>
            </div>
          </article>
          <span className="text-[13px] text-(--muted)">
            <strong className="text-(--text)">Encerrado</strong> · imagem em
            cinza, carimbo, sem hover.
          </span>
        </div>
      </div>
    </div>
  )
}

function Feedback() {
  return (
    <div className="flex flex-col gap-[18px]">
      <SubTitle>Feedback e dados</SubTitle>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-7">
        <Panel className="flex flex-col gap-3.5 p-5">
          <Eyebrow>Cronômetro</Eyebrow>
          <span className="flex items-center gap-2 border-2 border-black bg-(--cob-tinta) px-3 py-2 text-[13px] font-bold text-(--cob-yellow) uppercase">
            Termina em
            <span className="cob-display ml-auto text-base tabular-nums">
              01:12:00
            </span>
          </span>
          <span className="flex items-center gap-2 border-2 border-black bg-(--cob-red) px-3 py-2 text-[13px] font-bold text-white uppercase">
            Acabando!
            <span className="cob-display ml-auto text-base tabular-nums">
              00:04:18
            </span>
          </span>
          <span className="text-xs text-(--muted)">
            Fica vermelho abaixo de 10 min (cards) ou 5 min (lote).
          </span>
        </Panel>
        <Panel className="flex flex-col gap-3.5 p-5">
          <Eyebrow>Confirmação</Eyebrow>
          <span className="flex -rotate-1 items-center gap-2.5 border-3 border-black bg-(--cob-yellow) px-3.5 py-3 font-bold text-(--cob-tinta)">
            <DesignIcon name="check" size={20} />
            Você está na frente!
          </span>
          <span className="text-sm font-bold text-(--red-text)">
            O lance mínimo agora é R$ 250,00.
          </span>
          <span className="text-xs text-(--muted)">
            Sucesso: faixa amarela torta + <Code>role=&quot;status&quot;</Code>.
            Erro: texto vermelho sob o campo +{" "}
            <Code>role=&quot;alert&quot;</Code>.
          </span>
        </Panel>
        <Panel className="flex flex-col gap-3.5 p-5">
          <Eyebrow>Blocos de valor</Eyebrow>
          <div className="border-4 border-black bg-(--cob-yellow) p-3.5 text-(--cob-tinta) shadow-[6px_6px_0_var(--cob-red)]">
            <div className="text-xs font-bold tracking-[1px] uppercase">
              Saldo disponível
            </div>
            <div className="cob-display text-[28px]">R$ 300,00</div>
          </div>
          <div className="flex border-3 border-(--field-edge)">
            <div className="flex-1 px-2.5 py-2">
              <div className="text-[11px] font-bold text-(--muted) uppercase">
                Acréscimo
              </div>
              <div className="cob-display">R$ 5,00</div>
            </div>
            <div className="flex-1 border-l-3 border-(--field-edge) bg-(--cob-tinta) px-2.5 py-2 text-(--cob-yellow)">
              <div className="text-[11px] font-bold text-white uppercase">
                Mínimo
              </div>
              <div className="cob-display">R$ 250,00</div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  )
}

export function ComponentsSection() {
  return (
    <DesignSection
      id="componentes"
      number="04"
      title="Componentes"
      className="gap-10"
      description="Os blocos que montam todas as telas. Os exemplos abaixo são vivos: passe o mouse, clique e digite."
    >
      <Buttons />
      <Badges />
      <FormFields />
      <LotCards />
      <Feedback />
    </DesignSection>
  )
}
