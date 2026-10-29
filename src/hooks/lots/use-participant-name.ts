"use client"

//* Libraries imports
import { useTranslations } from "next-intl"

//* Local imports
import { isViewer } from "@/src/lib/lots/public-lot-room"

export function useParticipantName() {
  const t = useTranslations("pages./auction/[id]")

  return (participantNo: number, viewerParticipantNo: number | null) => {
    const number = String(participantNo)

    return isViewer(participantNo, viewerParticipantNo)
      ? t("youWithNumber", { number })
      : t("participant", { number })
  }
}
