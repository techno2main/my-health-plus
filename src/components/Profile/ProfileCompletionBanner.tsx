import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { User, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  blood_type: string | null;
  height: number | null;
  weight: number | null;
  avatar_url: string | null;
}

const DISMISSED_KEY_PREFIX = "profileBannerDismissed_";
const DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24 heures

export function ProfileCompletionBanner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, date_of_birth, blood_type, height, weight, avatar_url")
        .eq("id", user?.id)
        .maybeSingle();

      if (error) throw error;

      setProfile(data);

      // Vérifier si le banner a été dismiss récemment
      const dismissKey = `${DISMISSED_KEY_PREFIX}${user?.id}`;
      const dismissedAt = localStorage.getItem(dismissKey);
      const shouldShow = !dismissedAt || Date.now() - parseInt(dismissedAt) > DISMISS_DURATION;

      // Calculer le pourcentage et décider d'afficher
      const completion = calculateCompletion(data);
      setIsVisible(completion < 100 && shouldShow);
    } catch (error) {
      console.error("Error loading profile for banner:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCompletion = (data: ProfileData | null): number => {
    if (!data) return 0;

    const fields = [
      data.first_name,
      data.last_name,
      data.date_of_birth,
      data.blood_type,
      data.height,
      data.weight,
    ];

    const filledFields = fields.filter((field) => field !== null && field !== "").length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const handleDismiss = () => {
    if (user) {
      const dismissKey = `${DISMISSED_KEY_PREFIX}${user.id}`;
      localStorage.setItem(dismissKey, Date.now().toString());
    }
    setIsVisible(false);
  };

  const handleComplete = () => {
    navigate("/profile");
  };

  const completion = calculateCompletion(profile);

  if (isLoading || !isVisible || completion === 100) {
    return null;
  }

  const getCompletionMessage = () => {
    if (completion === 0) return "Votre profil est vide";
    if (completion < 50) return "Votre profil est incomplet";
    if (completion < 100) return "Plus que quelques infos !";
    return "Profil complet";
  };

  const getCompletionColor = () => {
    if (completion < 50) return "text-orange-500";
    if (completion < 100) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
        >
          <Card className="p-4 shadow-lg border-primary/20 bg-card/95 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              {/* Icône avec badge de pourcentage */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className={`absolute -bottom-1 -right-1 text-xs font-bold px-1.5 py-0.5 rounded-full bg-background border ${getCompletionColor()}`}>
                  {completion}%
                </div>
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm">{getCompletionMessage()}</h4>
                  <button
                    onClick={handleDismiss}
                    className="p-1 rounded-full hover:bg-muted transition-colors -mr-1"
                    aria-label="Fermer"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Barre de progression */}
                <Progress value={completion} className="h-1.5 mb-3" />

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleComplete}
                    size="sm"
                    className="flex-1 h-8 text-xs"
                  >
                    Compléter
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-muted-foreground"
                  >
                    Plus tard
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
