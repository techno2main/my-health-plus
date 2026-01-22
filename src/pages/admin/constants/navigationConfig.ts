import {
  Home, Pill, Package, Calendar, Settings,
  User, Heart, Bell, Shield, FileText,
  ClipboardList, Users, Database, Smartphone,
  Moon, Sun, Mail, Phone, MapPin, Search
} from "lucide-react";

export const ICON_MAP: Record<string, any> = {
  Home, Pill, Package, Calendar, Settings,
  User, Heart, Bell, Shield, FileText,
  ClipboardList, Users, Database, Smartphone,
  Moon, Sun, Mail, Phone, MapPin, Search,
};

export const AVAILABLE_PATHS = [
  { value: "/", label: "Accueil (Quotidien)" },
  { value: "/treatments", label: "Traitements" },
  { value: "/treatments/new", label: "Nouveau traitement" },
  { value: "/calendar", label: "Calendrier" },
  { value: "/stocks", label: "Stocks" },
  { value: "/stocks/new", label: "Nouveau stock" },
  { value: "/stocks/adjust", label: "Ajuster stock" },
  { value: "/history", label: "Historique" },
  { value: "/prescriptions", label: "Prescriptions" },
  { value: "/referentials", label: "Référentiels" },
  { value: "/settings", label: "Paramètres" },
  { value: "/settings/sections-order", label: "Paramètres › Ordre des sections" },
  { value: "/settings/personnalisation", label: "Paramètres › Personnalisation" },
  { value: "/settings/reglages", label: "Paramètres › Réglages" },
  { value: "/profile", label: "Profil" },
  { value: "/profile-export", label: "Export profil" },
  { value: "/about", label: "À propos" },
  { value: "/rattrapage", label: "Rattrapage" },
  { value: "/onboarding", label: "Guide de démarrage" },
  { value: "/getting-started", label: "Premiers pas" },
  { value: "/notifications/debug", label: "Debug notifications (Admin)" },
];

export const iconNames = Object.keys(ICON_MAP);

export const getIconComponent = (iconName: string) => {
  return ICON_MAP[iconName] || Home;
};
