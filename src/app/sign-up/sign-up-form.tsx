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
import { SignUpError, useSignUp } from "@/src/hooks/auth/use-sign-up"
import { useErrorTranslations } from "@/src/hooks/commons/use-error-translations"

//* Schema imports
import { signUpSchema, type SignUpValues } from "./sign-up-schema"

const apiFieldByCode = {
  INVALID_EMAIL: "email",
  PASSWORD_TOO_SHORT: "password",
  PASSWORD_TOO_LONG: "password",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "email",
} as const

type ApiFieldCode = keyof typeof apiFieldByCode

function isApiFieldCode(code: unknown): code is ApiFieldCode {
  return typeof code === "string" && code in apiFieldByCode
}

function SignUpField(props: {
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

export function SignUpForm() {
  const router = useRouter()
  const t = useTranslations("pages./sign-up")
  const translateError = useErrorTranslations()
  const signUp = useSignUp()
  const [formErrorCode, setFormErrorCode] = useState<string | null>(null)
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  function onSubmit(values: SignUpValues) {
    setFormErrorCode(null)
    signUp.mutate({
      name: values.name,
      email: values.email,
      password: values.password,
    }, {
      onSuccess: () => {
        router.push("/")
      },
      onError: (error) => {
        const code = error instanceof SignUpError ? error.code : ""

        if (isApiFieldCode(code)) {
          form.setError(apiFieldByCode[code], { message: code })
          return
        }

        setFormErrorCode(code)
      },
    })
  }

  const errors = form.formState.errors

  return (
    <form
      id="sign-up-form"
      className="flex flex-col gap-4"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <SignUpField
        id="sign-up-name"
        label={t("name")}
        type="text"
        autoComplete="name"
        error={
          errors.name?.message ? translateError(errors.name.message) : undefined
        }
        registration={form.register("name")}
      />
      <SignUpField
        id="sign-up-email"
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
      <SignUpField
        id="sign-up-password"
        label={t("password")}
        type="password"
        autoComplete="new-password"
        error={
          errors.password?.message
            ? translateError(errors.password.message)
            : undefined
        }
        registration={form.register("password")}
      />
      <SignUpField
        id="sign-up-confirm-password"
        label={t("confirmPassword")}
        type="password"
        autoComplete="new-password"
        error={
          errors.confirmPassword?.message
            ? translateError(errors.confirmPassword.message)
            : undefined
        }
        registration={form.register("confirmPassword")}
      />
      {formErrorCode !== null ? (
        <p id="sign-up-error" role="alert" className="text-sm text-destructive">
          {translateError(formErrorCode)}
        </p>
      ) : null}
      <Button
        id="sign-up-submit"
        type="submit"
        className="w-full"
        disabled={signUp.isPending || signUp.isSuccess}
      >
        {signUp.isPending ? t("submitting") : t("submit")}
      </Button>
    </form>
  )
}
