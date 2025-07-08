const BASE_URL =
  "https://join-da-project-default-rtdb.europe-west1.firebasedatabase.app/";

export async function requestData(method = "GET", path = "", data = {}) {
  const options = {
    method: method.toUpperCase(),
    headers: { "Content-Type": "application/json" },
  };
  if (["POST", "PUT", "PATCH"].includes(options.method)) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${BASE_URL}${path}.json`, options);
  const result   = await response.json();

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} – ${JSON.stringify(result)}`);
  }

  return { status: response.status, data: result ?? {} };
}