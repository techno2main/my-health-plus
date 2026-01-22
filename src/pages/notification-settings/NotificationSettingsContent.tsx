import { useNotificationSystem } from "@/hooks/useNotificationSystem";
import { PermissionBanners } from "./components/PermissionBanners";
import { GlobalToggleCard } from "./components/GlobalToggleCard";
import { MedicationRemindersCard } from "./components/MedicationRemindersCard";
import { StockAlertsCard } from "./components/StockAlertsCard";
import { PrescriptionRenewalCard } from "./components/PrescriptionRenewalCard";
import { PharmacyVisitCard } from "./components/PharmacyVisitCard";
import { CustomMessagesCard } from "./components/CustomMessagesCard";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function NotificationSettingsContent() {
  const { 
    preferences, 
    updatePreferences, 
    isSupported, 
    permission, 
    hasPermission,
    requestPermission,
    sendTestNotification,
    mode
  } = useNotificationSystem();

  const handleTogglePush = async (enabled: boolean) => {
    const permissionGranted = mode === 'native' ? hasPermission : permission === "granted";
    if (enabled && !permissionGranted) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    updatePreferences({ pushEnabled: enabled });
  };

  const handleTestNotification = async () => {
    const permissionGranted = mode === 'native' ? hasPermission : permission === "granted";
    if (!permissionGranted) {
      toast.error("Veuillez d'abord autoriser les notifications");
      return;
    }
    
    await sendTestNotification();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {isSupported && (mode === 'native' ? hasPermission : permission === "granted") && (
          <Button variant="outline" size="sm" onClick={handleTestNotification}>
            Tester
          </Button>
        )}
      </div>

      <PermissionBanners
        isSupported={isSupported}
        hasPermission={hasPermission}
        permission={permission}
        mode={mode}
        onRequestPermission={requestPermission}
      />

      <GlobalToggleCard
        pushEnabled={preferences.pushEnabled}
        isSupported={isSupported}
        permission={permission}
        onToggle={handleTogglePush}
      />

      <MedicationRemindersCard
        enabled={preferences.medicationReminders}
        reminderBefore={preferences.medicationReminderBefore}
        reminderDelay={preferences.medicationReminderDelay}
        pushEnabled={preferences.pushEnabled}
        onToggle={(checked) => updatePreferences({ medicationReminders: checked })}
        onReminderBeforeChange={(value) => updatePreferences({ medicationReminderBefore: value })}
        onReminderDelayChange={(value) => updatePreferences({ medicationReminderDelay: value })}
      />

      <StockAlertsCard
        enabled={preferences.stockAlerts}
        pushEnabled={preferences.pushEnabled}
        onToggle={(checked) => updatePreferences({ stockAlerts: checked })}
      />

      <PrescriptionRenewalCard
        enabled={preferences.prescriptionRenewal}
        renewalDays={preferences.prescriptionRenewalDays}
        pushEnabled={preferences.pushEnabled}
        onToggle={(checked) => updatePreferences({ prescriptionRenewal: checked })}
      />

      <PharmacyVisitCard
        enabled={preferences.pharmacyVisitReminder}
        reminderDays={preferences.pharmacyVisitReminderDays}
        pushEnabled={preferences.pushEnabled}
        onToggle={(checked) => updatePreferences({ pharmacyVisitReminder: checked })}
        onReminderDaysChange={(value) => updatePreferences({ pharmacyVisitReminderDays: value })}
      />

      <CustomMessagesCard
        customMessages={preferences.customMessages}
        onUpdate={(messages) => updatePreferences({ customMessages: messages })}
      />
    </div>
  );
}
