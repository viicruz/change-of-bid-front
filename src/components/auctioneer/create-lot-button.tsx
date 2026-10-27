"use client"

//* Libraries imports
import { useTranslations } from "next-intl"
import { useFormContext } from "react-hook-form"

//* Components imports
import { Button } from "@/src/components/ui/button"

//* Local imports
import { useCreateLotMutation } from "@/src/components/auctioneer/create-lot-provider"
import {
  emptyCreateLotForm,
  type CreateLotFormValues,
} from "@/src/components/auctioneer/create-lot-form-schema"

type CreateLotButtonProps = {
  onCreateLot: () => void
}

export function CreateLotButton(props: CreateLotButtonProps) {
  const t = useTranslations("pages./auctioneer")
  const form = useFormContext<CreateLotFormValues>()
  const storeLot = useCreateLotMutation()

  function onClick() {
    form.reset(emptyCreateLotForm)
    storeLot.reset()
    props.onCreateLot()
  }

  return (
    <Button id="create-lot" type="button" className="w-full" onClick={onClick}>
      {t("createLot")}
    </Button>
  )
}
