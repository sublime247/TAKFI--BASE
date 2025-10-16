"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/app/components/sidebar"
import { Header } from "@/app/components/header"

export function LayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    // Landing page should not have dashboard layout
    const isLandingPage = pathname === "/"

    if (isLandingPage) {
        return <>{children}</>
    }

    // Dashboard routes get the full layout with sidebar and header
    return (
        <div className="flex h-screen bg-[#0B0F0E] overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col min-w-0">
                <Header />
                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}

