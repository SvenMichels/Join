// Diese Datei enthält Funktionen zum Laden, Senden, Löschen und Aktualisieren von Daten in der Firebase-Datenbank.
// Sie verwendet die Fetch API, um HTTP-Anfragen an die Firebase-Datenbank zu senden.
// Diese Funktionen sind asynchron und geben Promises zurück, die die Antwort der Firebase-Datenbank enthalten.
// Diese Datei ist Teil des Projekts "Join DA" und wird in der Datei "index.js" importiert.

const BASE_URL =
  "https://join-da-project-default-rtdb.europe-west1.firebasedatabase.app/";

export async function loadData( ) {
  const response = await fetch(BASE_URL + path + ".json");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

export async function postData(path = "", data = {}) {
  const response = await fetch(BASE_URL + path + ".json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

export async function deleteData(path = "") {
  const response = await fetch(BASE_URL + path + ".json", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

export async function putData(path = "", data = {}) {
  const response = await fetch(BASE_URL + path + ".json", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

export async function requestData(method = "GET", path = "", data = {}) {
  const options = {method, headers: {"Content-Type": "application/json",}, };
  if (["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
    options.body = JSON.stringify(data);
  }
 
  await responseRequestData(options, path = "");
}

async function responseRequestData(options, path = "") {
  const response = await fetch(BASE_URL + path + ".json", options);
  const result = await response.json();

   if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  } 
 return { status: response.status, data: result };
} 