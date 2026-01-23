import { AppLayout } from "@/components/Layout/AppLayout";
import { PageHeaderWithHelp } from "@/components/Layout/PageHeaderWithHelp";
import { PersonnalisationTabs } from "./components/PersonnalisationTabs";
import { ThemeContent } from "./components/ThemeContent";
import { NavigationManagerContent } from "@/pages/admin/NavigationManagerContent";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Personnalisation() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <AppLayout>
      <div className="container max-w-2xl mx-auto px-3 md:px-4 pb-6">
        <div className="sticky top-0 z-20 bg-background pt-8 pb-4">
          <PageHeaderWithHelp 
            title="Personnalisation"
            subtitle="Apparence et menus"
            helpText="Cette section vous permet de personnaliser l'apparence de l'application (thème, couleurs) et de configurer les menus de navigation selon vos préférences."
            leftButton={
              <button
                onClick={() => navigate("/settings")}
                className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors shrink-0"
                title="Retour"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            }
          />
        </div>
        
        <div className="mt-4">
          <PersonnalisationTabs
            apparenceContent={<ThemeContent />}
            menusContent={<NavigationManagerContent />}
          />
        </div>
      </div>
    </AppLayout>
  );
}
