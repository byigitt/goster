const LINKS_KEY = 'goster_links';

export function getStoredLinks() {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(LINKS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

export function saveLink(linkData) {
  if (typeof window === 'undefined') return;
  
  try {
    const links = getStoredLinks();
    const newLink = {
      ...linkData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'waiting'
    };
    
    links.unshift(newLink);
    localStorage.setItem(LINKS_KEY, JSON.stringify(links));
    return newLink;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return null;
  }
}

export function updateLinkStatus(shortCode, updates) {
  if (typeof window === 'undefined') return;
  
  try {
    const links = getStoredLinks();
    const index = links.findIndex(link => link.shortCode === shortCode);
    
    if (index !== -1) {
      links[index] = { ...links[index], ...updates };
      localStorage.setItem(LINKS_KEY, JSON.stringify(links));
      return links[index];
    }
    return null;
  } catch (error) {
    console.error('Error updating localStorage:', error);
    return null;
  }
}

export function deleteLink(id) {
  if (typeof window === 'undefined') return;
  
  try {
    const links = getStoredLinks();
    const filtered = links.filter(link => link.id !== id);
    localStorage.setItem(LINKS_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting from localStorage:', error);
    return false;
  }
}

export function getLinkByShortCode(shortCode) {
  const links = getStoredLinks();
  return links.find(link => link.shortCode === shortCode);
}