// Utilitario para almacenamiento offline en IndexedDB
// Permite guardar y leer archivos binarios (audios, imágenes, mapas)

const DB_NAME = 'offline-resources-db';
const STORE_NAME = 'files';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveFile(key: string, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getFile(key: string): Promise<Blob | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result as Blob | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function saveFiles(files: {key: string, blob: Blob}[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    for (const {key, blob} of files) {
      tx.objectStore(STORE_NAME).put(blob, key);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllKeys(): Promise<string[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAllKeys();
    req.onsuccess = () => resolve(req.result as string[]);
    req.onerror = () => reject(req.error);
  });
}

export async function clearAll(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineUrl(path: string, offlineMode: boolean): Promise<string> {
  if (!offlineMode) return path;
  // Determinar la clave en IndexedDB
  let key = '';
  if (path.startsWith('/audio/audios/')) key = 'audio/' + path.split('/').pop();
  else if (path.startsWith('/audios/')) key = 'audio/' + path.split('/').pop();
  else if (path.startsWith('/places/')) key = 'image/' + path.split('/').pop();
  else return path;
  try {
    const blob = await getFile(key);
    if (blob) return URL.createObjectURL(blob);
    return path;
  } catch {
    return path;
  }
}

// Funciones para verificar estado premium offline
export function checkOfflinePremiumStatus(): boolean {
  try {
    // Verificar token demo premium
    const storedToken = localStorage.getItem('jwt');
    if (storedToken === 'demo-premium-token') {
      return true;
    }
    
    // Verificar usuario premium en localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      return !!(userData && userData.isSubscribed && userData.plan && userData.plan.status === 'active');
    }
    
    return false;
  } catch (error) {
    console.error('Error checking offline premium status:', error);
    return false;
  }
}

export function getOfflineUserData(): any {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  } catch (error) {
    console.error('Error getting offline user data:', error);
    return null;
  }
}

export function isOfflineMode(): boolean {
  return !navigator.onLine;
} 