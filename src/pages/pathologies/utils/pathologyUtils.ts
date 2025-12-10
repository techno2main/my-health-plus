export interface Pathology {
  id: string;
  created_by?: string;
  name: string;
  description: string | null;
  severity: string | null;
  is_approved?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type PathologyFormData = {
  name: string;
  description: string | null;
  severity?: string | null; // Optionnel pour le formulaire
};

export function filterPathologies(pathologies: Pathology[], searchTerm: string): Pathology[] {
  if (!searchTerm.trim()) return pathologies;
  
  const term = searchTerm.toLowerCase();
  return pathologies.filter((pathology) =>
    pathology.name.toLowerCase().includes(term) ||
    pathology.description?.toLowerCase().includes(term)
  );
}
