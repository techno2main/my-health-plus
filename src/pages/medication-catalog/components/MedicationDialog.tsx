import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimePickerInput } from "@/components/ui/time-picker-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Pill, Search } from "lucide-react";
import { detectTakesFromDosage, getDefaultTimes, generateDosageFromTimes } from "../utils/medicationUtils";
import { useState, useEffect } from "react";
import { AdminSearchDialog } from "./AdminSearchDialog";
import { getPathologyFromSubstance } from "@/services/ansmApiService";
import { supabase } from "@/integrations/supabase/client";

interface MedicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingMed: any | null;
  formData: {
    name: string;
    pathology_id: string;
    form: string;
    default_posology: string;
    strength: string;
    description: string;
    initial_stock: string;
    min_threshold: string;
    default_times: string[];
  };
  setFormData: (data: any) => void;
  pathologies: { id: string; name: string }[];
  onSubmit: () => void;
  onStockClick: (id: string) => void;
}

export function MedicationDialog({
  open,
  onOpenChange,
  editingMed,
  formData,
  setFormData,
  pathologies,
  onSubmit,
  onStockClick,
}: MedicationDialogProps) {
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  
  // Normaliser pour Select: null/undefined → "" (évite warning controlled/uncontrolled)
  const pathologyValue = formData.pathology_id || "";

  const handleMedicationSelect = async (medication: any) => {
    // Pré-remplir le formulaire avec les données ANSM
    const cleanName = cleanMedicationName(medication.denomination);
    const strength = extractStrength(medication.denomination);
    const form = medication.formePharmaceutique || "";
    
    // Tenter de trouver la pathologie associée
    let pathologyId = "";
    
    if (medication.substanceActive) {
      const pathologyName = getPathologyFromSubstance(medication.substanceActive);
      console.log('[ANSM] Substance:', medication.substanceActive, '-> Pathologie:', pathologyName);
      
      if (pathologyName) {
        // Rechercher l'ID de la pathologie dans Supabase avec recherche exacte
        const { data: pathologyData, error } = await supabase
          .from("pathologies")
          .select("id, name")
          .eq("name", pathologyName)
          .maybeSingle();
        
        console.log('[ANSM] Recherche Supabase pour:', pathologyName, '-> Résultat:', pathologyData, 'Erreur:', error);
        
        if (pathologyData) {
          pathologyId = pathologyData.id;
          console.log('[ANSM] ✅ Pathologie trouvée:', pathologyData.name, 'ID:', pathologyId);
        } else {
          console.warn('[ANSM] ❌ Pathologie non trouvée en base:', pathologyName);
        }
      }
    }
    
    console.log('[ANSM] FormData pathology_id final:', pathologyId);
    
    setFormData({
      ...formData,
      name: cleanName,
      strength: strength || "",
      form: form,
      description: `${medication.formePharmaceutique || ""} - ${medication.commercialisation || ""}`.trim(),
      pathology_id: pathologyId,
    });
    setShowSearchDialog(false);
  };

  // Fonctions utilitaires pour parser les données ANSM
  const cleanMedicationName = (denomination: string): string => {
    return denomination
      .replace(/,?\s*\d+(?:[,\.]\d+)?\s*(?:mg|g|ml|µg|UI|%).*$/i, '')
      .replace(/,?\s*(comprimé|gélule|capsule|solution|sirop|poudre).*$/i, '')
      .trim();
  };

  const extractStrength = (denomination: string): string | null => {
    const strengthMatch = denomination.match(/(\d+(?:[,\.]\d+)?\s*(?:mg|g|ml|µg|UI|%)(?:\s*\/\s*\d+(?:[,\.]\d+)?\s*(?:mg|g|ml|µg|UI|%))*)/i);
    return strengthMatch ? strengthMatch[1].replace(',', '.') : null;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[85vh] max-h-[85vh] flex flex-col p-0 gap-0 top-[45%]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle>
              {editingMed ? "Modifier un Médicament" : "Ajouter un Médicament"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            {editingMed ? "Modifiez les informations de ce médicament dans le catalogue" : "Ajoutez un nouveau médicament au catalogue"}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-4 pb-8">
            {/* Bouton de recherche ANSM */}
            {!editingMed && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSearchDialog(true)}
                  className="gap-2"
                >
                  <Search className="h-4 w-4" />
                  Rechercher dans la base ANSM
                </Button>
              </div>
            )}

            {/* Première ligne : Nom + Dosage */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du médicament *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Xigduo"
                  className="bg-surface"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="strength">Force</Label>
                <Input
                  id="strength"
                  value={formData.strength}
                  onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                  placeholder="Ex: 5mg/1000mg"
                  className="bg-surface"
                />
              </div>
            </div>

            {/* Forme pharmaceutique */}
            <div className="space-y-2">
              <Label htmlFor="form">Forme pharmaceutique</Label>
              <Input
                id="form"
                value={formData.form}
                onChange={(e) => setFormData({ ...formData, form: e.target.value })}
                placeholder="Ex: comprimé, gélule, solution"
                className="bg-surface"
              />
            </div>

            {/* Deuxième ligne : Pathologie seule */}
            <div className="space-y-2">
              <Label htmlFor="pathology">Pathologie</Label>
              <Select 
                value={pathologyValue} 
                onValueChange={(value) => setFormData({ ...formData, pathology_id: value || "" })}
              >
                <SelectTrigger className="bg-surface">
                  <SelectValue placeholder="Sélectionner une pathologie" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {pathologies.map((pathology) => (
                    <SelectItem key={pathology.id} value={pathology.id}>
                      {pathology.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Metformine"
                className="bg-surface"
              />
            </div>

            {editingMed && editingMed.total_stock !== undefined && (
              <div className={`p-3 rounded-lg border ${
                editingMed.total_stock === 0 
                  ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800/30'
                  : editingMed.total_stock <= (editingMed.min_threshold || 10)
                  ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800/30'
                  : 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800/30'
              }`}>
                <p className="text-sm text-muted-foreground mb-1">Stock actuel total</p>
                <button 
                  onClick={() => onStockClick(editingMed.id)}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <Pill className={`h-4 w-4 ${
                    editingMed.total_stock === 0 
                      ? 'text-red-600 dark:text-red-400'
                      : editingMed.total_stock <= (editingMed.min_threshold || 10)
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-green-600 dark:text-green-400'
                  }`} />
                  <span className={`text-base font-semibold ${
                    editingMed.total_stock === 0 
                      ? 'text-red-600 dark:text-red-400'
                      : editingMed.total_stock <= (editingMed.min_threshold || 10)
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}>{editingMed.total_stock} unités</span>
                </button>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t flex-shrink-0 bg-background">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 h-9">
              Annuler
            </Button>
            <Button onClick={onSubmit} className="flex-1 gradient-primary h-9">
              {editingMed ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Dialog de recherche ANSM pour admin */}
    <AdminSearchDialog
      open={showSearchDialog}
      onOpenChange={setShowSearchDialog}
      onSelect={handleMedicationSelect}
    />
    </>
  );
}
