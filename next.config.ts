import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"
import { env } from "@/src/env/client"

const nextConfig: NextConfig = {
  //* Same-origin proxy so the session cookie is first-party (Safari blocks third-party cookies).
  //* The source must match backendProxyPath in src/lib/backend-url.ts
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, "")}/:path*`,
      },
    ]
  },
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
