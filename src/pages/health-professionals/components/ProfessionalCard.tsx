import { ActionCard } from "@/components/ui/molecules/ActionCard";
import { Badge } from "@/components/ui/badge";
import { Star, Phone, Mail, MapPin } from "lucide-react";
import type { HealthProfessional } from "../utils/professionalUtils";

interface ProfessionalCardProps {
  professional: HealthProfessional;
  onEdit: (professional: HealthProfessional) => void;
  onDelete: (id: string) => void;
}

export function ProfessionalCard({ professional, onEdit, onDelete }: ProfessionalCardProps) {
  const subtitle = (
    <div className="flex items-center gap-2">
      {professional.is_primary_doctor && (
        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
      )}
      {professional.specialty && <Badge variant="secondary">{professional.specialty}</Badge>}
    </div>
  );

  return (
    <ActionCard
      title={professional.name}
      subtitle={subtitle}
      onEdit={() => onEdit(professional)}
      onDelete={() => onDelete(professional.id)}
    >
      <div className="space-y-2 text-sm">
        {professional.phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{professional.phone}</span>
          </div>
        )}
        {professional.email && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{professional.email}</span>
          </div>
        )}
        {(professional.street_address || professional.postal_code || professional.city) && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {professional.street_address && (
                <>
                  {professional.street_address}
                  <br />
                </>
              )}
              {(professional.postal_code || professional.city) && (
                <>
                  {professional.postal_code} {professional.city}
                </>
              )}
            </span>
          </div>
        )}
      </div>
    </ActionCard>
  );
}
