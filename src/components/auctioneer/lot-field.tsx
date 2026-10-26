"use client"

//* Libraries imports
import type { ReactNode } from "react"

//* Components imports
import { Label } from "@/src/components/ui/label"

type LotFieldProps = {
  id: string
  label: string
  error?: string
  children: ReactNode
}

export function LotField(props: LotFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={props.id}>{props.label}</Label>
      {props.children}
      {props.error ? (
        <p id={`${props.id}-error`} className="text-sm text-destructive">
          {props.error}
        </p>
      ) : null}
    </div>
  )
}
