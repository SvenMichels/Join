/**
 * @fileoverview Firebase configuration and HTTP request utilities.
 */

// Firebase Database Base URL
export const FIREBASE_DATABASE_BASE_URL =
  "https://join-da-project-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Creates HTTP request options for fetch calls.
 *
 * @param {string} method - The HTTP method (GET, POST, PUT, PATCH, DELETE).
 * @param {Object} data - The request payload (for methods that require it).
 * @returns {Object} The fetch options object.
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
 * Builds a full Firebase REST endpoint URL.
 *
 * @param {string} path - The path segment to append to the Firebase base URL.
 * @returns {string} The full Firebase request URL.
 */
function createFirebaseUrl(path) {
  return `${FIREBASE_DATABASE_BASE_URL}${path}.json`;
}

/**
 * Processes a fetch response from Firebase.
 *
 * @param {Response} response - The raw response from the fetch call.
 * @returns {Promise<Object>} The processed response including status and data.
 * @throws Will throw an error if the response is not OK.
 */
async function processResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} – ${JSON.stringify(data)}`);
  }

  return {
    status: response.status,
    data: data ?? {},
  };
}

/**
 * Performs an HTTP request to the Firebase Realtime Database.
 *
 * @param {string} [method="GET"] - The HTTP method to use.
 * @param {string} [path=""] - The relative database path.
 * @param {Object} [data={}] - The request payload for methods with a body.
 * @returns {Promise<Object>} The processed Firebase response.
 */
export async function requestData(method = "GET", path = "", data = {}) {
  const url = createFirebaseUrl(path);
  const options = createRequestOptions(method, data);
  const response = await fetch(url, options);
  return processResponse(response);
}
