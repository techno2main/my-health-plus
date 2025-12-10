import { ActionCard } from "@/components/ui/molecules/ActionCard";
import { Badge } from "@/components/ui/badge";
import type { Pathology } from "../utils/pathologyUtils";

interface PathologyCardProps {
  pathology: Pathology;
  onEdit: (pathology: Pathology) => void;
  onDelete: (id: string) => void;
}

export function PathologyCard({ pathology, onEdit, onDelete }: PathologyCardProps) {
  const subtitle = pathology.severity ? (
    <Badge variant="secondary">{pathology.severity}</Badge>
  ) : undefined;

  return (
    <ActionCard
      title={pathology.name}
      subtitle={subtitle}
      onEdit={() => onEdit(pathology)}
      onDelete={() => onDelete(pathology.id)}
    >
      {pathology.description && (
        <p className="text-sm text-muted-foreground">{pathology.description}</p>
      )}
    </ActionCard>
  );
}
