import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserRole } from "@/hooks/useUserRole";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableNavigationItem } from "./components/SortableNavigationItem";
import { NavigationItemDialog } from "./components/NavigationItemDialog";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { useNavigationManager } from "./hooks/useNavigationManager";

export function NavigationManagerContent() {
  const queryClient = useQueryClient();
  const { isAdmin } = useUserRole();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    path: "",
    icon: "",
    position: 0,
    is_active: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        tolerance: 5,
        delay: 0,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: navItems, isLoading } = useQuery({
    queryKey: ["navigation-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("navigation_items")
        .select("*")
        .order("position");
      
      if (error) throw error;
      return data;
    },
  });

  const {
    createMutation,
    updateMutation,
    deleteMutation,
    toggleVisibilityMutation,
    updatePositionsMutation,
  } = useNavigationManager();

  const resetForm = () => {
    setFormData({
      name: "",
      path: "",
      icon: "",
      position: 0,
      is_active: true,
    });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      path: item.path,
      icon: item.icon,
      position: item.position,
      is_active: item.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.path || !formData.icon || !formData.position) {
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, item: formData }, {
        onSuccess: () => resetForm(),
      });
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => resetForm(),
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id || !navItems) return;
    
    const oldIndex = navItems.findIndex((item) => item.id === active.id);
    const newIndex = navItems.findIndex((item) => item.id === over.id);
    
    const reorderedItems = arrayMove(navItems, oldIndex, newIndex);
    const updates = reorderedItems.map((item, idx) => ({
      id: item.id,
      position: idx + 1,
    }));

    queryClient.setQueryData(["navigation-items"], reorderedItems);
    updatePositionsMutation.mutate(updates);
  };

  const handleMoveUp = (id: string) => {
    if (!navItems) return;
    const index = navItems.findIndex((item) => item.id === id);
    if (index === -1 || index === 0) return;

    const reorderedItems = arrayMove(navItems, index, index - 1);
    const updates = reorderedItems.map((item, idx) => ({
      id: item.id,
      position: idx + 1,
    }));

    queryClient.setQueryData(["navigation-items"], reorderedItems);
    updatePositionsMutation.mutate(updates);
  };

  const handleMoveDown = (id: string) => {
    if (!navItems) return;
    const index = navItems.findIndex((item) => item.id === id);
    if (index === -1 || index >= navItems.length - 1) return;

    const reorderedItems = arrayMove(navItems, index, index + 1);
    const updates = reorderedItems.map((item, idx) => ({
      id: item.id,
      position: idx + 1,
    }));

    queryClient.setQueryData(["navigation-items"], reorderedItems);
    updatePositionsMutation.mutate(updates);
  };

  const handleToggleVisibility = (id: string) => {
    const item = navItems?.find((item) => item.id === id);
    if (!item) return;
    
    setPendingChanges(prev => {
      const currentPendingState = prev[id];
      const newState = currentPendingState !== undefined ? !currentPendingState : !item.is_active;
      
      let newPendingChanges;
      
      if (newState === item.is_active) {
        const { [id]: _, ...rest } = prev;
        newPendingChanges = rest;
      } else {
        newPendingChanges = {
          ...prev,
          [id]: newState
        };
      }
      
      setHasUnsavedChanges(Object.keys(newPendingChanges).length > 0);
      return newPendingChanges;
    });
  };

  const handleSaveChanges = () => {
    if (Object.keys(pendingChanges).length === 0) return;
    
    const updates = Object.entries(pendingChanges).map(([id, is_active]) => ({
      id,
      is_active
    }));
    
    toggleVisibilityMutation.mutate(updates, {
      onSuccess: () => {
        setPendingChanges({});
        setHasUnsavedChanges(false);
      }
    });
  };

  const handleCancelChanges = () => {
    setPendingChanges({});
    setHasUnsavedChanges(false);
  };

  const getItemVisibility = (itemId: string, originalIsActive: boolean): boolean => {
    return pendingChanges[itemId] !== undefined ? pendingChanges[itemId] : originalIsActive;
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {isAdmin ? (
            <>Réorganisez les éléments par glisser-déposer ou avec les flèches, ajoutez, modifiez ou supprimez des sections selon vos besoins.</>
          ) : (
            <>Réorganisez les éléments par glisser-déposer ou avec les flèches, masquez les sections que vous n'utilisez pas.</>
          )}
        </AlertDescription>
      </Alert>

      {isAdmin && (
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="w-full"
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un élément
        </Button>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={navItems?.map(item => item.id) || []}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {isLoading ? (
              <Card className="p-6 text-center text-muted-foreground">
                Chargement...
              </Card>
            ) : navItems?.length === 0 ? (
              <Card className="p-6 text-center text-muted-foreground">
                Aucun item de navigation
              </Card>
            ) : (
              navItems?.map((item, index) => (
                <SortableNavigationItem
                  key={item.id}
                  item={item}
                  onEdit={handleEdit}
                  onDelete={(id) => {
                    setItemToDelete(id);
                    setDeleteDialogOpen(true);
                  }}
                  onToggleVisibility={handleToggleVisibility}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  isFirst={index === 0}
                  isLast={index === navItems.length - 1}
                  isAdmin={isAdmin}
                  getItemVisibility={getItemVisibility}
                  hasUnsavedChanges={hasUnsavedChanges}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      {hasUnsavedChanges && (
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleCancelChanges}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSaveChanges}
            className="flex-1 gradient-primary"
          >
            Enregistrer
          </Button>
        </div>
      )}

      {isAdmin && (
        <NavigationItemDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingId={editingId}
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleSubmit}
          onReset={resetForm}
        />
      )}

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
