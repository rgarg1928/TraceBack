/**
 * Helper to resolve image paths.
 * If in production and VITE_API_URL is configured, it prepends the backend URL to relative upload paths.
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // If it's already an absolute URL or base64 data, return it
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }

  // Get the base API URL
  const apiURL = import.meta.env.VITE_API_URL || '';
  
  if (apiURL) {
    const cleanBase = apiURL.replace(/\/$/, '');
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${cleanBase}${cleanPath}`;
  }
  
  return imagePath;
};
