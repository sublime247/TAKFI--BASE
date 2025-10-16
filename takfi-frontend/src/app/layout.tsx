"use client"
import type React from "react"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { Sidebar } from "@/app/components/sidebar"
import { Header } from "@/app/components/header"
import { usePathname } from "next/navigation"
import { Providers } from "./provider"
import { Toaster } from "@/components/ui/sonner"
import '@rainbow-me/rainbowkit/styles.css';

// export const metadata: Metadata = {
//   title: "TAKFI",
//   description: "TAKFI is a sharia-compliant insurance platform",

// }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname();
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/tk.png" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers>
          <div className="flex h-screen bg-[#0B0F0E] overflow-hidden">
            {pathname != "/" && <Sidebar />}
            <div className="flex flex-1 flex-col min-w-0">
              {pathname != "/" && <Header />}
              <main className="flex-1 p-6 overflow-y-auto">
                <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
              </main>
            </div>
          </div>
          <Analytics />
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
// add icon