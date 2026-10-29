"use client"

//* Libraries imports
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/src/lib/utils"
import {
  Check,
  Eye,
  EyeOff,
  Gavel,
  HandCoins,
  type LucideIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useState, type ReactNode } from "react"
import {
  Controller,
  useForm,
  useWatch,
  type UseFormRegisterReturn,
} from "react-hook-form"

//* Components imports
import { ArrowRightIcon } from "@/src/components/ui/brand"
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
    value: "AUCTIONEER",
    icon: Gavel,
  },
  {
    value: "BIDDER",
    icon: HandCoins,
  },
] as const satisfies readonly { value: UserRole; icon: LucideIcon }[]

//* Selected tile flips to ink with yellow text and a red shadow
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
        "flex cursor-pointer flex-col items-stretch gap-2.5 border-3 border-input bg-card p-4 leading-normal font-normal tracking-normal text-foreground normal-case shadow-hard-4 transition-transform duration-120 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 has-data-checked:border-black has-data-checked:bg-brand-ink has-data-checked:text-brand-yellow has-data-checked:shadow-hard-6 has-data-checked:shadow-brand-red motion-reduce:transition-none",
        props.invalid && "border-brand-red"
      )}
    >
      <span className="flex items-center justify-between">
        <Icon className="size-8.5" strokeWidth={2.5} aria-hidden />
        <RadioGroupItem
          id={`sign-up-role-${props.value.toLowerCase()}`}
          value={props.value}
          aria-invalid={props.invalid || undefined}
          className="border-current bg-transparent *:data-[slot=radio-group-indicator]:hidden data-checked:bg-brand-red"
        />
      </span>
      <span className="font-heading text-xl leading-none">{props.title}</span>
      <span className="text-sm leading-[1.4]">{props.description}</span>
    </Label>
  )
}

function SignUpField(props: {
  id: string
  label: string
  type: string
  autoComplete: string
  placeholder: string
  error?: string
  registration: UseFormRegisterReturn
  //* Button glued to the input's right edge
  addon?: ReactNode
  children?: ReactNode
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
      {props.children}
    </div>
  )
}

export function SignUpForm() {
  const router = useRouter()
  const t = useTranslations("pages./sign-up")
  const translateError = useErrorTranslations()
  const signUp = useSignUp()
  const [formErrorCode, setFormErrorCode] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })
  const [password, confirmPassword] = useWatch({
    control: form.control,
    name: ["password", "confirmPassword"],
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
  const passwordType = showPassword ? "text" : "password"
  const passwordsMatch =
    password.length > 0 &&
    password === confirmPassword &&
    !errors.confirmPassword

  return (
    <form
      id="sign-up-form"
      className="flex flex-col gap-5.5"
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <SignUpField
        id="sign-up-name"
        label={t("name")}
        type="text"
        autoComplete="name"
        placeholder={t("namePlaceholder")}
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
        placeholder={t("emailPlaceholder")}
        error={
          errors.email?.message
            ? translateError(errors.email.message)
            : undefined
        }
        registration={form.register("email")}
      />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-4.5 gap-y-5.5">
        <SignUpField
          id="sign-up-password"
          label={t("password")}
          type={passwordType}
          autoComplete="new-password"
          placeholder={t("passwordPlaceholder")}
          error={
            errors.password?.message
              ? translateError(errors.password.message)
              : undefined
          }
          registration={form.register("password")}
          addon={
            <button
              id="sign-up-password-toggle"
              type="button"
              aria-label={showPassword ? t("hidePassword") : t("showPassword")}
              aria-controls="sign-up-password sign-up-confirm-password"
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
        <SignUpField
          id="sign-up-confirm-password"
          label={t("confirmPassword")}
          type={passwordType}
          autoComplete="new-password"
          placeholder={t("confirmPasswordPlaceholder")}
          error={
            errors.confirmPassword?.message
              ? translateError(errors.confirmPassword.message)
              : undefined
          }
          registration={form.register("confirmPassword")}
        >
          {passwordsMatch ? (
            <p
              id="sign-up-passwords-match"
              className="flex items-center gap-1.5 text-sm font-bold"
            >
              <Check
                className="size-4 text-brand-red"
                strokeWidth={3.5}
                aria-hidden
              />
              {t("passwordsMatch")}
            </p>
          ) : null}
        </SignUpField>
      </div>
      <Controller
        name="role"
        control={form.control}
        render={({ field }) => (
          <div className="flex flex-col gap-2.5">
            <p id="sign-up-role-label" className="type-label text-sm">
              {t("role")}
            </p>
            <RadioGroup
              id="sign-up-role"
              name={field.name}
              className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4"
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
              <p
                id="sign-up-role-error"
                className="text-sm font-bold text-destructive"
              >
                {translateError(errors.role.message)}
              </p>
            ) : null}
          </div>
        )}
      />
      {formErrorCode !== null ? (
        <p
          id="sign-up-error"
          role="alert"
          className="text-sm font-bold text-destructive"
        >
          {translateError(formErrorCode)}
        </p>
      ) : null}
      <Button
        id="sign-up-submit"
        type="submit"
        size="lg"
        className="mt-1.5 h-auto min-h-16 w-full px-4.5 whitespace-normal"
        disabled={signUp.isPending || signUp.isSuccess}
      >
        {signUp.isPending ? t("submitting") : t("submit")}
        <ArrowRightIcon />
      </Button>
    </form>
  )
}
