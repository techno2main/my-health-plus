import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Search, Loader2, Database, Globe } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { CatalogMedication } from "../types"
import { searchANSMApi, type ANSMMedication } from "@/services/ansmApiService"

interface CatalogDialogEnhancedProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  catalog: CatalogMedication[]
  onSelect: (medication: CatalogMedication) => void
  onCreateCustom: () => void
}

export const CatalogDialogEnhanced = ({
  open,
  onOpenChange,
  catalog,
  onSelect,
  onCreateCustom
}: CatalogDialogEnhancedProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearchingAPI, setIsSearchingAPI] = useState(false)
  const [apiResults, setApiResults] = useState<ANSMMedication[]>([])
  const [hasSearchedAPI, setHasSearchedAPI] = useState(false)

  // Recherche locale dans le catalogue
  const localResults = useMemo(() => {
    if (!searchTerm) return catalog

    const term = searchTerm.toLowerCase()
    return catalog.filter(med =>
      med.name.toLowerCase().includes(term) ||
      med.pathology?.toLowerCase().includes(term) ||
      med.description?.toLowerCase().includes(term)
    )
  }, [catalog, searchTerm])

  // Recherche API ANSM si pas de résultats locaux
  const handleSearch = async (value: string) => {
    setSearchTerm(value)
    setHasSearchedAPI(false)
    setApiResults([])

    // Si la recherche locale donne des résultats, pas besoin d'API
    if (value.length < 3) return

    const term = value.toLowerCase()
    const localMatches = catalog.filter(med =>
      med.name.toLowerCase().includes(term)
    )

    // Seulement si aucun résultat local
    if (localMatches.length === 0 && value.length >= 3) {
      setIsSearchingAPI(true)
      try {
        const results = await searchANSMApi(value)
        setApiResults(results)
        setHasSearchedAPI(true)
      } catch (error) {
        console.error("Erreur recherche API:", error)
      } finally {
        setIsSearchingAPI(false)
      }
    }
  }

  const showNoResults = searchTerm.length >= 3 && localResults.length === 0 && !isSearchingAPI && hasSearchedAPI && apiResults.length === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Rechercher un médicament</DialogTitle>
          <DialogDescription>
            Recherche dans le catalogue local puis dans la base officielle ANSM
          </DialogDescription>
        </DialogHeader>

        {/* Barre de recherche */}
        <div className="px-6 py-3 border-b bg-muted/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nom du médicament..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>

        <ScrollArea className="h-[calc(85vh-180px)]">
          <div className="px-6 py-4 space-y-3">
            {/* Résultats locaux */}
            {localResults.length > 0 && (
              <>
                {searchTerm && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Database className="h-3 w-3" />
                    <span>{localResults.length} résultat(s) dans le catalogue local</span>
                  </div>
                )}
                {localResults.map((med) => (
                  <Card
                    key={med.id}
                    className="p-4 cursor-pointer hover:bg-accent/50 transition-colors active:scale-[0.98]"
                    onClick={() => onSelect(med)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{med.name}</h4>
                          {med.strength && (
                            <span className="text-sm text-muted-foreground">{med.strength}</span>
                          )}
                        </div>
                        {med.pathology && (
                          <Badge variant="secondary" className="mb-2">
                            {med.pathology}
                          </Badge>
                        )}
                        {med.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {med.description}
                          </p>
                        )}
                      </div>
                      <Plus className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    </div>
                  </Card>
                ))}
              </>
            )}

            {/* Indicateur recherche API */}
            {isSearchingAPI && (
              <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <div className="text-center">
                  <p className="text-sm font-medium">Recherche dans la base officielle...</p>
                  <p className="text-xs">ANSM - Base de Données Publique des Médicaments</p>
                </div>
              </div>
            )}

            {/* Résultats API ANSM */}
            {apiResults.length > 0 && (
              <>
                <div className="flex items-center gap-2 text-xs text-muted-foreground my-4">
                  <Globe className="h-3 w-3" />
                  <span>{apiResults.length} résultat(s) dans la base officielle ANSM</span>
                </div>
                {apiResults.map((med, index) => (
                  <Card
                    key={`ansm-${index}`}
                    className="p-4 cursor-pointer hover:bg-accent/50 transition-colors border-primary/30"
                    onClick={() => {
                      // TODO: Convertir et ajouter au catalog
                      console.log("Médicament ANSM sélectionné:", med)
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{med.denomination}</h4>
                          <Badge variant="outline" className="text-xs">Officiel</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{med.formePharmaceutique}</p>
                      </div>
                      <Plus className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    </div>
                  </Card>
                ))}
              </>
            )}

            {/* Aucun résultat */}
            {showNoResults && (
              <div className="text-center py-8 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Aucun médicament trouvé pour "{searchTerm}"
                </p>
                <Button
                  onClick={() => {
                    onOpenChange(false)
                    onCreateCustom()
                  }}
                  variant="outline"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Créer un médicament personnalisé
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-3 border-t bg-muted/20 flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            {catalog.length} médicaments au catalogue
          </p>
          <Button
            onClick={() => {
              onOpenChange(false)
              onCreateCustom()
            }}
            variant="ghost"
            size="sm"
            className="gap-1"
          >
            <Plus className="h-3 w-3" />
            <span className="text-xs">Créer un médicament</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
