//* Libraries imports
import type { ReactNode } from "react"

//* Components imports
import { marqueeWords, motionTable } from "@/src/components/design/design-data"
import { PopDemo, TimerDemo } from "@/src/components/design/design-interactive"
import {
  Code,
  DesignSection,
  Panel,
} from "@/src/components/design/design-primitives"
import { LiveDot } from "@/src/components/ui/brand"
import { Button } from "@/src/components/ui/button"

//* Lib imports
import { cn } from "@/src/lib/utils"

type MotionCardProps = {
  title: string
  description: string
  spec: string
  stageClassName?: string
  children: ReactNode
}

function MotionCard({
  title,
  description,
  spec,
  stageClassName,
  children,
}: MotionCardProps) {
  return (
    <Panel className="flex flex-col">
      <div
        className={cn(
          "flex h-[140px] items-center justify-center border-b-4 border-border bg-muted",
          stageClassName
        )}
      >
        {children}
      </div>
      <div className="flex flex-col gap-1.5 p-3.5">
        <strong className="font-heading text-base">{title}</strong>
        <span className="text-[13px] text-muted-foreground">{description}</span>
        <Code className="self-start">{spec}</Code>
      </div>
    </Panel>
  )
}

//* Tripled so the -50% slide loops seamlessly
const marqueeItems = [...marqueeWords, ...marqueeWords, ...marqueeWords]

export function MotionSection() {
  return (
    <DesignSection
      id="animacoes"
      number="06"
      title="Animações"
      className="gap-7"
      description={
        <>
          Movimento curto e mecânico, como carta batendo na mesa: nada de mola
          longa ou fade lento. Tudo respeita <Code>prefers-reduced-motion</Code>{" "}
          — quem pede menos movimento vê os estados finais, sem animação.
        </>
      }
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-6">
        <MotionCard
          title="Pulso"
          description="Ponto de “ao vivo”. Escala 1 → 0,6 e opacidade 1 → 0,3."
          spec="1.1s ease-in-out infinite"
        >
          <span className="flex items-center gap-2.5 border-3 border-black bg-brand-red px-3.5 py-2 font-heading text-base text-white">
            <LiveDot size={12} />
            Ao vivo
          </span>
        </MotionCard>

        <MotionCard
          title="Faixa (marquee)"
          description="Conteúdo duplicado, desliza −50% em loop. Demo acelerada; na LP é 30s."
          spec="30s linear infinite"
          stageClassName="justify-start overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="-ml-[10%] w-[120%] -rotate-[1.5deg] overflow-hidden border-y-3 border-black bg-brand-yellow py-2"
          >
            <div className="flex w-max animate-marquee-fast font-heading text-lg whitespace-nowrap text-brand-ink">
              {marqueeItems.map((word, index) => (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: static, repeated words
                  key={index}
                  className="flex items-center gap-4 pr-4"
                >
                  {word}
                  <span className="inline-block size-2.5 rotate-45 border-2 border-black bg-brand-red" />
                </span>
              ))}
            </div>
          </div>
        </MotionCard>

        <MotionCard
          title="Levantar card"
          description="Hover em cards: sobe −4px e gira −0,6°, como carta saindo da mão."
          spec=".16s ease · translate(-4px,-4px)"
        >
          <div className="flex h-20 w-[150px] lift items-center justify-center border-4 border-border bg-card text-center font-heading text-[13px] shadow-hard-6 shadow-brand-red">
            Passe o
            <br />
            mouse
          </div>
        </MotionCard>

        <MotionCard
          title="Apertar botão"
          description="Hover sobe −3px, clique afunda 2px em direção à sombra."
          spec=".12s ease"
        >
          <Button size="sm" className="border-4 text-base">
            Clique em mim
          </Button>
        </MotionCard>

        <MotionCard
          title="Pop de confirmação"
          description="Entra de 90% e −2° para 100% e −1°. Usado em sucesso de lance e carteira."
          spec=".25s ease-out"
          stageClassName="flex-col gap-3"
        >
          <PopDemo />
        </MotionCard>

        <MotionCard
          title="Cronômetro"
          description="Atualiza a cada segundo e troca para vermelho perto do fim (demo: últimos 10s)."
          spec="setInterval 1000ms"
          stageClassName="px-5"
        >
          <TimerDemo />
        </MotionCard>
      </div>

      <div className="overflow-x-auto border-4 border-border bg-card shadow-hard-8">
        <table className="ds-table">
          <thead>
            <tr>
              <th scope="col">Animação</th>
              <th scope="col">Duração</th>
              <th scope="col">Curva</th>
              <th scope="col">Classe</th>
              <th scope="col">Onde</th>
            </tr>
          </thead>
          <tbody>
            {motionTable.map((motion) => (
              <tr key={motion.name}>
                <td>
                  <strong>{motion.name}</strong>
                </td>
                <td>{motion.duration}</td>
                <td>{motion.ease}</td>
                <td>
                  <Code>{motion.className}</Code>
                </td>
                <td className="text-sm text-muted-foreground">
                  {motion.where}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DesignSection>
  )
}
