import { Pill, CheckCircle2, XCircle, Clock, ClockAlert, SkipForward } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface IntakeHistoryCardProps {
  intake: {
    id: string
    medication: string
    dosage: string
    time: string
    status: string
    takenAt?: string
    scheduledTimestamp?: string
    takenAtTimestamp?: string
  }
}

const getStatusIcon = () => {
  return <Pill className="h-5 w-5 text-white" />
}

const getStatusInfo = (status: string, scheduledTimestamp?: string, takenAtTimestamp?: string): { icon: JSX.Element; label: string } => {
  if (status === "taken" && scheduledTimestamp && takenAtTimestamp) {
    const scheduled = new Date(scheduledTimestamp)
    const taken = new Date(takenAtTimestamp)
    const differenceMinutes = (taken.getTime() - scheduled.getTime()) / (1000 * 60)
    
    if (differenceMinutes <= 30) {
      return { icon: <CheckCircle2 className="h-6 w-6 text-success" />, label: "À l'heure" }
    } else {
      return { icon: <ClockAlert className="h-6 w-6 text-success" />, label: "En retard" }
    }
  }
  
  switch (status) {
    case "taken":
      return { icon: <CheckCircle2 className="h-6 w-6 text-success" />, label: "À l'heure" }
    case "skipped":
      return { icon: <SkipForward className="h-6 w-6 text-warning flex-shrink-0" />, label: "Sautée" }
    case "missed":
      return { icon: <XCircle className="h-6 w-6 text-danger" />, label: "Manquée" }
    case "pending":
      return { icon: <Clock className="h-6 w-6 text-muted-foreground" />, label: "En attente" }
    default:
      return { icon: <></>, label: "" }
  }
}

export const IntakeHistoryCard = ({ intake }: IntakeHistoryCardProps) => {
  const statusInfo = getStatusInfo(intake.status, intake.scheduledTimestamp, intake.takenAtTimestamp)
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-surface">
      <div className="flex items-center gap-3 flex-1">
        {getStatusIcon()}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium">{intake.medication}</p>
            {intake.dosage && <span className="text-xs text-muted-foreground">{intake.dosage}</span>}
          </div>
          <p className="text-xs text-muted-foreground">
            Prévu à {intake.time}
            {intake.takenAt && ` • Pris à ${intake.takenAt}`}
          </p>
        </div>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>{statusInfo.icon}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{statusInfo.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
