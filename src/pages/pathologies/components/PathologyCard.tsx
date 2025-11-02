import { ActionCard } from "@/components/ui/molecules/ActionCard";
import type { Pathology } from "../utils/pathologyUtils";

interface PathologyCardProps {
  pathology: Pathology;
  onEdit: (pathology: Pathology) => void;
  onDelete: (id: string) => void;
}

export function PathologyCard({ pathology, onEdit, onDelete }: PathologyCardProps) {
  return (
    <ActionCard
      title={pathology.name}
      onEdit={() => onEdit(pathology)}
      onDelete={() => onDelete(pathology.id)}
    >
      {pathology.description && (
        <p className="text-sm text-muted-foreground">{pathology.description}</p>
      )}
    </ActionCard>
  );
}
