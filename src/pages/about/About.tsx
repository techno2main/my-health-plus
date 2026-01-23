import { AppLayout } from "@/components/Layout/AppLayout";
import { PageHeaderWithHelp } from "@/components/Layout/PageHeaderWithHelp";
import { ArrowLeft, Info, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AboutContent } from "./AboutContent";
import { PresentationContent } from "./PresentationContent";
import { useSearchParams } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"about" | "presentation">("about");

  useEffect(() => {
    // Scroll vers le haut au chargement
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'presentation') {
      setActiveTab('presentation');
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    const newTab = value as "about" | "presentation";
    setActiveTab(newTab);
    
    const params = new URLSearchParams(searchParams);
    params.set('tab', newTab);
    setSearchParams(params, { replace: true });
  };

  return (
    <AppLayout>
      <div className="container max-w-2xl mx-auto px-4 pb-6">
        <div className="sticky top-0 z-20 bg-background pt-8 pb-4">
          <PageHeaderWithHelp 
            title="L'application"
            subtitle="Informations et présentation"
            helpText="Découvrez MyHealth+, votre assistant santé personnel. Consultez les informations sur l'application et personnalisez son apparence."
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
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <div className="sticky top-[72px] z-20 bg-background pb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="about" className="flex items-center gap-2">
                  <Info className="h-4 w-4 shrink-0" />
                  <span className="text-sm">À propos</span>
                </TabsTrigger>
                <TabsTrigger value="presentation" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 shrink-0" />
                  <span className="text-sm">Présentation</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="about" className="mt-4">
              <AboutContent />
            </TabsContent>

            <TabsContent value="presentation" className="mt-4">
              <PresentationContent />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
