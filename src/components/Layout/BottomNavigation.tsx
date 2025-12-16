import { NavLink, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"
import { useNavigationScroll } from "./hooks/useNavigationScroll"
import { getIconComponent } from "./utils/navigationIcons"

export function BottomNavigation() {
  const location = useLocation()
  const {
    scrollContainerRef,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  } = useNavigationScroll()

  const { data: navItems } = useQuery({
    queryKey: ["navigation-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("navigation_items")
        .select("*")
        .eq("is_active", true)
        .order("position");
      
      if (error) throw error;
      return data;
    },
  });

  if (!navItems || navItems.length === 0) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm pb-safe">
      <div className="flex items-center justify-around h-16 px-1 max-w-4xl mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = getIconComponent(item.icon)
          
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 flex-1 transition-colors select-none",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "scale-110 transition-transform")} />
              <span className="text-xs font-medium whitespace-nowrap">{item.name}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
