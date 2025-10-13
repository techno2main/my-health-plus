import { AppLayout } from "@/components/Layout/AppLayout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Phone, Mail, MapPin, Stethoscope, Building2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

const Pros = () => {
  const navigate = useNavigate();

  // Mock data
  const professionals = [
    {
      id: 1,
      type: "doctor",
      name: "Dr. Martin Dubois",
      specialty: "Médecin généraliste",
      phone: "01 23 45 67 89",
      email: "m.dubois@cabinet.fr",
      address: "12 rue de la Santé, 75014 Paris"
    },
    {
      id: 2,
      type: "specialist",
      name: "Dr. Sophie Laurent",
      specialty: "Endocrinologue",
      phone: "01 98 76 54 32",
      email: "s.laurent@hopital.fr",
      address: "Hôpital Saint-Louis, 75010 Paris"
    },
    {
      id: 3,
      type: "pharmacy",
      name: "Pharmacie du Centre",
      specialty: "Pharmacie",
      phone: "01 45 67 89 12",
      email: "contact@pharmacie-centre.fr",
      address: "5 place de la République, 75011 Paris"
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "doctor":
      case "specialist":
        return <Stethoscope className="h-5 w-5 text-primary" />;
      case "pharmacy":
        return <Building2 className="h-5 w-5 text-primary" />;
      default:
        return <Stethoscope className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <AppLayout>
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Professionnels de santé</h1>
            <p className="text-sm text-muted-foreground">{professionals.length} contact(s)</p>
          </div>
          <Button className="gradient-primary" onClick={() => navigate("/pros/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>

        <div className="space-y-4">
          {professionals.map((pro) => (
            <Card key={pro.id} className="p-4 surface-elevated hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  {getIcon(pro.type)}
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-semibold">{pro.name}</h3>
                    <Badge variant="muted" className="mt-1">{pro.specialty}</Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${pro.phone}`} className="hover:text-primary transition-colors">
                        {pro.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${pro.email}`} className="hover:text-primary transition-colors">
                        {pro.email}
                      </a>
                    </div>
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{pro.address}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Modifier
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Voir les traitements
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}

export default Pros
