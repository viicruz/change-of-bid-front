"use client"

//* Libraries imports
import { useTheme } from "next-themes"
import { useEffect, useState, useSyncExternalStore } from "react"

//* Lib imports
import { cn } from "@/src/lib/utils"

const subscribeNoop = () => () => {}

//* `resolvedTheme` is only known on the client, so wait for hydration
function useIsClient() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  )
}

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
              "cob-display h-[38px] px-3 text-xs",
              pressed
                ? "bg-(--cob-red) text-white"
                : "bg-(--head-bg) text-(--head-text)"
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
                ? "border-black bg-(--cob-tinta) text-(--cob-yellow) shadow-[5px_5px_0_var(--cob-red)]"
                : "border-(--field-edge) bg-(--surface) text-(--text) shadow-[3px_3px_0_var(--shadow)]"
            )}
          >
            <span className="flex w-full justify-between">
              <span className="cob-display text-base">{tile.label}</span>
              <span
                aria-hidden="true"
                className={cn(
                  "block size-5 border-3 border-current",
                  on ? "bg-(--cob-red)" : "bg-transparent"
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
                "cob-display h-[38px] min-w-11 px-3 text-[13px]",
                on
                  ? "bg-(--cob-red) text-white"
                  : "bg-(--surface) text-(--text)"
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
                  ? "border-black bg-(--cob-red) text-white"
                  : "border-(--field-edge) bg-(--surface) text-(--text)"
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
        className="cob-pop -rotate-1 border-3 border-black bg-(--cob-yellow) px-3 py-2 font-bold text-(--cob-tinta)"
      >
        Lance confirmado!
      </span>
      <button
        type="button"
        onClick={() => setReplays((count) => count + 1)}
        className="min-h-8 text-sm font-bold text-(--red-text) underline"
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
        urgent
          ? "bg-(--cob-red) text-white"
          : "bg-(--cob-tinta) text-(--cob-yellow)"
      )}
    >
      {urgent ? "Acabando!" : "Termina em"}
      <span className="cob-display ml-auto text-lg tabular-nums">
        00:00:{String(left).padStart(2, "0")}
      </span>
    </span>
  )
}
