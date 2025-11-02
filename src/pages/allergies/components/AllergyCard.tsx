import { ActionCard } from "@/components/ui/molecules/ActionCard";
import { SeverityBadge } from "@/components/ui/atoms/StatusBadge";
import type { Allergy } from "../utils/allergyUtils";

interface AllergyCardProps {
  allergy: Allergy;
  onEdit: (allergy: Allergy) => void;
  onDelete: (id: string) => void;
}

export function AllergyCard({ allergy, onEdit, onDelete }: AllergyCardProps) {
  const isValidSeverity = (severity: string | null): severity is "Légère" | "Modérée" | "Sévère" => {
    return severity === "Légère" || severity === "Modérée" || severity === "Sévère";
  };

  return (
    <ActionCard
      title={allergy.name}
      subtitle={allergy.severity && isValidSeverity(allergy.severity) && (
        <SeverityBadge severity={allergy.severity} />
      )}
      onEdit={() => onEdit(allergy)}
      onDelete={() => onDelete(allergy.id)}
    >
      {allergy.description && (
        <p className="text-sm text-muted-foreground">{allergy.description}</p>
      )}
    </ActionCard>
  );
}
