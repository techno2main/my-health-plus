import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Download, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DataManagementCardProps {
  onDeleteAccount: () => void;
}

export function DataManagementCard({
  onDeleteAccount,
}: DataManagementCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Gestion des données</h3>
      </div>
      <div className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => navigate("/profile-export")}
        >
          <Download className="mr-2 h-4 w-4" />
          Télécharger les données
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start text-danger hover:bg-danger hover:text-white border-danger"
          onClick={onDeleteAccount}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer mon compte
        </Button>
      </div>
    </Card>
  );
}
