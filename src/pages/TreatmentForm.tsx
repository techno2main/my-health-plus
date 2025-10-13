import { AppLayout } from "@/components/Layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export default function TreatmentForm() {
  const navigate = useNavigate();
  const [medications, setMedications] = useState([
    { name: "", dosage: "", times: [""] }
  ]);

  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "", times: [""] }]);
  };

  const addTime = (medIndex: number) => {
    const newMeds = [...medications];
    newMeds[medIndex].times.push("");
    setMedications(newMeds);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  return (
    <AppLayout>
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Nouveau traitement</h1>
            <p className="text-sm text-muted-foreground">Ajoutez un traitement médical</p>
          </div>
        </div>

        <form className="space-y-6">
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="treatment-name">Nom du traitement</Label>
              <Input 
                id="treatment-name" 
                placeholder="Ex: Diabète Type 2"
                className="bg-surface"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pathology">Pathologie</Label>
              <Input 
                id="pathology" 
                placeholder="Ex: Diabète, Cholestérol..."
                className="bg-surface"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Date de début</Label>
              <Input 
                id="start-date" 
                type="date"
                className="bg-surface"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Informations complémentaires..."
                className="bg-surface min-h-[100px]"
              />
            </div>
          </Card>

          {/* Medications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Médicaments</h3>
              <Button type="button" variant="outline" size="sm" onClick={addMedication}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>

            {medications.map((med, medIndex) => (
              <Card key={medIndex} className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-sm">Médicament {medIndex + 1}</h4>
                  {medications.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeMedication(medIndex)}
                    >
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`med-name-${medIndex}`}>Nom du médicament</Label>
                  <Input 
                    id={`med-name-${medIndex}`}
                    placeholder="Ex: Metformine 850mg"
                    className="bg-surface"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`dosage-${medIndex}`}>Dosage</Label>
                  <Input 
                    id={`dosage-${medIndex}`}
                    placeholder="Ex: 1 comprimé"
                    className="bg-surface"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Horaires de prise</Label>
                  {med.times.map((_, timeIndex) => (
                    <Input 
                      key={timeIndex}
                      type="time"
                      className="bg-surface"
                    />
                  ))}
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => addTime(medIndex)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un horaire
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`stock-${medIndex}`}>Stock initial</Label>
                  <Input 
                    id={`stock-${medIndex}`}
                    type="number"
                    placeholder="Nombre de comprimés"
                    className="bg-surface"
                  />
                </div>
              </Card>
            ))}
          </div>

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
