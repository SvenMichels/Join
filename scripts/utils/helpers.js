import { requestData } from "../firebase.js";

// Firebase returns objects, but we need arrays for processing
export function formatFirebaseDataToArray(firebaseDataObject) {
  if (!firebaseDataObject) return [];
  
  const formattedResultArray = [];
  const dataEntries = Object.entries(firebaseDataObject);
  
  for (let entryIndex = 0; entryIndex < dataEntries.length; entryIndex++) {
    const [dataKey, dataValue] = dataEntries[entryIndex];
    formattedResultArray.push({ id: dataKey, ...dataValue });
  }
  
  return formattedResultArray;
}

export async function loadAllTasksFromDatabase() {
  try {
    const databaseResponse = await requestData("GET", "tasks");
    const formattedTasksArray = formatFirebaseDataToArray(databaseResponse.data);
    return formattedTasksArray;
  } catch (loadingError) {
    return [];
  }
}

// Extract initials from full name (e.g. "Max Mustermann" -> "MM")
export function getInitials(fullNameString) {
  if (!fullNameString || typeof fullNameString !== "string") {
    return "??";
  }

  const nameWordsArray = fullNameString.trim().split(/\s+/);
  if (nameWordsArray.length === 1) {
    return nameWordsArray[0].substring(0, 2).toUpperCase();
  }
  
  const firstNameInitial = nameWordsArray[0][0] || "";
  const lastNameInitial = nameWordsArray[nameWordsArray.length - 1][0] || "";
  return (firstNameInitial + lastNameInitial).toUpperCase();
}
