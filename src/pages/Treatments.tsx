import { AppLayout } from "@/components/Layout/AppLayout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pill, Plus, Clock, Calendar } from "lucide-react"

const Treatments = () => {
  // Mock data
  const treatments = [
    {
      id: 1,
      name: "Diabète Type 2",
      medications: [
        { name: "Metformine 850mg", dosage: "2x/jour", times: ["08:00", "20:00"] }
      ],
      status: "active",
      startDate: "2024-01-15"
    },
    {
      id: 2,
      name: "Cholestérol",
      medications: [
        { name: "Simvastatine 20mg", dosage: "1x/jour", times: ["20:00"] }
      ],
      status: "active",
      startDate: "2024-02-01"
    },
    {
      id: 3,
      name: "Troubles du sommeil",
      medications: [
        { name: "Mélatonine 2mg", dosage: "1x/jour", times: ["21:30"] }
      ],
      status: "active",
      startDate: "2024-03-10"
    },
  ]

  return (
    <AppLayout>
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mes traitements</h1>
            <p className="text-sm text-muted-foreground">{treatments.length} traitement(s) actif(s)</p>
          </div>
          <Button className="gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </header>

        {/* Treatments List */}
        <div className="space-y-4">
          {treatments.map((treatment) => (
            <Card key={treatment.id} className="p-4 surface-elevated hover:shadow-md transition-shadow">
              <div className="space-y-3">
                {/* Treatment Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{treatment.name}</h3>
                    <Badge variant="success" className="mt-1">
                      {treatment.status === "active" ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    Modifier
                  </Button>
                </div>

                {/* Medications */}
                <div className="space-y-2">
                  {treatment.medications.map((med, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <Pill className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{med.name}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{med.times.join(", ")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                  <Calendar className="h-3 w-3" />
                  <span>Depuis le {new Date(treatment.startDate).toLocaleDateString("fr-FR")}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}

export default Treatments
