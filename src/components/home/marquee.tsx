//* Libraries imports
import { getTranslations } from "next-intl/server"

const words = ["bid", "win", "duel", "collect"] as const

//* The track holds the words four times; the animation moves it by half
const repeats = 4

export async function Marquee() {
  const t = await getTranslations("pages./.marquee")
  const track = Array.from({ length: repeats }, () => words).flat()

  return (
    <div
      aria-hidden="true"
      className="relative z-5 -mx-5 -mt-7 rotate-[-1.5deg] overflow-hidden border-y-4 border-black bg-brand-yellow py-3.5"
    >
      <div className="flex w-max animate-marquee font-heading text-[26px] whitespace-nowrap text-brand-ink">
        {track.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className="flex items-center gap-7 pr-7"
          >
            {t(word)}
            <span className="inline-block size-3.5 rotate-45 border-2 border-black bg-brand-red" />
          </span>
        ))}
      </div>
    </div>
  )
}
