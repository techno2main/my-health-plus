import { useState, ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderWithHelpProps {
  title: string;
  subtitle?: string;
  helpText: string;
  className?: string;
  leftButton?: ReactNode;
  rightButton?: ReactNode;
}

export function PageHeaderWithHelp({ 
  title, 
  subtitle, 
  helpText,
  className,
  leftButton,
  rightButton
}: PageHeaderWithHelpProps) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {leftButton}
        <div className="flex-1">
          <div className={cn("", className)}>
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold">{title}</h2>
              <button
                onClick={() => setShowHelp(!showHelp)}
                className={`w-5 h-5 flex items-center justify-center rounded-full transition-colors shrink-0 ${
                  showHelp 
                    ? 'bg-primary/20 hover:bg-primary/30' 
                    : 'bg-green-500/20 hover:bg-green-500/30'
                }`}
                title="Aide"
              >
                <span className={`text-base font-bold ${
                  showHelp ? 'text-primary' : 'text-green-600'
                }`}>{showHelp ? 'i' : '?'}</span>
              </button>
            </div>
            {subtitle && (
              <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {rightButton}
      </div>

      {/* Description collapsible - EN DEHORS du flex */}
      {showHelp && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>{helpText}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
