//* Libraries imports
import { NextIntlClientProvider } from "next-intl"
import { getLocale } from "next-intl/server"
import { Bungee, Chakra_Petch, Geist_Mono } from "next/font/google"
import { NuqsAdapter } from "nuqs/adapters/next/app"

//* Components imports
import { Navbar } from "@/src/components/navbar/navbar"
import { QueryProvider } from "@/src/components/query-provider"
import { ThemeProvider } from "@/src/components/theme-provider"

//* Lib imports
import { cn } from "@/src/lib/utils"

//* Styles imports
import "./globals.css"

//* Design system: Bungee for display (titles, buttons, values), Chakra Petch for text
const bungeeHeading = Bungee({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
})

const chakraPetch = Chakra_Petch({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        chakraPetch.variable,
        bungeeHeading.variable
      )}
    >
      <body className="flex min-h-svh flex-col">
        <NuqsAdapter>
          <NextIntlClientProvider locale={locale}>
            <QueryProvider>
              <ThemeProvider>
                <Navbar />
                {children}
              </ThemeProvider>
            </QueryProvider>
          </NextIntlClientProvider>
        </NuqsAdapter>
      </body>
    </html>
  )
}
