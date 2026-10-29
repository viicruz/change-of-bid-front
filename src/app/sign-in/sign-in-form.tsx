"use client"

//* Libraries imports
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useState, type ReactNode } from "react"
import { useForm, type UseFormRegisterReturn } from "react-hook-form"

//* Components imports
import { ArrowRightIcon } from "@/src/components/ui/brand"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

//* Hooks imports
import { SignInError, useSignIn } from "@/src/hooks/auth/use-sign-in"
import { useErrorTranslations } from "@/src/hooks/commons/use-error-translations"

//* Lib imports
import { cn } from "@/src/lib/utils"

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
  placeholder: string
  error?: string
  registration: UseFormRegisterReturn
  //* Button glued to the input's right edge
  addon?: ReactNode
}) {
  const errorId = `${props.id}-error`
  const input = (
    <Input
      id={props.id}
      type={props.type}
      autoComplete={props.autoComplete}
      placeholder={props.placeholder}
      aria-invalid={props.error ? true : undefined}
      aria-describedby={props.error ? errorId : undefined}
      className={cn(props.addon && "peer flex-1 border-r-0")}
      {...props.registration}
    />
  )

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={props.id}>{props.label}</Label>
      {props.addon ? (
        <div className="flex">
          {input}
          {props.addon}
        </div>
      ) : (
        input
      )}
      {props.error ? (
        <p id={errorId} className="text-sm font-bold text-destructive">
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
  const [showPassword, setShowPassword] = useState(false)
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
    signIn.mutate(
      {
        email: values.email,
        password: values.password,
      },
      {
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
      }
    )
  }

  const errors = form.formState.errors

  return (
    <form
      id="sign-in-form"
      className="flex flex-col gap-5.5"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <SignInField
        id="sign-in-email"
        label={t("email")}
        type="email"
        autoComplete="email"
        placeholder={t("emailPlaceholder")}
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
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        placeholder={t("passwordPlaceholder")}
        error={
          errors.password?.message
            ? translateError(errors.password.message)
            : undefined
        }
        registration={form.register("password")}
        addon={
          <button
            id="sign-in-password-toggle"
            type="button"
            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
            aria-controls="sign-in-password"
            onClick={() => setShowPassword((shown) => !shown)}
            className="flex size-13 shrink-0 items-center justify-center border-3 border-input bg-brand-ink text-brand-yellow outline-none peer-aria-invalid:border-brand-red focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ring focus-visible:outline-solid"
          >
            {showPassword ? (
              <EyeOff className="size-5" strokeWidth={2.5} aria-hidden />
            ) : (
              <Eye className="size-5" strokeWidth={2.5} aria-hidden />
            )}
          </button>
        }
      />
      {formErrorCode !== null ? (
        <p
          id="sign-in-error"
          role="alert"
          className="text-sm font-bold text-destructive"
        >
          {translateSignInError(formErrorCode)}
        </p>
      ) : null}
      <Button
        id="sign-in-submit"
        type="submit"
        size="lg"
        className="h-auto min-h-16 w-full px-4.5 whitespace-normal"
        disabled={signIn.isPending || signIn.isSuccess}
      >
        {signIn.isPending ? t("submitting") : t("submit")}
        <ArrowRightIcon />
      </Button>
    </form>
  )
}
