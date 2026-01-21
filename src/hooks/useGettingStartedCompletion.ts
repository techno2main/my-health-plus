import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  blood_type: string | null;
  weight: number | null;
  height: number | null;
}

export interface GettingStartedCompletion {
  profilePercent: number;
  profileMissingFields: number;
  
  healthProfessionals: {
    hasMedecin: boolean;
    hasPharmacie: boolean;
    percent: number;
    total: number;
  };
  
  allergiesCount: number;
  
  overallPercent: number;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export const useGettingStartedCompletion = (): GettingStartedCompletion => {
  const { user } = useAuth();
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [healthProf, setHealthProf] = useState({ hasMedecin: false, hasPharmacie: false, total: 0 });
  const [allergiesCount, setAllergiesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch profil
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, date_of_birth, blood_type, weight, height')
        .eq('id', user.id)
        .single();

      setProfileData(profile);

      // Fetch professionnels de santé
      const { data: professionals } = await supabase
        .from('health_professionals')
        .select('type')
        .eq('user_id', user.id);

      const hasMedecin = professionals?.some(p => p.type === 'doctor') || false;
      const hasPharmacie = professionals?.some(p => p.type === 'pharmacy') || false;
      
      setHealthProf({
        hasMedecin,
        hasPharmacie,
        total: professionals?.length || 0
      });

      // Fetch allergies
      const { count } = await supabase
        .from('allergies')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', user.id);

      setAllergiesCount(count || 0);

    } catch (error) {
      console.error('Error fetching getting-started data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  // Calcul du % profil (6 champs importants)
  const profileFields = [
    profileData?.first_name,
    profileData?.last_name,
    profileData?.date_of_birth,
    profileData?.blood_type,
    profileData?.weight,
    profileData?.height,
  ];
  const filledFields = profileFields.filter(f => f !== null && f !== undefined && f !== '').length;
  const profilePercent = Math.round((filledFields / profileFields.length) * 100);
  const profileMissingFields = profileFields.length - filledFields;

  // Calcul du % professionnels de santé
  let healthProfPercent = 0;
  if (healthProf.hasMedecin && healthProf.hasPharmacie) {
    healthProfPercent = 100;
  } else if (healthProf.hasMedecin || healthProf.hasPharmacie) {
    healthProfPercent = 50;
  }

  // Calcul du % global (Profil = 70%, Professionnels = 30%)
  const overallPercent = Math.round((profilePercent * 0.7) + (healthProfPercent * 0.3));

  return {
    profilePercent,
    profileMissingFields,
    
    healthProfessionals: {
      hasMedecin: healthProf.hasMedecin,
      hasPharmacie: healthProf.hasPharmacie,
      percent: healthProfPercent,
      total: healthProf.total
    },
    
    allergiesCount,
    
    overallPercent,
    isLoading,
    refetch: fetchData
  };
};
