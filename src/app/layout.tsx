//* Libraries imports
import { NextIntlClientProvider } from "next-intl"
import { getLocale } from "next-intl/server"
import { Geist_Mono, Merriweather, Roboto } from "next/font/google"

//* Components imports
import { Navbar } from "@/src/components/navbar/navbar"
import { QueryProvider } from "@/src/components/query-provider"
import { ThemeProvider } from "@/src/components/theme-provider"

//* Lib imports
import { cn } from "@/src/lib/utils"

//* Styles imports
import "./globals.css"

const merriweatherHeading = Merriweather({
  subsets: ["latin"],
  variable: "--font-heading",
})

const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" })

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
        roboto.variable,
        merriweatherHeading.variable
      )}
    >
      <body className="flex min-h-svh flex-col">
        <NextIntlClientProvider locale={locale}>
          <QueryProvider>
            <ThemeProvider>
              <Navbar />
              {children}
            </ThemeProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
