import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCleanedUp = false;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (isCleanedUp) return;

        // Gérer les événements d'erreur de token
        if (event === 'TOKEN_REFRESHED' && !session) {
          // Token invalide, nettoyer la session
          setTimeout(() => {
            supabase.auth.signOut().catch(() => {});
          }, 0);
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session with error handling
    supabase.auth.getSession()
      .then(async ({ data: { session }, error }) => {
        if (isCleanedUp) return;

        if (error) {
          // Nettoyer toute session invalide
          await supabase.auth.signOut().catch(() => {});
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }

        // Vérifier si la session est valide
        if (session) {
          // Tester si le token est valide en faisant une requête simple
          const { error: userError } = await supabase.auth.getUser();
          if (userError) {
            // Token invalide, nettoyer
            await supabase.auth.signOut().catch(() => {});
            setSession(null);
            setUser(null);
            setLoading(false);
            return;
          }
        }

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch(async (err) => {
        if (isCleanedUp) return;
        console.error("❌ Erreur inattendue lors de getSession:", err);
        // Nettoyer en cas d'erreur
        await supabase.auth.signOut().catch(() => {});
        setSession(null);
        setUser(null);
        setLoading(false);
      });

    return () => {
      isCleanedUp = true;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    loading,
    signInWithGoogle,
    signUp,
    signIn,
    signOut,
  };
}
