import { useState } from "react"

import { MoneyInput } from "@/src/components/ui/money-input"

export function Default() {
  const [value, setValue] = useState("")
  const [locale, setLocale] = useState<string>()

  return (
    <div>
      <MoneyInput
        aria-label="Amount"
        value={value}
        onValueChange={setValue}
        locale={locale}
      />
      <output aria-label="Decimal value">{value}</output>
      <button onClick={() => setLocale("en")}>English</button>
      <button onClick={() => setValue("1234.56")}>Set amount</button>
      <button onClick={() => setValue("")}>Reset</button>
    </div>
  )
}
