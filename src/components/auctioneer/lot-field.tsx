"use client"

//* Libraries imports
import type { ReactNode } from "react"

//* Components imports
import { Label } from "@/src/components/ui/label"

type LotFieldProps = {
  id: string
  label: string
  error?: string
  //* Right of the label, such as a character count (`${id}-hint`)
  hint?: string
  children: ReactNode
}

export function LotField(props: LotFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={props.id} className="text-[13px]">
          {props.label}
        </Label>
        {props.hint ? (
          <span
            id={`${props.id}-hint`}
            className="text-[13px] font-semibold text-muted-foreground"
          >
            {props.hint}
          </span>
        ) : null}
      </div>
      {props.children}
      {props.error ? (
        <p
          id={`${props.id}-error`}
          className="text-[13px] font-bold text-red-text"
        >
          {props.error}
        </p>
      ) : null}
    </div>
  )
}

//* Ids for aria-describedby: the hint, then the error when there is one
export function lotFieldDescribedBy(props: {
  id: string
  hint?: boolean
  error?: unknown
}) {
  const ids = [
    props.hint ? `${props.id}-hint` : null,
    props.error ? `${props.id}-error` : null,
  ].filter((id) => id !== null)

  return ids.length > 0 ? ids.join(" ") : undefined
}
