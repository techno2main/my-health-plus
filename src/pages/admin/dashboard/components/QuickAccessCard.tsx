import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronRight, HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { AdminRoute } from "../types";

interface QuickAccessCardProps {
  route: AdminRoute;
  onClick: () => void;
}

export const QuickAccessCard = ({ route, onClick }: QuickAccessCardProps) => {
  const Icon = route.icon;
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <Card 
        className={`p-4 ${route.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md transition-shadow'}`}
        onClick={route.disabled ? undefined : onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-3 rounded-full bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{route.title}</h3>
                {route.helpText && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowHelp(true);
                    }}
                    className="touch-manipulation"
                  >
                    <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                  </button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{route.description}</p>
            </div>
          </div>
          {!route.disabled && (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        {route.badge && (
          <div className="mt-2">
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
              {route.badge}
            </span>
          </div>
        )}
      </Card>

      {route.helpText && (
        <Dialog open={showHelp} onOpenChange={setShowHelp}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aide : {route.title}</DialogTitle>
              <DialogDescription className="text-base pt-2">
                {route.helpText}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
