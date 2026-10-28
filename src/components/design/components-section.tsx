//* Libraries imports
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
  Panel,
} from "@/src/components/design/design-primitives"
import { Badge } from "@/src/components/ui/badge"
import { LiveDot, Tag } from "@/src/components/ui/brand"
import { Button, buttonVariants } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

//* Lib imports
import { cn } from "@/src/lib/utils"

function SubTitle({ children }: { children: ReactNode }) {
  return <h3 className="m-0 font-heading text-2xl">{children}</h3>
}

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2.5">
      {children}
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

const fieldLabel = "text-sm font-bold tracking-[1px] uppercase"
const fieldBox =
  "flex min-h-13 w-full items-center border-3 bg-field px-3.5 py-3 text-base text-foreground"

//* Pinned states: static copies of the real button with the state forced
const buttonStates = [
  { label: "Normal", className: "" },
  {
    label: "Hover · sobe −3px",
    className: "-translate-x-[3px] -translate-y-[3px]",
  },
  {
    label: "Pressionado · desce 2px",
    className: "translate-x-[2px] translate-y-[2px]",
  },
  {
    label: "Foco (teclado)",
    className: "outline-3 outline-offset-3 outline-ring outline-solid",
  },
  { label: "Desabilitado · sem sombra", className: "opacity-45 shadow-none" },
]

function Buttons() {
  return (
    <div className="flex flex-col gap-[18px]">
      <SubTitle>Botões</SubTitle>
      <Panel className="flex flex-col gap-[26px] p-6">
        <div className="flex flex-wrap items-center gap-[22px]">
          <Button>Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="dark">Escuro</Button>
          <Button variant="outline">Contorno</Button>
          <Button variant="link">Link</Button>
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
                    <div>
                      <Code>{row.prop}</Code>
                    </div>
                  </td>
                  <td className="text-muted-foreground">{row.use}</td>
                  <td className="text-muted-foreground">{row.rule}</td>
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
                <span
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "border-4 shadow-hard-6",
                    state.className
                  )}
                >
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
            <Button size="lg">GG · lg · 22px</Button>
            <Button>M · default · 18px</Button>
            <Button variant="secondary" size="sm">
              P · sm · 15px
            </Button>
            <Button variant="secondary" size="icon" aria-label="Alternar tema">
              <DesignIcon name="sol" />
            </Button>
            <span className="text-xs font-bold text-muted-foreground">
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
          <Badge variant="secondary">Na frente</Badge>
        </Labeled>
        <Labeled label="Badge em lista">
          <Badge>Maior lance</Badge>
        </Labeled>
        <Labeled label="Quantidade">
          <span className="border-3 border-black bg-brand-yellow px-[7px] py-0.5 font-heading text-[13px] text-brand-ink">
            ×3
          </span>
        </Labeled>
        <div className="flex flex-col items-start gap-3.5 px-2.5 py-1.5">
          <span className="-rotate-14 border-5 border-brand-red bg-white px-3.5 py-1.5 font-heading text-xl text-brand-red shadow-hard-5 shadow-black outline-3 outline-black">
            Arrematado!
          </span>
          <span className="text-xs text-muted-foreground">
            Carimbo · só sobre imagem
          </span>
        </div>
        <Labeled label="Adesivo · hero">
          <span className="-rotate-6 border-4 border-black bg-brand-yellow px-3 py-2 text-brand-ink shadow-hard-5 shadow-black">
            <span className="block text-[11px] font-bold tracking-[1px] uppercase">
              Novo lance!
            </span>
            <span className="font-heading text-lg">+ R$ 10,00</span>
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
          <Label htmlFor="ds-input-default">Padrão</Label>
          <Input
            id="ds-input-default"
            type="text"
            placeholder="Clique para ver o foco"
          />
          <span className="text-xs text-muted-foreground">
            Foco: sombra amarela 5px, sem outline.
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className={fieldLabel}>Com foco</span>
          <span
            className={cn(
              fieldBox,
              "border-input shadow-hard-5 shadow-brand-yellow"
            )}
          >
            duelista@email.com
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className={fieldLabel}>Com erro</span>
          <span className={cn(fieldBox, "border-brand-red")}>duelista@</span>
          <span className="text-sm font-bold text-red-text">
            Esse e-mail não parece válido.
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ds-input-money">Com prefixo (valor)</Label>
          <div className="flex">
            <span
              aria-hidden="true"
              className="flex items-center border-3 border-r-0 border-input bg-brand-ink px-3.5 font-heading text-lg text-brand-yellow"
            >
              R$
            </span>
            <Input
              id="ds-input-money"
              type="text"
              inputMode="decimal"
              placeholder="250"
              className="h-14 flex-1 font-heading text-[22px]"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className={fieldLabel}>Com ação (senha)</span>
          <div className="flex">
            <span className={cn(fieldBox, "flex-1 border-r-0 border-input")}>
              ••••••••
            </span>
            <span className="flex w-[52px] flex-none items-center justify-center border-3 border-input bg-brand-ink text-brand-yellow">
              <DesignIcon name="olho" size={20} />
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <span className={fieldLabel}>Checkbox</span>
          <span className="flex items-center gap-2.5 font-semibold">
            <span className="flex size-6 items-center justify-center border-3 border-input bg-brand-yellow text-brand-ink">
              <DesignIcon name="check" size={14} strokeWidth={4} />
            </span>
            Marcado
          </span>
          <span className="flex items-center gap-2.5 font-semibold">
            <span className="size-6 border-3 border-input bg-field" />
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
          <span className="text-xs text-muted-foreground">
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
          <article className="lift border-4 border-border bg-card shadow-hard-8 shadow-brand-red">
            <div
              className={cn(
                cardStage,
                "border-border bg-[repeating-linear-gradient(-45deg,rgba(246,186,4,0.10)_0_2px,transparent_2px_14px),var(--stage)]"
              )}
            >
              <span className="absolute top-0 left-0 flex items-center gap-1.5 border-r-3 border-b-3 border-black bg-brand-red px-2 py-1 font-heading text-[11px] text-white">
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
              <strong className="font-heading text-[15px]">
                Magnum the Reliever
              </strong>
              <span className="font-heading text-xl">R$ 189,90</span>
              <span className="flex justify-between border-2 border-black bg-brand-red px-2.5 py-1.5 text-xs font-bold text-white uppercase">
                Acabando! <span className="font-heading">00:04:18</span>
              </span>
            </div>
          </article>
          <span className="text-[13px] text-muted-foreground">
            <strong className="text-foreground">Ao vivo</strong> · sombra
            vermelha, selo pulsante, cronômetro.
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          <article className="lift border-4 border-black bg-card shadow-hard-8 shadow-brand-ink">
            <div
              className={cn(
                cardStage,
                "border-black bg-[repeating-linear-gradient(-45deg,rgba(248,13,23,0.12)_0_2px,transparent_2px_14px),var(--stage)]"
              )}
            >
              <span className="absolute top-0 left-0 border-r-3 border-b-3 border-black bg-brand-yellow px-2 py-1 font-heading text-[11px] text-brand-ink">
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
              <strong className="font-heading text-[15px]">
                Parallel Teleport
              </strong>
              <span className="flex border-3 border-input font-heading text-xs">
                <span className="flex-1 bg-brand-ink px-2 py-1.5 text-brand-yellow">
                  30 OUT · 20H
                </span>
                <span className="flex-1 px-2 py-1.5">R$ 15,00</span>
              </span>
            </div>
          </article>
          <span className="text-[13px] text-muted-foreground">
            <strong className="text-foreground">Agendado</strong> · vive sobre a
            faixa amarela, sombra preta fixa.
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          <article className="border-4 border-border bg-card shadow-hard-8">
            <div
              className={cn(
                cardStage,
                "overflow-hidden border-border bg-stage-closed"
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
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-14 border-4 border-brand-red bg-white px-2.5 py-1 font-heading text-base whitespace-nowrap text-brand-red outline-3 outline-black">
                Arrematado!
              </span>
            </div>
            <div className="flex flex-col gap-2 p-3.5">
              <strong className="font-heading text-[15px]">
                Performapal Sky Pupil
              </strong>
              <span className="font-heading text-xl text-red-text">
                R$ 12,00
              </span>
            </div>
          </article>
          <span className="text-[13px] text-muted-foreground">
            <strong className="text-foreground">Encerrado</strong> · imagem em
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
          <span className="flex items-center gap-2 border-2 border-black bg-brand-ink px-3 py-2 text-[13px] font-bold text-brand-yellow uppercase">
            Termina em
            <span className="ml-auto font-heading text-base tabular-nums">
              01:12:00
            </span>
          </span>
          <span className="flex items-center gap-2 border-2 border-black bg-brand-red px-3 py-2 text-[13px] font-bold text-white uppercase">
            Acabando!
            <span className="ml-auto font-heading text-base tabular-nums">
              00:04:18
            </span>
          </span>
          <span className="text-xs text-muted-foreground">
            Fica vermelho abaixo de 10 min (cards) ou 5 min (lote).
          </span>
        </Panel>
        <Panel className="flex flex-col gap-3.5 p-5">
          <Eyebrow>Confirmação</Eyebrow>
          <span className="flex -rotate-1 items-center gap-2.5 border-3 border-black bg-brand-yellow px-3.5 py-3 font-bold text-brand-ink">
            <DesignIcon name="check" size={20} />
            Você está na frente!
          </span>
          <span className="text-sm font-bold text-red-text">
            O lance mínimo agora é R$ 250,00.
          </span>
          <span className="text-xs text-muted-foreground">
            Sucesso: faixa amarela torta + <Code>role=&quot;status&quot;</Code>.
            Erro: texto vermelho sob o campo +{" "}
            <Code>role=&quot;alert&quot;</Code>.
          </span>
        </Panel>
        <Panel className="flex flex-col gap-3.5 p-5">
          <Eyebrow>Blocos de valor</Eyebrow>
          <div className="border-4 border-black bg-brand-yellow p-3.5 text-brand-ink shadow-hard-6 shadow-brand-red">
            <div className="text-xs font-bold tracking-[1px] uppercase">
              Saldo disponível
            </div>
            <div className="font-heading text-[28px]">R$ 300,00</div>
          </div>
          <div className="flex border-3 border-input">
            <div className="flex-1 px-2.5 py-2">
              <div className="text-[11px] font-bold text-muted-foreground uppercase">
                Acréscimo
              </div>
              <div className="font-heading">R$ 5,00</div>
            </div>
            <div className="flex-1 border-l-3 border-input bg-brand-ink px-2.5 py-2 text-brand-yellow">
              <div className="text-[11px] font-bold text-white uppercase">
                Mínimo
              </div>
              <div className="font-heading">R$ 250,00</div>
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
