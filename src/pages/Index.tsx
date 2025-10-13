import { AppLayout } from "@/components/Layout/AppLayout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Pill, AlertCircle, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useNavigate } from "react-router-dom"

const Index = () => {
  const navigate = useNavigate();
  const currentDate = format(new Date(), "EEEE d MMMM yyyy", { locale: fr })
  
  // Mock data for demonstration
  const upcomingIntakes = [
    { id: 1, medication: "Metformine 850mg", time: "08:00", status: "pending", treatment: "Diabète Type 2" },
    { id: 2, medication: "Simvastatine 20mg", time: "20:00", status: "pending", treatment: "Cholestérol" },
  ]
  
  const stockAlerts = [
    { id: 1, medication: "Metformine 850mg", remaining: 5, daysLeft: 2 },
  ]

  return (
    <AppLayout>
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
            MyHealthPlus
          </h1>
          <p className="text-sm text-muted-foreground capitalize">{currentDate}</p>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 surface-elevated">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Pill className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">4</p>
                <p className="text-xs text-muted-foreground">Traitements actifs</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 surface-elevated">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">95%</p>
                <p className="text-xs text-muted-foreground">Observance 7j</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Stock Alerts */}
        {stockAlerts.length > 0 && (
          <Card className="p-4 border-warning/20 bg-warning/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-sm">Alertes de stock</h3>
                {stockAlerts.map((alert) => (
                  <div key={alert.id} className="text-sm">
                    <p className="font-medium">{alert.medication}</p>
                    <p className="text-muted-foreground">
                      {alert.remaining} comprimés restants • ~{alert.daysLeft} jours
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Upcoming Intakes */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Prochaines prises</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
              Tout voir
            </Button>
          </div>

          <div className="space-y-3">
            {upcomingIntakes.map((intake) => (
              <Card key={intake.id} className="p-4 surface-elevated hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center min-w-[60px] p-2 rounded-lg bg-primary/10">
                    <Clock className="h-4 w-4 text-primary mb-1" />
                    <span className="text-sm font-semibold text-primary">{intake.time}</span>
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-medium">{intake.medication}</p>
                    <p className="text-sm text-muted-foreground">{intake.treatment}</p>
                  </div>
                  
                  <Button size="sm" className="gradient-primary">
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate("/treatments/new")}>
              <Pill className="h-5 w-5" />
              <span className="text-sm">Ajouter un traitement</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => navigate("/history")}>
              <Clock className="h-5 w-5" />
              <span className="text-sm">Historique</span>
            </Button>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}

export default Index
