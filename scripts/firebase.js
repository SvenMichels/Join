// Firebase configuration settings
const FIREBASE_DATABASE_BASE_URL =
  "https://join-da-project-default-rtdb.europe-west1.firebasedatabase.app/";

// Handle HTTP requests to Firebase database
export async function requestData(httpMethod = "GET", requestPath = "", requestDataObject = {}) {
  const httpRequestOptions = {
    method: httpMethod.toUpperCase(),
    headers: { "Content-Type": "application/json" },
  };
  
  const methodsRequiringBody = ["POST", "PUT", "PATCH"];
  const shouldIncludeBody = methodsRequiringBody.includes(httpRequestOptions.method);
  
  if (shouldIncludeBody) {
    httpRequestOptions.body = JSON.stringify(requestDataObject);
  }

  const firebaseResponse = await fetch(`${FIREBASE_DATABASE_BASE_URL}${requestPath}.json`, httpRequestOptions);
  const responseResultData = await firebaseResponse.json();

  if (!firebaseResponse.ok) {
    throw new Error(`Request failed: ${firebaseResponse.status} – ${JSON.stringify(responseResultData)}`);
  }

  return { 
    status: firebaseResponse.status, 
    data: responseResultData ?? {} 
  };
}