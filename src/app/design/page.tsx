//* Libraries imports
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

//* Components imports
import { ColorsSection } from "@/src/components/design/colors-section"
import { ComponentsSection } from "@/src/components/design/components-section"
import {
  DesignFooter,
  DesignHeader,
  DesignIntro,
} from "@/src/components/design/design-layout"
import { IconsSection } from "@/src/components/design/icons-section"
import { MotionSection } from "@/src/components/design/motion-section"
import { ShapeSection } from "@/src/components/design/shape-section"
import { TypographySection } from "@/src/components/design/typography-section"
import { VoiceSection } from "@/src/components/design/voice-section"

//* Styles imports
import "./design.css"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages./design")

  return {
    title: t("title"),
    description: t("description"),
  }
}

export default function Page() {
  return (
    <div
      id="top"
      lang="pt-BR"
      className="min-h-svh flex-1 overflow-x-clip bg-background text-foreground"
    >
      <DesignHeader />
      <main className="mx-auto max-w-7xl px-[clamp(16px,4vw,48px)] pb-24">
        <DesignIntro />
        <ColorsSection />
        <TypographySection />
        <ShapeSection />
        <ComponentsSection />
        <IconsSection />
        <MotionSection />
        <VoiceSection />
      </main>
      <DesignFooter />
    </div>
  )
}
