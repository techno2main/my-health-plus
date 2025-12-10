import { FormDialog } from "@/components/ui/organisms/FormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Pathology } from "../utils/pathologyUtils";

interface PathologyDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  editingItem: Pathology | null;
  formData: {
    name: string;
    description: string | null;
    severity?: string | null;
  };
  onFormChange: (data: { name: string; description: string | null; severity?: string | null }) => void;
}

export function PathologyDialog({
  open,
  onClose,
  onSubmit,
  editingItem,
  formData,
  onFormChange,
}: PathologyDialogProps) {
  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title={editingItem ? "Modifier une Pathologie" : "Ajouter une Pathologie"}
      description={editingItem ? "Modifiez les informations de cette pathologie" : "Ajoutez une nouvelle pathologie à votre historique médical"}
      submitLabel={editingItem ? "Modifier" : "Ajouter"}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom de la pathologie *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
            placeholder="Ex: Diabète Type 2"
            className="bg-surface"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="severity">Type de pathologie</Label>
          <Select
            value={formData.severity || ""}
            onValueChange={(value) => onFormChange({ ...formData, severity: value })}
          >
            <SelectTrigger id="severity" className="bg-surface">
              <SelectValue placeholder="Sélectionner le type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Récurrente">Récurrente</SelectItem>
              <SelectItem value="Temporaire">Temporaire</SelectItem>
              <SelectItem value="Ponctuelle">Ponctuelle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description || ""}
            onChange={(e) => onFormChange({ ...formData, description: e.target.value || null })}
            placeholder="Description de la pathologie..."
            className="bg-surface"
          />
        </div>
      </div>
    </FormDialog>
  );
}
