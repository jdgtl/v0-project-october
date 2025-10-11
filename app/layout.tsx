import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Project October",
  description: "Share and track your transactions with friends. A modern financial app for social expense sharing.",
  generator: "v0.app",
  metadataBase: new URL("https://projectoctober.vercel.app"),
  keywords: ["finance", "transactions", "expense sharing", "social finance", "money tracking"],
  authors: [{ name: "Project October" }],
  openGraph: {
    title: "Project October",
    description: "Share and track your transactions with friends. A modern financial app for social expense sharing.",
    url: "https://projectoctober.vercel.app",
    siteName: "Project October",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Project October - Social Finance Tracking",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Project October",
    description: "Share and track your transactions with friends. A modern financial app for social expense sharing.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} ${jetbrainsMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          {children}
          <Analytics />
          <SpeedInsights />
        </Suspense>
      </body>
    </html>
  )
}
