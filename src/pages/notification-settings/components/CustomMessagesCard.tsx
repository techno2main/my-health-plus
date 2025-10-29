import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CustomMessagesCardProps {
  customMessages: {
    medicationReminder: string;
    delayedReminder: string;
    stockAlert: string;
    prescriptionRenewal: string;
    pharmacyVisit: string;
  };
  onUpdate: (messages: any) => void;
}

export function CustomMessagesCard({
  customMessages,
  onUpdate,
}: CustomMessagesCardProps) {
  const [showCustomize, setShowCustomize] = useState(false);
  const [editedMessages, setEditedMessages] = useState(customMessages);
  const cardRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  // Mettre à jour les valeurs éditées quand les props changent
  useEffect(() => {
    setEditedMessages(customMessages);
  }, [customMessages]);

  const handleModify = () => {
    setShowCustomize(true);
    // Réinitialiser les valeurs éditées avec les valeurs actuelles
    setEditedMessages(customMessages);
    
    // Scroll vers les boutons après un court délai pour que le contenu soit rendu
    setTimeout(() => {
      buttonsRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'end' 
      });
    }, 150);
  };

  const handleSave = () => {
    onUpdate(editedMessages);
    setShowCustomize(false);
  };

  const handleCancel = () => {
    setEditedMessages(customMessages);
    setShowCustomize(false);
  };

  return (
    <Card ref={cardRef} className="p-4 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Settings2 className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">Personnaliser</h3>
          <p className="text-sm text-muted-foreground">
            Modifier les textes
          </p>
        </div>
        {!showCustomize && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleModify}
          >
            Modifier
          </Button>
        )}
      </div>

      {showCustomize && (
        <div className="pl-11 space-y-3">
          <div>
            <Label htmlFor="msg-medication" className="text-xs">
              Rappel de prise
            </Label>
            <Input
              id="msg-medication"
              value={editedMessages.medicationReminder}
              onChange={(e) =>
                setEditedMessages({
                  ...editedMessages,
                  medicationReminder: e.target.value,
                })
              }
              placeholder="💊 Rappel de prise"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="msg-delayed" className="text-xs">
              Rappel de prise manquée
            </Label>
            <Input
              id="msg-delayed"
              value={editedMessages.delayedReminder}
              onChange={(e) =>
                setEditedMessages({
                  ...editedMessages,
                  delayedReminder: e.target.value,
                })
              }
              placeholder="⏰ Rappel de prise manquée"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="msg-stock" className="text-xs">
              Alerte de stock
            </Label>
            <Input
              id="msg-stock"
              value={editedMessages.stockAlert}
              onChange={(e) =>
                setEditedMessages({
                  ...editedMessages,
                  stockAlert: e.target.value,
                })
              }
              placeholder="⚠️ Stock faible"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="msg-renewal" className="text-xs">
              Renouvellement d'ordonnance
            </Label>
            <Input
              id="msg-renewal"
              value={editedMessages.prescriptionRenewal}
              onChange={(e) =>
                setEditedMessages({
                  ...editedMessages,
                  prescriptionRenewal: e.target.value,
                })
              }
              placeholder="📅 Renouvellement d'ordonnance"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="msg-pharmacy" className="text-xs">
              Visite pharmacie
            </Label>
            <Input
              id="msg-pharmacy"
              value={editedMessages.pharmacyVisit}
              onChange={(e) =>
                setEditedMessages({
                  ...editedMessages,
                  pharmacyVisit: e.target.value,
                })
              }
              placeholder="💊 Visite pharmacie"
              className="mt-1"
            />
          </div>

          {/* Boutons Enregistrer et Annuler */}
          <div ref={buttonsRef} className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="flex-1"
            >
              Enregistrer
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
