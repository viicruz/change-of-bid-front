//* Components imports
import { SignUpForm } from "./sign-up-form"

export default function Page() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="flex w-full max-w-md flex-col gap-6 border border-border bg-card p-6 text-card-foreground">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-medium">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign up with your email and password.
          </p>
        </div>
        <SignUpForm />
      </div>
    </main>
  )
}
