import { useState, useEffect } from "react";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MedicationEditDialog } from "@/components/TreatmentEdit/MedicationEditDialog";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  catalog_id?: string;
}

interface Treatment {
  id: string;
  name: string;
  pathology: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  notes: string | null;
  description: string | null;
}

export default function TreatmentEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [treatment, setTreatment] = useState<Treatment | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    pathology: "",
    startDate: "",
    endDate: "",
    isActive: true,
    notes: ""
  });

  useEffect(() => {
    if (id) {
      loadTreatmentData();
    }
  }, [id]);

  const loadTreatmentData = async () => {
    try {
      // Load treatment
      const { data: treatmentData, error: treatmentError } = await supabase
        .from("treatments")
        .select("*")
        .eq("id", id)
        .single();

      if (treatmentError) throw treatmentError;
      setTreatment(treatmentData);
      
      // Set form data
      setFormData({
        name: treatmentData.name,
        pathology: treatmentData.pathology || "",
        startDate: treatmentData.start_date,
        endDate: treatmentData.end_date || "",
        isActive: treatmentData.is_active,
        notes: treatmentData.notes || treatmentData.description || ""
      });

      // Load medications for this treatment
      const { data: medsData, error: medsError } = await supabase
        .from("medications")
        .select("id, name, dosage, times, catalog_id")
        .eq("treatment_id", id);

      if (medsError) throw medsError;
      setMedications(medsData || []);

    } catch (error) {
      console.error("Error loading treatment:", error);
      toast.error("Erreur lors du chargement du traitement");
    } finally {
      setLoading(false);
    }
  };

  const handleEditMedication = (med: Medication) => {
    setEditingMedication(med);
    setDialogOpen(true);
  };

  const handleAddMedication = () => {
    setEditingMedication(null);
    setDialogOpen(true);
  };

  const handleMedicationSaved = () => {
    loadTreatmentData();
  };

  const handleSave = async () => {
    if (!treatment) return;

    try {
      const { error } = await supabase
        .from("treatments")
        .update({
          name: formData.name,
          pathology: formData.pathology || null,
          start_date: formData.startDate,
          end_date: formData.endDate || null,
          is_active: formData.isActive,
          notes: formData.notes || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", treatment.id);

      if (error) throw error;

      toast.success("Traitement mis à jour avec succès");
      navigate("/treatments");
    } catch (error) {
      console.error("Error updating treatment:", error);
      toast.error("Erreur lors de la mise à jour du traitement");
    }
  };

  const handleDelete = async () => {
    if (!treatment || !confirm("Êtes-vous sûr de vouloir supprimer ce traitement ?")) return;

    try {
      const { error } = await supabase
        .from("treatments")
        .delete()
        .eq("id", treatment.id);

      if (error) throw error;

      toast.success("Traitement supprimé");
      navigate("/treatments");
    } catch (error) {
      console.error("Error deleting treatment:", error);
      toast.error("Erreur lors de la suppression du traitement");
    }
  };

  if (loading) {
    return (
      <AppLayout showBottomNav={false}>
        <div className="container max-w-2xl mx-auto px-4 py-6">
          <p className="text-center text-muted-foreground">Chargement...</p>
        </div>
      </AppLayout>
    );
  }

  if (!treatment) {
    return (
      <AppLayout showBottomNav={false}>
        <div className="container max-w-2xl mx-auto px-4 py-6">
          <p className="text-center text-muted-foreground">Traitement non trouvé</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showBottomNav={false}>
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/treatments")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Modifier le traitement</h1>
            <p className="text-muted-foreground">{treatment.name}</p>
          </div>
        </div>

        {/* Informations générales */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Informations générales</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du traitement</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Traitement Diabète"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pathology">Pathologie</Label>
              <Input 
                id="pathology" 
                value={formData.pathology}
                onChange={(e) => setFormData({...formData, pathology: e.target.value})}
                placeholder="Ex: Diabète Type 2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début</Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin</Label>
                <Input 
                  id="endDate" 
                  type="date" 
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive" className="flex-1">
                <p className="font-medium">Traitement actif</p>
                <p className="text-sm text-muted-foreground">Afficher dans les traitements en cours</p>
              </Label>
              <Switch 
                id="isActive" 
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Ajoutez des notes sur ce traitement..."
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* Médicaments */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Médicaments</h3>
            <Button size="sm" onClick={handleAddMedication}>
              Ajouter un médicament
            </Button>
          </div>

          <div className="space-y-3">
            {medications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucun médicament</p>
            ) : (
              medications.map((med) => (
                <Card key={med.id} className="p-4 bg-surface">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">{med.name}</p>
                      <p className="text-sm text-muted-foreground">{med.dosage}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleEditMedication(med)}>
                      Modifier
                    </Button>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Horaires de prise</p>
                    <div className="flex flex-wrap gap-2">
                      {med.times.map((time, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-primary/10 text-sm font-medium">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button className="w-full" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Enregistrer les modifications
          </Button>
          <Button 
            variant="outline" 
            className="w-full border-danger text-danger hover:bg-danger hover:text-white"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer le traitement
          </Button>
        </div>

        <MedicationEditDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          medication={editingMedication}
          treatmentId={id!}
          onSave={handleMedicationSaved}
        />
      </div>
    </AppLayout>
  );
}
