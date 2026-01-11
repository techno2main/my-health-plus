import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getAuthenticatedUser } from "@/lib/auth-guard";
import { toast } from "sonner";

interface MedicationCatalog {
  id: string;
  name: string;
  pathology_id: string | null;
  pathologies?: {
    id: string;
    name: string;
    description: string | null;
  } | null;
  default_posology: string | null;
  strength: string | null;
  form: string | null;
  description: string | null;
  initial_stock: number;
  min_threshold: number;
  default_times: string[] | null;
  total_stock?: number;
  effective_threshold?: number;
}

interface FormData {
  name: string;
  pathology_id: string;
  form: string;
  default_posology: string;
  strength: string;
  description: string;
  initial_stock: string;
  min_threshold: string;
  default_times: string[];
}

const initialFormData: FormData = {
  name: "",
  pathology_id: "",
  form: "",
  default_posology: "Définir une ou plusieurs prises",
  strength: "",
  description: "",
  initial_stock: "0",
  min_threshold: "10",
  default_times: [],
};

export function useMedicationCatalog() {
  const navigate = useNavigate();
  const [medications, setMedications] = useState<MedicationCatalog[]>([]);
  const [pathologies, setPathologies] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string>("ALL");
  const [isAlphabetOpen, setIsAlphabetOpen] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingMed, setEditingMed] = useState<MedicationCatalog | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // PAS de useEffect automatique - le composant parent doit appeler manuellement

  const loadPathologies = async () => {
    try {
      const { data, error } = await supabase
        .from("pathologies")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setPathologies(data || []);
    } catch (error) {
      console.error("Error loading pathologies:", error);
    }
  };

  const loadMedications = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("medication_catalog")
        .select(`
          *,
          pathologies (
            id,
            name,
            description
          )
        `);

      if (selectedLetter !== "ALL") {
        query = query.ilike("name", `${selectedLetter}%`);
      }

      const { data, error } = await query.order("name").limit(selectedLetter === "ALL" ? 2000 : 500);

      if (error) throw error;

      // PAS de chargement de stock - version simple
      setMedications(data || []);
    } catch (error) {
      console.error("Error loading medications:", error);
      toast.error("Erreur lors du chargement du référentiel");
    } finally {
      setLoading(false);
    }
  };

  const filteredMedications = useMemo(() => {
    if (!searchTerm) return medications;
    const lowerSearch = searchTerm.toLowerCase();
    return medications.filter((med) =>
      med.name.toLowerCase().includes(lowerSearch) ||
      med.pathologies?.name?.toLowerCase().includes(lowerSearch)
    );
  }, [medications, searchTerm]);

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("Le nom du médicament est obligatoire");
      return;
    }

    try {
      console.log('[SUBMIT] formData.pathology_id:', formData.pathology_id);
      
      if (editingMed) {
        const updateData = {
          name: formData.name,
          pathology_id: formData.pathology_id || null,
          form: formData.form || null,
          strength: formData.strength || null,
          description: formData.description || null,
        };
        console.log('[SUBMIT] UPDATE data:', updateData);
        
        const { error } = await supabase
          .from("medication_catalog")
          .update(updateData)
          .eq("id", editingMed.id);

        if (error) throw error;
        toast.success("Médicament modifié avec succès");
      } else {
        const { data: user } = await getAuthenticatedUser();
        
        const insertData = {
          name: formData.name,
          pathology_id: formData.pathology_id || null,
          form: formData.form || null,
          strength: formData.strength || null,
          description: formData.description || null,
          created_by: user?.id,
          is_approved: true,
        };
        console.log('[SUBMIT] INSERT data:', insertData);
        
        const { error: insertError } = await supabase.from("medication_catalog").insert(insertData);

        if (insertError) throw insertError;
        toast.success("Médicament ajouté avec succès");
      }

      closeDialog();
      await loadMedications();
    } catch (error) {
      console.error("Error saving medication:", error);
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      const { error } = await supabase.from("medication_catalog").delete().eq("id", deletingId);

      if (error) throw error;
      toast.success("Médicament supprimé");
      await loadMedications();
    } catch (error) {
      console.error("Error deleting medication:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setShowDeleteAlert(false);
      setDeletingId(null);
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setShowDeleteAlert(true);
  };

  const openDialog = (med?: MedicationCatalog) => {
    if (med) {
      setEditingMed(med);
      setFormData({
        name: med.name,
        pathology_id: med.pathology_id || "",
        form: med.form || "",
        default_posology: med.default_posology || "",
        strength: med.strength || "",
        description: med.description || "",
        initial_stock: String(med.initial_stock || 0),
        min_threshold: String(med.min_threshold || 10),
        default_times: med.default_times || [],
      });
    } else {
      setEditingMed(null);
      setFormData(initialFormData);
    }
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingMed(null);
    setFormData(initialFormData);
  };

  const handleStockClick = async (catalogId: string) => {
    // Navigation simple vers stocks
    navigate("/stocks");
  };

  return {
    medications,
    pathologies,
    loading,
    searchTerm,
    setSearchTerm,
    selectedLetter,
    setSelectedLetter,
    isAlphabetOpen,
    setIsAlphabetOpen,
    showDialog,
    setShowDialog: openDialog,
    closeDialog,
    showDeleteAlert,
    setShowDeleteAlert,
    editingMed,
    formData,
    setFormData,
    handleSubmit,
    handleDelete,
    confirmDelete,
    handleStockClick,
    filteredMedications,
    openDialog,
    navigate,
    loadMedications,
    loadPathologies,
  };
}
