"use client"

//* Libraries imports
import { zodResolver } from "@hookform/resolvers/zod"
import { createContext, useContext, type ReactNode } from "react"
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  type UseFieldArrayReturn,
} from "react-hook-form"

//* Hooks imports
import { useStoreLot } from "@/src/hooks/lots/mutations/use-store-lot"

//* Local imports
import {
  createLotFormSchema,
  emptyCreateLotForm,
  type CreateLotFormValues,
} from "@/src/components/auctioneer/create-lot-form-schema"

type CreateLotMutation = ReturnType<typeof useStoreLot>
type LotCardFields = UseFieldArrayReturn<CreateLotFormValues, "cards">

const CreateLotMutationContext = createContext<CreateLotMutation | null>(null)
const LotCardFieldsContext = createContext<LotCardFields | null>(null)

type CreateLotProviderProps = {
  children: ReactNode
}

export function useCreateLotMutation() {
  const mutation = useContext(CreateLotMutationContext)

  if (!mutation) {
    throw new Error(
      "useCreateLotMutation must be used within CreateLotProvider"
    )
  }

  return mutation
}

export function useLotCardFields() {
  const cards = useContext(LotCardFieldsContext)

  if (!cards) {
    throw new Error("useLotCardFields must be used within CreateLotProvider")
  }

  return cards
}

function LotCardFieldsProvider(props: CreateLotProviderProps) {
  const form = useFormContext<CreateLotFormValues>()
  const cards = useFieldArray({
    control: form.control,
    name: "cards",
  })

  return (
    <LotCardFieldsContext.Provider value={cards}>
      {props.children}
    </LotCardFieldsContext.Provider>
  )
}

export function CreateLotProvider(props: CreateLotProviderProps) {
  const storeLot = useStoreLot()
  const form = useForm<CreateLotFormValues>({
    resolver: zodResolver(createLotFormSchema),
    defaultValues: emptyCreateLotForm,
  })

  return (
    <CreateLotMutationContext.Provider value={storeLot}>
      <FormProvider {...form}>
        <LotCardFieldsProvider>{props.children}</LotCardFieldsProvider>
      </FormProvider>
    </CreateLotMutationContext.Provider>
  )
}
