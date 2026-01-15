import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { searchANSMApi, getPathologyFromSubstance, type ANSMMedication } from "@/services/ansmApiService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SelectedMedication {
  name: string;
  strength?: string;
  form?: string;
  pathologyId?: string;
  pathologyName?: string;
  description?: string;
  source: 'ansm' | 'manual';
  catalogId?: string; // ID dans medication_catalog si déjà existant
}

interface MedicationSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (medication: SelectedMedication) => void;
  title?: string;
  description?: string;
}

export function MedicationSearchDialog({
  open,
  onOpenChange,
  onSelect,
  title = "Ajouter un médicament",
  description = "Recherchez dans la base officielle ANSM"
}: MedicationSearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [apiResults, setApiResults] = useState<ANSMMedication[]>([]);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualData, setManualData] = useState({ name: "", strength: "", form: "" });

  // Recherche ANSM avec debounce
  useEffect(() => {
    if (searchTerm.length < 3) {
      setApiResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchANSMApi(searchTerm);
        setApiResults(results);
      } catch (error) {
        console.error("Erreur recherche ANSM:", error);
        toast.error("Erreur lors de la recherche");
      } finally {
        setIsSearching(false);
      }
    }, 500); // Debounce 500ms pour éviter violations performance

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setApiResults([]);
      setShowManualForm(false);
      setManualData({ name: "", strength: "", form: "" });
    }
  }, [open]);

  const handleSelectANSM = async (ansmMed: ANSMMedication) => {
    // Extraire nom commercial (ex: QUVIVIQ, XIGDUO) depuis denomination
    const commercialName = ansmMed.denomination.split(/\s+\d/)[0].trim();
    
    // Utiliser nom commercial si c'est un nom propre, sinon substance active
    const isProperName = commercialName === commercialName.toUpperCase() && 
                        commercialName.length <= 15 &&
                        !commercialName.includes('/');
    
    const medicationName = isProperName ? commercialName : (ansmMed.substanceActive || cleanMedicationName(ansmMed.denomination));
    const strength = extractStrength(ansmMed.denomination);
    
    // Détecter la pathologie
    let pathologyId: string | undefined;
    let pathologyName: string | undefined;
    
    if (ansmMed.substanceActive) {
      pathologyName = getPathologyFromSubstance(ansmMed.substanceActive);
      
      if (pathologyName) {
        const { data: pathologyData } = await supabase
          .from("pathologies")
          .select("id, name")
          .eq("name", pathologyName)
          .maybeSingle();
        
        if (pathologyData) {
          pathologyId = pathologyData.id;
        }
      }
    }

    onSelect({
      name: medicationName, // Nom commercial (QUVIVIQ, XIGDUO) ou DCI (SIMVASTATINE)
      strength: strength || undefined,
      form: ansmMed.formePharmaceutique,
      pathologyId,
      pathologyName,
      description: ansmMed.denomination, // Nom commercial complet pour référence
      source: 'ansm',
      catalogId: ansmMed.catalogId, // IMPORTANT : ID du catalog si déjà existant
    });

    onOpenChange(false);
  };

  const handleManualSubmit = () => {
    if (!manualData.name.trim()) {
      toast.error("Le nom du médicament est obligatoire");
      return;
    }

    onSelect({
      name: manualData.name.trim(),
      strength: manualData.strength.trim() || undefined,
      form: manualData.form.trim() || undefined,
      source: 'manual'
    });

    onOpenChange(false);
  };

  const cleanMedicationName = (denomination: string): string => {
    // Extraire uniquement le nom DCI (premier mot avant espace ou virgule)
    // Ex: "ATORVASTATINE ACCORD 10 mg, comprimé" → "ATORVASTATINE"
    const dciMatch = denomination.match(/^([A-ZÀ-ÿ]+(?:[\s-][A-ZÀ-ÿ]+)?)/);
    if (dciMatch) {
      return dciMatch[1].trim();
    }
    
    // Fallback : supprimer dosage, forme, labo
    return denomination
      .replace(/,?\s*\d+(?:[,\.]\d+)?\s*(?:mg|g|ml|µg|UI|%).*$/i, '')
      .replace(/,?\s*(comprimé|gélule|capsule|solution|sirop|poudre).*$/i, '')
      .split(/\s+/)[0] // Prendre le premier mot
      .trim();
  };

  const extractStrength = (denomination: string): string | null => {
    const strengthMatch = denomination.match(/(\d+(?:[,\.]\d+)?\s*(?:mg|g|ml|µg|UI|%))/i);
    return strengthMatch ? strengthMatch[1].replace(',', '.') : null;
  };

  if (showManualForm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowManualForm(false)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <DialogTitle>Créer un médicament manuellement</DialogTitle>
            </div>
            <DialogDescription>
              Pour les médicaments non répertoriés dans la base ANSM
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="manual-name">Nom du médicament *</Label>
              <Input
                id="manual-name"
                value={manualData.name}
                onChange={(e) => setManualData({ ...manualData, name: e.target.value })}
                placeholder="Ex: Préparation magistrale X"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manual-strength">Force / Dosage</Label>
              <Input
                id="manual-strength"
                value={manualData.strength}
                onChange={(e) => setManualData({ ...manualData, strength: e.target.value })}
                placeholder="Ex: 500mg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manual-form">Forme pharmaceutique</Label>
              <Input
                id="manual-form"
                value={manualData.form}
                onChange={(e) => setManualData({ ...manualData, form: e.target.value })}
                placeholder="Ex: gélule, comprimé..."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowManualForm(false)} className="flex-1">
                Annuler
              </Button>
              <Button onClick={handleManualSubmit} className="flex-1 gradient-primary">
                Ajouter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Barre de recherche */}
        <div className="px-6 py-4 border-b bg-muted/20 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un médicament dans la base ANSM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
          {searchTerm.length > 0 && searchTerm.length < 3 && (
            <p className="text-xs text-muted-foreground mt-2">Saisissez au moins 3 caractères</p>
          )}
        </div>

        {/* Résultats */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-3">
            {isSearching ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Recherche en cours...</span>
              </div>
            ) : apiResults.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">{apiResults.length} résultat(s) trouvé(s)</p>
                  <Badge variant="secondary" className="text-xs">Base ANSM</Badge>
                </div>
                {apiResults.map((med) => {
                  const strength = extractStrength(med.denomination);
                  
                  // Extraire nom commercial (ex: QUVIVIQ, XIGDUO) depuis denomination
                  const commercialName = med.denomination.split(/\s+\d/)[0].trim(); // Premier mot avant dosage
                  
                  // Utiliser nom commercial si c'est un nom propre (majuscules), sinon substance active
                  const isProperName = commercialName === commercialName.toUpperCase() && 
                                      commercialName.length <= 15 &&
                                      !commercialName.includes('/');
                  
                  const displayBaseName = isProperName ? commercialName : (med.substanceActive || cleanMedicationName(med.denomination));
                  const displayName = strength ? `${displayBaseName} ${strength}` : displayBaseName;
                  
                  return (
                    <Card
                      key={med.codeCIS}
                      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleSelectANSM(med)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-base">{displayName}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {med.denomination}
                            </p>
                          </div>
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {med.formePharmaceutique && (
                            <Badge variant="outline" className="text-xs">{med.formePharmaceutique}</Badge>
                          )}
                          {med.statutAMM === 'Déjà utilisé' ? (
                            <Badge className="text-xs bg-green-600 hover:bg-green-700">✓ En catalogue</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">{med.commercialisation}</Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </>
            ) : searchTerm.length >= 3 ? (
              <div className="text-center py-12 space-y-4">
                <p className="text-muted-foreground">Aucun résultat trouvé dans la base ANSM</p>
                <Button variant="outline" onClick={() => setShowManualForm(true)}>
                  Créer manuellement
                </Button>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">
                  Commencez à saisir le nom d'un médicament
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer avec option création manuelle */}
        {!isSearching && apiResults.length > 0 && (
          <div className="px-6 py-4 border-t bg-muted/20 flex-shrink-0">
            <Button variant="ghost" onClick={() => setShowManualForm(true)} className="w-full text-xs">
              Médicament introuvable ? Créer manuellement
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
