import { AppLayout } from "@/components/Layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function StockForm() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Ajuster le stock</h1>
            <p className="text-sm text-muted-foreground">Modifiez la quantité en stock</p>
          </div>
        </div>

        <form className="space-y-6">
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="medication">Médicament</Label>
              <Input 
                id="medication" 
                placeholder="Nom du médicament"
                className="bg-surface"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current-stock">Stock actuel</Label>
              <Input 
                id="current-stock" 
                type="number"
                placeholder="0"
                className="bg-surface"
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adjustment">Ajustement</Label>
              <Input 
                id="adjustment" 
                type="number"
                placeholder="+/- quantité"
                className="bg-surface"
              />
              <p className="text-xs text-muted-foreground">
                Utilisez + pour ajouter, - pour retirer
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-stock">Nouveau stock</Label>
              <Input 
                id="new-stock" 
                type="number"
                placeholder="0"
                className="bg-surface"
                disabled
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

            <div className="space-y-2">
              <Label htmlFor="min-threshold">Seuil d'alerte minimum</Label>
              <Input 
                id="min-threshold" 
                type="number"
                placeholder="10"
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
