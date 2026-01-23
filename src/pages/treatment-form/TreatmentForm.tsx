import { AppLayout } from "@/components/Layout/AppLayout";
import { PageHeaderWithHelp } from "@/components/Layout/PageHeaderWithHelp";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { TreatmentWizard } from "@/components/TreatmentWizard/TreatmentWizard";
import { useEffect } from "react";

export default function TreatmentForm() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <AppLayout>
      <div className="container max-w-3xl mx-auto px-3 md:px-4 pb-28">
        <div className="sticky top-0 z-20 bg-background pt-8 pb-4">
          <PageHeaderWithHelp 
            title="Nouveau traitement"
            subtitle="Créez votre traitement en 4 étapes"
            helpText="Suivez les étapes pour créer un nouveau traitement : informations générales, ajout des médicaments, configuration des horaires de prise et stocks."
            leftButton={
              <Button variant="ghost" size="sm" onClick={() => navigate("/treatments")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            }
          />
        </div>

        <div className="mt-4">
          <TreatmentWizard />
        </div>
      </div>
    </AppLayout>
  );
}
