import { ReactNode } from "react"
import { ScrollToTop } from "@/components/ScrollToTop"
import { BottomNavigation } from "./BottomNavigation"
import { cn } from "@/lib/utils"

interface AppLayoutProps {
  children: ReactNode
  className?: string
  showBottomNav?: boolean
}

export function AppLayout({ children, className, showBottomNav = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className={cn("flex-1 pb-20", className)}>
        {children}
      </main>
      {showBottomNav && <BottomNavigation />}
      <ScrollToTop />
    </div>
  )
}
