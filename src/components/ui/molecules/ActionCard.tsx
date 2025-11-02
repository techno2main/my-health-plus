import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface ActionCardProps {
  /**
   * Main title/heading of the card
   */
  title: string;
  /**
   * Optional subtitle or secondary heading element
   */
  subtitle?: ReactNode;
  /**
   * Main content/body of the card
   */
  children?: ReactNode;
  /**
   * Optional footer content
   */
  footer?: ReactNode;
  /**
   * Edit action callback
   */
  onEdit?: () => void;
  /**
   * Delete action callback
   */
  onDelete?: () => void;
  /**
   * Custom actions to display instead of default edit/delete
   */
  customActions?: ReactNode;
  /**
   * Optional icon to display before the title
   */
  icon?: LucideIcon;
  /**
   * Additional CSS classes for the card
   */
  className?: string;
}

/**
 * ActionCard component following Atomic Design principles (Molecule).
 * Provides a consistent card layout with title, optional actions, and content.
 * Commonly used for entity cards (Pathologies, Allergies, Professionals, etc.)
 * 
 * @example
 * ```tsx
 * <ActionCard
 *   title="Diabète Type 2"
 *   subtitle={<Badge>Chronique</Badge>}
 *   onEdit={() => handleEdit(item)}
 *   onDelete={() => handleDelete(item.id)}
 * >
 *   <p className="text-sm text-muted-foreground">Description de la pathologie</p>
 * </ActionCard>
 * ```
 */
export function ActionCard({
  title,
  subtitle,
  children,
  footer,
  onEdit,
  onDelete,
  customActions,
  icon: Icon,
  className = "",
}: ActionCardProps) {
  return (
    <Card className={`p-4 surface-elevated hover:shadow-md transition-shadow ${className}`}>
      {/* Header with title and actions */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            <h3 className="font-semibold">{title}</h3>
          </div>
          {subtitle && <div className="mt-1">{subtitle}</div>}
        </div>

        {/* Actions */}
        {customActions || (
          <div className="flex gap-1">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {children && <div className="space-y-2">{children}</div>}

      {/* Footer */}
      {footer && <div className="mt-4">{footer}</div>}
    </Card>
  );
}
