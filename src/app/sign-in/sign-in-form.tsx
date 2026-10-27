"use client"

//* Libraries imports
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm, type UseFormRegisterReturn } from "react-hook-form"

//* Components imports
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

//* Hooks imports
import { SignInError, useSignIn } from "@/src/hooks/auth/use-sign-in"
import { useErrorTranslations } from "@/src/hooks/commons/use-error-translations"

//* Schema imports
import { signInSchema, type SignInValues } from "./sign-in-schema"

const apiFieldByCode = {
  INVALID_EMAIL: "email",
  PASSWORD_TOO_SHORT: "password",
  PASSWORD_TOO_LONG: "password",
} as const

type ApiFieldCode = keyof typeof apiFieldByCode

type ErrorCatalog = {
  has: (key: string) => boolean
}

function isApiFieldCode(code: unknown): code is ApiFieldCode {
  return typeof code === "string" && code in apiFieldByCode
}

function SignInField(props: {
  id: string
  label: string
  type: string
  autoComplete: string
  error?: string
  registration: UseFormRegisterReturn
}) {
  const errorId = `${props.id}-error`

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={props.id}>{props.label}</Label>
      <Input
        id={props.id}
        type={props.type}
        autoComplete={props.autoComplete}
        aria-invalid={props.error ? true : undefined}
        aria-describedby={props.error ? errorId : undefined}
        {...props.registration}
      />
      {props.error ? (
        <p id={errorId} className="text-sm text-destructive">
          {props.error}
        </p>
      ) : null}
    </div>
  )
}

export function SignInForm() {
  const router = useRouter()
  const t = useTranslations("pages./sign-in")
  const schemas = useTranslations("schemas") as unknown as ErrorCatalog
  const exceptions = useTranslations("exceptions") as unknown as ErrorCatalog
  const translateError = useErrorTranslations()
  const signIn = useSignIn()
  const [formErrorCode, setFormErrorCode] = useState<string | null>(null)
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  function translateSignInError(code: string) {
    if (schemas.has(code) || exceptions.has(code)) {
      return translateError(code)
    }

    return t("unknownError")
  }

  function onSubmit(values: SignInValues) {
    setFormErrorCode(null)
    signIn.mutate({
      email: values.email,
      password: values.password,
    }, {
      onSuccess: () => {
        router.push("/")
      },
      onError: (error) => {
        const code = error instanceof SignInError ? error.code : ""
        setFormErrorCode(code)
        if (isApiFieldCode(code)) {
          form.setError(apiFieldByCode[code], { message: code })
        }
      },
    })
  }

  const errors = form.formState.errors

  return (
    <form
      id="sign-in-form"
      className="flex flex-col gap-4"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <SignInField
        id="sign-in-email"
        label={t("email")}
        type="email"
        autoComplete="email"
        error={
          errors.email?.message
            ? translateError(errors.email.message)
            : undefined
        }
        registration={form.register("email")}
      />
      <SignInField
        id="sign-in-password"
        label={t("password")}
        type="password"
        autoComplete="current-password"
        error={
          errors.password?.message
            ? translateError(errors.password.message)
            : undefined
        }
        registration={form.register("password")}
      />
      {formErrorCode !== null ? (
        <p id="sign-in-error" role="alert" className="text-sm text-destructive">
          {translateSignInError(formErrorCode)}
        </p>
      ) : null}
      <Button
        id="sign-in-submit"
        type="submit"
        className="w-full"
        disabled={signIn.isPending || signIn.isSuccess}
      >
        {signIn.isPending ? t("submitting") : t("submit")}
      </Button>
    </form>
  )
}
