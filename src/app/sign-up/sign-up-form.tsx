"use client"

//* Libraries imports
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "cn"
import { Gavel, HandCoins, type LucideIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  Controller,
  useForm,
  type UseFormRegisterReturn,
} from "react-hook-form"

//* Components imports
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"

//* Hooks imports
import { SignUpError, useSignUp } from "@/src/hooks/auth/use-sign-up"
import { useErrorTranslations } from "@/src/hooks/commons/use-error-translations"

//* Schema imports
import { type UserRole } from "@/src/schemas/user"
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

const roleOptions = [
  {
    value: "BIDDER",
    icon: HandCoins,
  },
  {
    value: "AUCTIONEER",
    icon: Gavel,
  },
] as const satisfies readonly { value: UserRole; icon: LucideIcon }[]

function SignUpRoleOption(props: {
  value: UserRole
  title: string
  description: string
  icon: LucideIcon
  invalid?: boolean
}) {
  const Icon = props.icon

  return (
    <Label
      className={cn(
        "group flex cursor-pointer items-center gap-3 border border-border bg-background p-3 transition-colors hover:bg-muted/70 has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-data-checked:border-foreground has-data-checked:bg-muted",
        props.invalid && "border-destructive"
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center border border-border bg-card text-foreground transition-colors group-has-data-checked:border-foreground group-has-data-checked:bg-foreground group-has-data-checked:text-background">
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-sm leading-none font-medium">{props.title}</span>
        <span className="text-xs leading-snug font-normal text-muted-foreground">
          {props.description}
        </span>
      </span>
      <RadioGroupItem
        id={`sign-up-role-${props.value.toLowerCase()}`}
        value={props.value}
        aria-invalid={props.invalid || undefined}
      />
    </Label>
  )
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
    signUp.mutate(
      {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      },
      {
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
      }
    )
  }

  const errors = form.formState.errors

  return (
    <form
      id="sign-up-form"
      className="flex flex-col gap-4"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Controller
        name="role"
        control={form.control}
        render={({ field }) => (
          <div className="flex flex-col gap-2">
            <p
              id="sign-up-role-label"
              className="text-sm leading-none font-medium"
            >
              {t("role")}
            </p>
            <RadioGroup
              id="sign-up-role"
              name={field.name}
              className="grid gap-2"
              aria-labelledby="sign-up-role-label"
              aria-invalid={errors.role ? true : undefined}
              aria-describedby={errors.role ? "sign-up-role-error" : undefined}
              value={field.value ?? ""}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
            >
              {roleOptions.map((option) => {
                const copyKey =
                  option.value === "BIDDER" ? "bidder" : "auctioneer"

                return (
                  <SignUpRoleOption
                    key={option.value}
                    value={option.value}
                    icon={option.icon}
                    title={t(`roles.${copyKey}.title`)}
                    description={t(`roles.${copyKey}.description`)}
                    invalid={Boolean(errors.role)}
                  />
                )
              })}
            </RadioGroup>
            {errors.role?.message ? (
              <p id="sign-up-role-error" className="text-sm text-destructive">
                {translateError(errors.role.message)}
              </p>
            ) : null}
          </div>
        )}
      />
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
