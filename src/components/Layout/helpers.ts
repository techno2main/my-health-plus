/**
 * Génère les initiales de l'utilisateur
 * @param profile Profil utilisateur avec prénom/nom
 * @param email Email de secours si pas de profil
 * @returns Initiales en majuscules ou null
 */
export function generateUserInitials(
  profile: { first_name?: string | null; last_name?: string | null } | null,
  email?: string
): string | null {
  if (profile?.first_name && profile?.last_name) {
    return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase();
  }
  
  if (email) {
    const emailPart = email.split('@')[0];
    return emailPart.substring(0, 2).toUpperCase();
  }
  
  return null;
}
