export const formatImageUrl = (imageUrl) => {
  // Définis l'URL de base de ton backend Laravel
  const BASE_URL = 'http://localhost:8000';
  // Définis une image par défaut si imageUrl n'existe pas
  const DEFAULT_IMAGE = 'https://via.placeholder.com/150?text=No+Image'; // Ou une image par défaut de ton choix

  if (!imageUrl) {
    return DEFAULT_IMAGE;
  }

  // Vérifie si l'URL est déjà une URL absolue (par ex. si tu utilises des CDN ou des URLs externes)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Si l'URL relative commence déjà par 'storage/', pas besoin de l'ajouter
  if (imageUrl.startsWith('storage/')) {
    return `${BASE_URL}/${imageUrl}`;
  }

  // Pour les URLs comme 'profile_images/avatar.jpg', ajoute 'storage/'
  return `${BASE_URL}/storage/${imageUrl}`;
};