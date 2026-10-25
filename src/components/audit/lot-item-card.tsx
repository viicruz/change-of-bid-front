"use client"

//* Libraries imports
import { useTranslations } from "next-intl"

//* Components imports
import Card from "@/src/components/ui/card"

//* Lib imports
import type { LotItem } from "@/src/lib/audit/mock-audit"

export function LotItemCard(props: { item: LotItem }) {
  const t = useTranslations("pages./auction/[id]/audit")

  return (
    <Card.Root id={`lot-item-${props.item.id}`}>
      <Card.Content className="flex gap-4">
        <div
          aria-hidden="true"
          className="h-28 w-20 shrink-0 rounded-md bg-muted"
        />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="font-heading font-medium">{props.item.name}</p>
          <p>
            <span className="text-muted-foreground">{t("cardType")}</span>{" "}
            {t(`cardTypes.${props.item.cardType}`)}
          </p>
          <p>
            <span className="text-muted-foreground">{t("rarity")}</span>{" "}
            {t(`rarities.${props.item.rarity}`)}
          </p>
          <p>
            <span className="text-muted-foreground">{t("condition")}</span>{" "}
            {t(`conditions.${props.item.condition}`)}
          </p>
          <p>
            <span className="text-muted-foreground">{t("setName")}</span>{" "}
            {props.item.setName}
          </p>
        </div>
      </Card.Content>
    </Card.Root>
  )
}
