import { AppLayout } from "@/components/Layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";

export default function PrescriptionForm() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Nouvelle ordonnance</h1>
            <p className="text-sm text-muted-foreground">Ajoutez une prescription médicale</p>
          </div>
        </div>

        <form className="space-y-6">
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre de l'ordonnance</Label>
              <Input 
                id="title" 
                placeholder="Ex: Ordonnance Diabète"
                className="bg-surface"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctor">Médecin prescripteur</Label>
              <Input 
                id="doctor" 
                placeholder="Dr. Nom Prénom"
                className="bg-surface"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prescription-date">Date de prescription</Label>
                <Input 
                  id="prescription-date" 
                  type="date"
                  className="bg-surface"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry-date">Date d'expiration</Label>
                <Input 
                  id="expiry-date" 
                  type="date"
                  className="bg-surface"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medications">Médicaments prescrits</Label>
              <Textarea 
                id="medications" 
                placeholder="Liste des médicaments (un par ligne)"
                className="bg-surface min-h-[100px]"
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

            <div className="space-y-2">
              <Label>Document (PDF, image)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-1">
                  Cliquez pour télécharger ou glissez-déposez
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, JPG, PNG jusqu'à 10MB
                </p>
              </div>
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
