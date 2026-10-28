//* Components imports
import { QueryProvider } from "@/src/components/query-provider"
import { DepositForm } from "@/src/components/wallet/deposit-form"

export function Default() {
  return (
    <QueryProvider>
      <DepositForm onDeposited={() => undefined} />
    </QueryProvider>
  )
}
