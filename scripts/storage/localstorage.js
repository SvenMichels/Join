export function saveToStorage(storageKey, dataToStore) {
  localStorage.setItem(storageKey, JSON.stringify(dataToStore));
}

export function loadFromStorage(storageKey) {
  const retrievedData = localStorage.getItem(storageKey);
  return retrievedData ? JSON.parse(retrievedData) : null;
}
