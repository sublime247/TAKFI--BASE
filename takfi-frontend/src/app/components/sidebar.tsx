"use client"

import { Home, FileText, ClipboardList, TrendingUp, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"

const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Policies", href: "/policies", icon: FileText },
    { name: "Claims", href: "/claims", icon: ClipboardList },
    { name: "Surplus & Reports", href: "/reports", icon: TrendingUp },
    { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col" style={{ backgroundColor: "#141A16" }}>
            {/* Logo */}
            <div className="flex shrink-0 items-center">
                <div className="flex  space-x-3 py-4 px-5 ">
                    <img src="/logo.png" alt="TakFi" className="mr-10 pr-10" />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-1 flex-col px-4 py-4 mt-30">
                <ul role="list" className="flex flex-1 flex-col gap-y-10">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                        return (
                            <li key={item.name}>
                                <Button
                                    variant="ghost"
                                    onClick={() => router.push(item.href)}
                                    className={cn(
                                        "w-full justify-start gap-x-3 px-3 py-5 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer",
                                        isActive && "text-white",
                                    )}
                                    style={isActive ? { backgroundColor: "#12D96A", color: "#0B0F0E" } : {}}
                                >
                                    <item.icon className="h-5 w-5 shrink-0" />
                                    {item.name}
                                </Button>
                            </li>
                        )
                    })}
                </ul>
            </nav>
        </div>
    )
}
