export const formatImageUrl = (imageUrl, name = '') => {
  const BASE_URL = 'http://localhost:8000'

  if (!imageUrl) {
    const encodedName = encodeURIComponent(name || 'Utilisateur')
    return `https://ui-avatars.com/api/?name=${encodedName}&background=E0F2F7&color=0694A2&bold=true`
  }
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }

  if (imageUrl.startsWith('storage/')) {
    return `${BASE_URL}/${imageUrl}`
  }

  return `${BASE_URL}/storage/${imageUrl}`
}