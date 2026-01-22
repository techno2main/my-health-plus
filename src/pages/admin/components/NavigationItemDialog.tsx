import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft } from "lucide-react";
import { AVAILABLE_PATHS, iconNames, getIconComponent } from "../constants/navigationConfig";

interface NavigationItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  formData: {
    name: string;
    path: string;
    icon: string;
    position: number;
    is_active: boolean;
  };
  onFormDataChange: (data: any) => void;
  onSubmit: () => void;
  onReset: () => void;
}

export function NavigationItemDialog({
  open,
  onOpenChange,
  editingId,
  formData,
  onFormDataChange,
  onSubmit,
  onReset
}: NavigationItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) onReset();
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onOpenChange(false)} 
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle>
              {editingId ? "Modifier" : "Ajouter"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            {editingId ? "Modifiez les paramètres de cet élément de navigation" : "Ajoutez un nouvel élément au menu de navigation"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom affiché</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                placeholder="Ex: Accueil, Traitements, Calendrier..."
                className="bg-surface"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="path">Lien</Label>
              <Select
                value={formData.path}
                onValueChange={(value) => onFormDataChange({ ...formData, path: value })}
              >
                <SelectTrigger className="bg-surface">
                  <SelectValue placeholder="Choisissez un lien existant" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] bg-background">
                  {AVAILABLE_PATHS.map((path) => (
                    <SelectItem key={path.value} value={path.value}>
                      {path.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icône</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => onFormDataChange({ ...formData, icon: value })}
              >
                <SelectTrigger className="bg-surface">
                  <SelectValue placeholder="Choisissez une icône" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] bg-background">
                  {iconNames.map((iconName) => {
                    const Icon = getIconComponent(iconName);
                    return (
                      <SelectItem key={iconName} value={iconName}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {iconName}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                type="number"
                min="1"
                value={formData.position || ""}
                onChange={(e) => onFormDataChange({ ...formData, position: parseInt(e.target.value) || 0 })}
                placeholder="Ex: 1, 2, 3..."
                className="bg-surface"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => onFormDataChange({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Actif</Label>
            </div>
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t shrink-0 bg-background">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1 h-9"
            >
              Annuler
            </Button>
            <Button 
              onClick={onSubmit} 
              className="flex-1 gradient-primary h-9"
            >
              {editingId ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
