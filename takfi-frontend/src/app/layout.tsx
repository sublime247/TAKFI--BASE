import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { Sidebar } from "@/app/components/sidebar"
import { Header } from "@/app/components/header"
import { Providers } from "./provider"
import '@rainbow-me/rainbowkit/styles.css';

export const metadata: Metadata = {
  title: "TAKFI  Dashboard",
  description: "TAKFI is a sharia-compliant insurance platform",

}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/tk.png" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers>
        <div className="flex h-screen bg-[#0B0F0E] overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col min-w-0">
            <Header />
            <main className="flex-1 p-6 overflow-y-auto">
              <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
            </main>
          </div>
        </div>
        <Analytics />
        </Providers>
      </body>
    </html>
  )
}
// add icon