//* Components imports
import { voiceDo, voiceDont } from "@/src/components/design/design-data"
import { DesignIcon } from "@/src/components/design/design-icons"
import { DesignSection } from "@/src/components/design/design-primitives"

//* Lib imports
import { cn } from "@/src/lib/utils"

const voiceColumns = [
  {
    title: "Assim",
    icon: "check",
    items: voiceDo,
    tone: "bg-brand-yellow text-brand-ink",
    shadow: "shadow-hard-8 shadow-brand-yellow",
  },
  {
    title: "Não assim",
    icon: "fechar",
    items: voiceDont,
    tone: "bg-brand-red text-white",
    shadow: "shadow-hard-8 shadow-brand-red",
  },
] as const

export function VoiceSection() {
  return (
    <DesignSection
      id="voz"
      number="07"
      title="Voz e tom"
      className="gap-7 pb-0"
      description="Falamos como um duelista animado na mesa da loja: direto, brincalhão, com gírias de Yu-Gi-Oh! na medida. Em dinheiro e erros, a brincadeira dá lugar à clareza."
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-7">
        {voiceColumns.map((column) => (
          <div
            key={column.title}
            className={cn("border-4 border-black bg-card", column.shadow)}
          >
            <div
              className={cn(
                "flex items-center gap-2 border-b-4 border-black px-4 py-2.5 font-heading text-base",
                column.tone
              )}
            >
              <DesignIcon name={column.icon} size={18} />
              {column.title}
            </div>
            <ul className="m-0 flex list-disc flex-col gap-2.5 py-4 pr-4 pl-9 text-[15px] leading-[1.45]">
              {column.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </DesignSection>
  )
}
