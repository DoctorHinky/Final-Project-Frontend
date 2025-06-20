// src/utils/auth.helper.ts
export const getCurrentUserId = (): string | null => {
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  if (!token) return null;
  
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return null;
    
    const payload = JSON.parse(atob(tokenParts[1]));
    return payload.sub || payload.userId || payload.id || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const getUserRole = (): string | null => {
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  if (!token) return null;
  
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return null;
    
    const payload = JSON.parse(atob(tokenParts[1]));
    return payload.role || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const isUserAuthenticated = (): boolean => {
  const userId = getCurrentUserId();
  return userId !== null;
};