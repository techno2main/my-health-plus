import { AppLayout } from "@/components/Layout/AppLayout";
import { PageHeaderWithHelp } from "@/components/Layout/PageHeaderWithHelp";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReglagesTabs, useActiveReglagesTab } from "./components/ReglagesTabs";
import { NotificationSettingsContent } from "@/pages/notification-settings/NotificationSettingsContent";
import { CalendarSyncContent } from "@/pages/calendar-sync/CalendarSyncContent";
import { PrivacyContent } from "@/pages/privacy/PrivacyContent";
import { useEffect } from "react";

function ReglagesHeader({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const activeTab = useActiveReglagesTab();
  
  const getTabInfo = () => {
    switch (activeTab) {
      case "notifications":
        return {
          subtitle: "Notifications",
          helpText: "Configurez vos préférences de notifications pour recevoir les alertes de prises de médicaments, rappels et autres événements importants."
        };
      case "synchronisation":
        return {
          subtitle: "Synchronisation",
          helpText: "Synchronisez vos prises de médicaments avec votre calendrier Google, Apple ou Outlook pour un suivi intégré à votre agenda."
        };
      case "securite":
        return {
          subtitle: "Sécurité",
          helpText: "Protégez vos données de santé avec un code PIN et gérez la confidentialité de vos informations personnelles."
        };
      default:
        return {
          subtitle: "Configuration de l'application",
          helpText: ""
        };
    }
  };
  
  const tabInfo = getTabInfo();
  
  return (
    <PageHeaderWithHelp 
      title="Réglages"
      subtitle={tabInfo.subtitle}
      helpText={tabInfo.helpText}
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
  );
}

export default function Reglages() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <AppLayout>
      <div className="container max-w-2xl mx-auto px-4 pb-6">
        <ReglagesTabs
          notificationsContent={<NotificationSettingsContent />}
          synchronisationContent={<CalendarSyncContent />}
          securiteContent={<PrivacyContent />}
          header={
            <div className="sticky top-0 z-20 bg-background pt-8 pb-4">
              <ReglagesHeader navigate={navigate} />
            </div>
          }
        />
      </div>
    </AppLayout>
  );
}
