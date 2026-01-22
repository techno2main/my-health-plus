import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useNavigationManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (item: any) => {
      const { error } = await supabase
        .from("navigation_items")
        .insert([item]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["navigation-items"] });
      toast({ title: "Item ajouté avec succès" });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'item",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, item }: { id: string; item: any }) => {
      const { error } = await supabase
        .from("navigation_items")
        .update(item)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["navigation-items"] });
      toast({ title: "Item modifié avec succès" });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'item",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("navigation_items")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["navigation-items"] });
      toast({ title: "Item supprimé avec succès" });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'item",
        variant: "destructive",
      });
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async (updates: Array<{ id: string; is_active: boolean }>) => {
      const promises = updates.map(({ id, is_active }) =>
        supabase
          .from("navigation_items")
          .update({ is_active })
          .eq("id", id)
      );
      
      await Promise.all(promises);
    },
    onSuccess: async (_, updates) => {
      // Mettre à jour le cache de la liste complète
      queryClient.setQueryData(["navigation-items"], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((item: any) => {
          const update = updates.find(u => u.id === item.id);
          if (update) {
            return { ...item, is_active: update.is_active };
          }
          return item;
        });
      });
      
      // Refetch la liste des items actifs pour la navigation
      await queryClient.refetchQueries({ queryKey: ["navigation-items", "active"] });
      toast({ title: "Modifications enregistrées avec succès" });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les modifications",
        variant: "destructive",
      });
    },
  });

  const updatePositionsMutation = useMutation({
    mutationFn: async (items: Array<{ id: string; position: number }>) => {
      const updates = items.map(({ id, position }) =>
        supabase
          .from("navigation_items")
          .update({ position })
          .eq("id", id)
      );
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["navigation-items"] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de réorganiser les items",
        variant: "destructive",
      });
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    toggleVisibilityMutation,
    updatePositionsMutation,
  };
}
