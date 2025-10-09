import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between w-full px-6 border-b border-border">
      {/* Left side */}
      <div>
        <p className="text-2xl font-bold text-white">Welcome 👋</p>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-6">
        <Avatar className="h-8 w-8">
          <img src="/logo.png" alt="TakFi" className="w-100" />
        </Avatar>
        <ConnectButton />
      </div>
    </header>

  )
}
