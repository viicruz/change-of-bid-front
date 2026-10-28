"use client"

//* Libraries imports
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

//* Hooks imports
import { useIsClient } from "@/src/hooks/use-is-client"

//* Lib imports
import { cn } from "@/src/lib/utils"

const themeOptions = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
] as const

export function DesignThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isClient = useIsClient()

  return (
    <div
      role="group"
      aria-label="Tema da documentação"
      className="flex h-11 border-3 border-black"
    >
      {themeOptions.map((option) => {
        const pressed = isClient && resolvedTheme === option.value

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={pressed}
            onClick={() => setTheme(option.value)}
            className={cn(
              "h-[38px] px-3 font-heading text-xs",
              pressed ? "bg-brand-red text-white" : "bg-header text-foreground"
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

const tiles = [
  { value: "auctioneer", label: "Leiloeiro", description: "Quero vender" },
  { value: "bidder", label: "Arrematante", description: "Quero comprar" },
] as const

export function ChoiceTiles() {
  const [selected, setSelected] = useState<string>(tiles[0].value)

  return (
    <div className="grid grid-cols-2 gap-3.5">
      {tiles.map((tile) => {
        const on = selected === tile.value

        return (
          <button
            key={tile.value}
            type="button"
            aria-pressed={on}
            onClick={() => setSelected(tile.value)}
            className={cn(
              "flex flex-col gap-2 border-3 p-3.5 text-left",
              on
                ? "border-black bg-brand-ink text-brand-yellow shadow-hard-5 shadow-brand-red"
                : "border-input bg-card text-foreground shadow-hard-3"
            )}
          >
            <span className="flex w-full justify-between">
              <span className="font-heading text-base">{tile.label}</span>
              <span
                aria-hidden="true"
                className={cn(
                  "block size-5 border-3 border-current",
                  on ? "bg-brand-red" : "bg-transparent"
                )}
              />
            </span>
            <span className="text-[13px]">{tile.description}</span>
          </button>
        )
      })}
    </div>
  )
}

const segments = [
  { value: "pt", label: "PT" },
  { value: "en", label: "EN" },
] as const

const chips = [
  { value: "all", label: "Todas" },
  { value: "bids", label: "Lances" },
  { value: "refunds", label: "Devoluções" },
  { value: "wins", label: "Arremates" },
] as const

export function SegmentedAndChips() {
  const [segment, setSegment] = useState<string>(segments[0].value)
  const [chip, setChip] = useState<string>(chips[0].value)

  return (
    <>
      <div className="flex h-11 self-start border-3 border-black">
        {segments.map((item) => {
          const on = segment === item.value

          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={on}
              onClick={() => setSegment(item.value)}
              className={cn(
                "h-[38px] min-w-11 px-3 font-heading text-[13px]",
                on ? "bg-brand-red text-white" : "bg-card text-foreground"
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        {chips.map((item) => {
          const on = chip === item.value

          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={on}
              onClick={() => setChip(item.value)}
              className={cn(
                "min-h-10 border-3 px-3.5 py-1.5 text-sm font-bold uppercase",
                on
                  ? "border-black bg-brand-red text-white"
                  : "border-input bg-card text-foreground"
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    </>
  )
}

export function PopDemo() {
  //* Changing the key remounts the badge, replaying the animation
  const [replays, setReplays] = useState(0)

  return (
    <>
      <span
        key={replays}
        role="status"
        className="-rotate-1 animate-pop border-3 border-black bg-brand-yellow px-3 py-2 font-bold text-brand-ink"
      >
        Lance confirmado!
      </span>
      <button
        type="button"
        onClick={() => setReplays((count) => count + 1)}
        className="min-h-8 text-sm font-bold text-red-text underline"
      >
        Repetir
      </button>
    </>
  )
}

const timerCycle = 16
const urgentThreshold = 10

export function TimerDemo() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick((value) => value + 1), 1000)

    return () => clearInterval(interval)
  }, [])

  const left = timerCycle - 1 - (tick % timerCycle)
  const urgent = left <= urgentThreshold

  return (
    <span
      className={cn(
        "flex w-full items-center gap-2 border-2 border-black px-3 py-2.5 text-[13px] font-bold uppercase",
        urgent ? "bg-brand-red text-white" : "bg-brand-ink text-brand-yellow"
      )}
    >
      {urgent ? "Acabando!" : "Termina em"}
      <span className="ml-auto font-heading text-lg tabular-nums">
        00:00:{String(left).padStart(2, "0")}
      </span>
    </span>
  )
}
