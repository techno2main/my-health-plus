import { AppLayout } from "@/components/Layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function ProForm() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Nouveau professionnel</h1>
            <p className="text-sm text-muted-foreground">Ajoutez un contact médical</p>
          </div>
        </div>

        <form className="space-y-6">
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select>
                <SelectTrigger className="bg-surface">
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor">Médecin</SelectItem>
                  <SelectItem value="specialist">Spécialiste</SelectItem>
                  <SelectItem value="pharmacy">Pharmacie</SelectItem>
                  <SelectItem value="lab">Laboratoire</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input 
                id="name" 
                placeholder="Dr. Nom Prénom ou Nom de l'établissement"
                className="bg-surface"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Spécialité</Label>
              <Input 
                id="specialty" 
                placeholder="Ex: Médecin généraliste, Cardiologue..."
                className="bg-surface"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input 
                id="phone" 
                type="tel"
                placeholder="06 12 34 56 78"
                className="bg-surface"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="contact@exemple.fr"
                className="bg-surface"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Textarea 
                id="address" 
                placeholder="Adresse complète"
                className="bg-surface"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Informations complémentaires"
                className="bg-surface"
              />
            </div>
          </Card>

          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              className="flex-1 gradient-primary"
            >
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
