import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useEmailAuth = () => {
  const { signIn, signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async (email: string, password: string) => {
    setIsSubmitting(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      toast.error('Erreur de connexion', {
        description: error.message,
      });
    }
    
    setIsSubmitting(false);
  };

  const handleSignUp = async (email: string, password: string) => {
    setIsSubmitting(true);
    
    const { error } = await signUp(email, password);
    
    if (error) {
      toast.error('Erreur d\'inscription', {
        description: error.message,
      });
    } else {
      // Message clair expliquant que la confirmation email est requise
      toast.success('Vérifiez votre boîte mail !', {
        description: `Un email de confirmation a été envoyé à ${email}. Cliquez sur le lien pour activer votre compte.`,
        duration: 10000, // Afficher 10 secondes
      });
    }
    
    setIsSubmitting(false);
  };

  return {
    isSubmitting,
    handleSignIn,
    handleSignUp,
  };
};
