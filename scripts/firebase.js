/**
 * Firebase-Konfiguration und HTTP-Request Utilities
 */

// Firebase Database Base URL
const FIREBASE_DATABASE_BASE_URL =
  "https://join-da-project-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Erstellt HTTP-Request-Optionen
 * @param {string} method - HTTP-Methode
 * @param {Object} data - Request-Daten
 * @returns {Object} Request-Optionen
 */
function createRequestOptions(method, data) {
  const options = {
    method: method.toUpperCase(),
    headers: { "Content-Type": "application/json" },
  };

  const methodsWithBody = ["POST", "PUT", "PATCH"];
  if (methodsWithBody.includes(options.method)) {
    options.body = JSON.stringify(data);
  }

  return options;
}

/**
 * Erstellt vollständige Firebase-URL
 * @param {string} path - API-Pfad
 * @returns {string} Vollständige URL
 */
function createFirebaseUrl(path) {
  return `${FIREBASE_DATABASE_BASE_URL}${path}.json`;
}

/**
 * Verarbeitet Firebase-Response
 * @param {Response} response - Fetch Response
 * @returns {Promise<Object>} Verarbeitete Antwort
 */
async function processResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} – ${JSON.stringify(data)}`);
  }

  return {
    status: response.status,
    data: data ?? {}
  };
}

/**
 * Firebase HTTP-Request Handler
 * @param {string} method - HTTP-Methode (GET, POST, PUT, DELETE, PATCH)
 * @param {string} path - API-Pfad
 * @param {Object} data - Request-Daten
 * @returns {Promise<Object>} Firebase Response
 */
export async function requestData(method = "GET", path = "", data = {}) {
  const url = createFirebaseUrl(path);
  const options = createRequestOptions(method, data);
  const response = await fetch(url, options);
  return processResponse(response);
}