import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"
import "@/src/env/client"
import "@/src/env/server"

const nextConfig: NextConfig = {
  images: {
    //* Allow local IP addresses to be used in the images URLs in development
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.ygoprodeck.com",
        pathname: "/images/**",
      },
      { //* Localhost images server
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/**",
      },
      { // production server
        protocol: "https",
        hostname: "change-of-bid-back.onrender.com",
        pathname: "/**",
      }
    ],
  },
}

const withNextIntl = createNextIntlPlugin({
  experimental: {
    createMessagesDeclaration: "./messages/en.json",
  },
})

export default withNextIntl(nextConfig)
