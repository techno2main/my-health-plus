import { Badge } from "@/components/ui/badge";
import { ReactNode } from "react";

type StatusVariant = "success" | "warning" | "danger" | "secondary" | "default" | "muted" | "outline";

interface StatusBadgeProps {
  /**
   * The variant/color scheme of the badge
   */
  variant: StatusVariant;
  /**
   * The content to display in the badge
   */
  children: ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Generic StatusBadge component for displaying status indicators.
 * Wraps the base Badge component with semantic status variants.
 * 
 * @example
 * ```tsx
 * <StatusBadge variant="success">Actif</StatusBadge>
 * <StatusBadge variant="warning">Stock bas</StatusBadge>
 * <StatusBadge variant="danger">Critique</StatusBadge>
 * ```
 */
export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <Badge variant={variant} className={className}>
      {children}
    </Badge>
  );
}

/**
 * Specialized badge for stock status
 */
export function StockStatusBadge({ status }: { status: "ok" | "low" | "critical" }) {
  const config = {
    ok: { variant: "success" as const, label: "Stock OK" },
    low: { variant: "warning" as const, label: "Stock bas" },
    critical: { variant: "danger" as const, label: "Critique" },
  };

  const { variant, label } = config[status] || config.ok;
  return <StatusBadge variant={variant}>{label}</StatusBadge>;
}

/**
 * Specialized badge for active/inactive status
 */
export function ActiveStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <StatusBadge variant={isActive ? "success" : "muted"}>
      {isActive ? "Actif" : "Inactif"}
    </StatusBadge>
  );
}

/**
 * Specialized badge for severity levels
 */
export function SeverityBadge({ severity }: { severity: "Légère" | "Modérée" | "Sévère" }) {
  const config = {
    "Légère": "secondary" as const,
    "Modérée": "warning" as const,
    "Sévère": "danger" as const,
  };

  const variant = config[severity] || "default";
  return <StatusBadge variant={variant}>{severity}</StatusBadge>;
}
