"use client"

//* Libraries imports
import { zodResolver } from "@hookform/resolvers/zod"
import type { SubmitEvent } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

//* Hooks imports
import {
  storeBidSchema,
  useStoreBid,
} from "@/src/hooks/lots/mutations/use-store-bid"
import type { ShowLot } from "@/src/hooks/lots/queries/use-show-lot"

//* Local imports
import {
  bidErrorMessageKey,
  centsToMoney,
  minimumBidCents,
  moneyToCents,
  readBidErrorCode,
} from "@/src/lib/auction/bid-money"

//* Quick bids add 1, 2 and 5 minimum increments over the current bid
const quickBidSteps = [1, 2, 5]

const placeBidSchema = storeBidSchema.pick({ amount: true })

type PlaceBidValues = z.infer<typeof placeBidSchema>

type BidPricing = Pick<
  ShowLot["lot"],
  "id" | "openingBid" | "currentBid" | "minIncrement"
>

//* Codes the API documents get their own message; anything else is generic
function bidErrorKey(error: unknown) {
  const code = readBidErrorCode(error)

  return code ? bidErrorMessageKey[code] : ("bidError" as const)
}

export function usePlaceBid(lot: BidPricing) {
  const storeBid = useStoreBid()
  const form = useForm<PlaceBidValues>({
    resolver: zodResolver(placeBidSchema),
    defaultValues: {
      amount: "",
    },
  })
  const amountError = form.formState.errors.amount?.message
  const describedBy = [
    amountError ? "bid-amount-error" : null,
    storeBid.isError ? "place-bid-error" : null,
  ]
    .filter((id) => id !== null)
    .join(" ")
  const minimumCents = minimumBidCents(lot)
  const incrementCents = moneyToCents(lot.minIncrement)

  function clearRequestError() {
    if (storeBid.isError) {
      storeBid.reset()
    }
  }

  function pickQuickBid(cents: number) {
    storeBid.reset()
    form.setValue("amount", centsToMoney(cents), {
      shouldValidate: form.formState.isSubmitted,
    })
  }

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    storeBid.reset()
    void form.handleSubmit((values) => {
      storeBid.mutate(
        {
          id: lot.id,
          amount: values.amount,
        },
        {
          onSuccess: () => {
            form.reset({ amount: "" })
          },
        }
      )
    })(event)
  }

  return {
    amountField: form.register("amount", { onChange: clearRequestError }),
    amountError,
    requestErrorKey: storeBid.isError ? bidErrorKey(storeBid.error) : null,
    invalid: Boolean(amountError) || storeBid.isError,
    describedBy: describedBy.length > 0 ? describedBy : undefined,
    pending: storeBid.isPending,
    minimumCents,
    baseCents: moneyToCents(lot.currentBid ?? lot.openingBid),
    //* Without bids the first quick bid is the opening bid itself
    quickBids: quickBidSteps.map(
      (step) => minimumCents + incrementCents * (step - 1)
    ),
    pickQuickBid,
    onSubmit,
  }
}
