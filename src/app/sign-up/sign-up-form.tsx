"use client"

//* Libraries imports
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm, type UseFormRegisterReturn } from "react-hook-form"

//* Components imports
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"

//* Auth imports
import { authClient } from "@/src/lib/auth-client"

//* Schema imports
import { signUpSchema, type SignUpValues } from "./sign-up-schema"

const apiFieldByCode = {
  INVALID_EMAIL: "email",
  PASSWORD_TOO_SHORT: "password",
  PASSWORD_TOO_LONG: "password",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "email",
} as const

type ApiFieldCode = keyof typeof apiFieldByCode

const fallbackErrorMessage = "Unable to create the account."

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
  const [formError, setFormError] = useState<string | null>(null)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: SignUpValues) {
    setFormError(null)
    setIsSigningUp(true)
    let signedUp = false

    try {
      const result = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      })

      if (result.error) {
        const message = result.error.message || fallbackErrorMessage
        const code = result.error.code

        if (isApiFieldCode(code)) {
          form.setError(apiFieldByCode[code], { message })
          return
        }

        setFormError(message)
        return
      }

      signedUp = true
      router.push("/")
    } catch {
      setFormError(fallbackErrorMessage)
    } finally {
      if (!signedUp) {
        setIsSigningUp(false)
      }
    }
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
        label="Name"
        type="text"
        autoComplete="name"
        error={errors.name?.message}
        registration={form.register("name")}
      />
      <SignUpField
        id="sign-up-email"
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        registration={form.register("email")}
      />
      <SignUpField
        id="sign-up-password"
        label="Password"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        registration={form.register("password")}
      />
      <SignUpField
        id="sign-up-confirm-password"
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        registration={form.register("confirmPassword")}
      />
      {formError ? (
        <p id="sign-up-error" role="alert" className="text-sm text-destructive">
          {formError}
        </p>
      ) : null}
      <Button
        id="sign-up-submit"
        type="submit"
        className="w-full"
        disabled={isSigningUp}
      >
        {isSigningUp ? "Creating account..." : "Create account"}
      </Button>
    </form>
  )
}
