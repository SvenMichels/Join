import { requestData } from "../firebase.js";

export async function loginUser(email, password) {
  try {
    const response = await requestData("GET", "/users");
    const users = response.data;
      console.log("User logged in:", users);
    // Durch alle Nutzer iterieren und vergleichen
    for (const id in users) {
      const user = users[id];
      if (user.userEmail === email) {
        if (user.password === password) {
          console.log("Login erfolgreich:", user);
          return user;
        } else {
          throw new Error("Falsches Passwort");
        }
      }
    }

    // Kein Benutzer mit passender E-Mail gefunden
    throw new Error("E-Mail nicht registriert");
  } catch (error) {
    console.warn("Login fehlgeschlagen:", error.message);
    throw error;
  }
}

export async function loginAsGuest() {
  try {
    const response = await requestData("GET", "/users");
    const users = response.data;

    for (const id in users) {
      const user = users[id];
      if (user.userEmail === "test@guest.com") {
        console.log("Guest login erfolgreich:", user);
        return user;
      }
    }

    throw new Error("Guest-Account nicht gefunden");
  } catch (error) {
    console.error("Guest login fehlgeschlagen:", error.message);
    throw error;
  }
}