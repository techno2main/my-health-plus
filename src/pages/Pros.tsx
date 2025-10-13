import { AppLayout } from "@/components/Layout/AppLayout"
import { Card } from "@/components/ui/card"
import { Users } from "lucide-react"

const Pros = () => {
  return (
    <AppLayout>
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Professionnels de santé</h1>
          <p className="text-sm text-muted-foreground">Médecins et pharmacies</p>
        </header>

        <Card className="p-12 text-center surface-elevated">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Contacts médicaux à venir</p>
        </Card>
      </div>
    </AppLayout>
  )
}

export default Pros
