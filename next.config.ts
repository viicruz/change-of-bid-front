import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"
import "@/src/env/client"
import "@/src/env/server"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.ygoprodeck.com",
        pathname: "/images/**",
      },
    ],
  },
}

const withNextIntl = createNextIntlPlugin({
  experimental: {
    createMessagesDeclaration: "./messages/en.json",
  },
})

export default withNextIntl(nextConfig)
