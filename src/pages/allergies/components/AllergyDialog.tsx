import { useState, useEffect } from "react";
import { FormDialog } from "@/components/ui/organisms/FormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { searchANSMApi, type ANSMMedication } from "@/services/ansmApiService";
import type { Allergy } from "../utils/allergyUtils";

interface AllergyDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  editingItem: Allergy | null;
  formData: {
    name: string;
    severity?: string | null;
    description: string | null;
  };
  onFormChange: (data: { name: string; severity?: string | null; description: string | null }) => void;
}

export function AllergyDialog({
  open,
  onClose,
  onSubmit,
  editingItem,
  formData,
  onFormChange,
}: AllergyDialogProps) {
  // Normaliser pour Select: null/"" → undefined
  const severityValue = formData.severity || undefined;
  
  // État pour la recherche de médicaments inline
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMode, setSearchMode] = useState<'startsWith' | 'contains'>('contains');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ANSMMedication[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Recherche ANSM avec debounce
  useEffect(() => {
    if (searchTerm.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchANSMApi(searchTerm, searchMode);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error("Erreur recherche ANSM:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchMode]);

  // Synchroniser searchTerm avec formData.name quand on ouvre le dialog
  useEffect(() => {
    if (open && formData.name) {
      setSearchTerm(formData.name);
    }
  }, [open, formData.name]);

  // Reset quand le dialog se ferme
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setSearchResults([]);
      setShowResults(false);
    }
  }, [open]);

  const handleSelectMedication = (med: ANSMMedication) => {
    // Extraire nom commercial
    const commercialName = med.denomination.split(/\s+\d/)[0].trim();
    const isProperName = commercialName === commercialName.toUpperCase() && 
                        commercialName.length <= 15 &&
                        !commercialName.includes('/');
    
    let fullName = isProperName ? commercialName : (med.substanceActive || med.denomination.split(',')[0].trim());
    
    // Ajouter forme et dosage si disponibles
    if (med.formePharmaceutique) {
      fullName += ` (${med.formePharmaceutique})`;
    }
    
    onFormChange({ 
      ...formData, 
      name: fullName,
      description: `Allergie médicamenteuse - ${med.denomination}`
    });
    
    setSearchTerm(fullName); // Mettre à jour le searchTerm aussi
    setShowResults(false);
  };

  const handleNameChange = (value: string) => {
    setSearchTerm(value);
    onFormChange({ ...formData, name: value });
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title={editingItem ? "Modifier une Allergie" : "Ajouter une Allergie"}
      description={editingItem ? "Modifiez les informations de cette allergie" : "Ajoutez une nouvelle allergie à votre profil médical"}
      submitLabel={editingItem ? "Modifier" : "Ajouter"}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="name">Nom de l'allergie *</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={searchMode === 'startsWith' ? 'default' : 'outline'}
                onClick={() => setSearchMode('startsWith')}
                className="h-7 text-xs"
              >
                Commence par
              </Button>
              <Button
                type="button"
                size="sm"
                variant={searchMode === 'contains' ? 'default' : 'outline'}
                onClick={() => setSearchMode('contains')}
                className="h-7 text-xs"
              >
                Contient
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                onFocus={() => formData.name.length >= 3 && setShowResults(true)}
                placeholder="Ex: Doliprane, Arachides, Pollen..."
                className="bg-surface pl-9"
                autoComplete="off"
              />
              {isSearching && (
                <div className="absolute right-3 top-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
          
          {/* Badge de comptage */}
          {showResults && searchResults.length > 0 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{searchResults.length} résultat(s) trouvé(s)</span>
              <Badge variant="secondary" className="text-xs">Base ANSM</Badge>
            </div>
          )}
          
          {/* Résultats de recherche */}
          {showResults && searchResults.length > 0 && (
            <Card className="absolute z-50 mt-1 w-full max-w-md shadow-lg border-2">
              <ScrollArea className="max-h-[350px]">
                <div className="p-2 space-y-1">
                  {searchResults.map((med, index) => (
                    <button
                      key={`${med.codeCIS}-${index}`}
                      type="button"
                      onClick={() => handleSelectMedication(med)}
                      className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors border border-transparent hover:border-primary"
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-sm">
                          {med.denomination.split(',')[0].toUpperCase()}
                        </div>
                        {med.substanceActive && (
                          <div className="text-xs text-muted-foreground">
                            {med.substanceActive}
                          </div>
                        )}
                        <div className="flex gap-2 flex-wrap">
                          {med.formePharmaceutique && (
                            <Badge variant="outline" className="text-xs">
                              {med.formePharmaceutique}
                            </Badge>
                          )}
                          {med.commercialisation && (
                            <Badge variant="secondary" className="text-xs">
                              {med.commercialisation}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          )}
          
          {showResults && searchResults.length === 0 && !isSearching && searchTerm.length >= 3 && (
            <p className="text-xs text-muted-foreground">
              Aucun médicament trouvé. Vous pouvez saisir manuellement.
            </p>
          )}
          
          <p className="text-xs text-muted-foreground">
            Recherchez un médicament (3 caractères min) ou saisissez manuellement
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="severity">Sévérité</Label>
          <Select
            value={severityValue}
            onValueChange={(value) => onFormChange({ ...formData, severity: value })}
          >
            <SelectTrigger id="severity" className="bg-surface">
              <SelectValue placeholder="Sélectionner la sévérité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Légère">Légère</SelectItem>
              <SelectItem value="Modérée">Modérée</SelectItem>
              <SelectItem value="Sévère">Sévère</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => onFormChange({ ...formData, description: e.target.value || null })}
            placeholder="Description de l'allergie..."
            className="bg-surface min-h-[100px]"
          />
        </div>
      </div>
    </FormDialog>
  );
}
