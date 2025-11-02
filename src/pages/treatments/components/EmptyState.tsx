import { EmptyState as EmptyStateAtom } from "@/components/ui/atoms/EmptyState";
import { Pill } from "lucide-react";

export const EmptyState = () => {
  return (
    <EmptyStateAtom
      icon={Pill}
      description="Aucun traitement actif"
    />
  );
};
