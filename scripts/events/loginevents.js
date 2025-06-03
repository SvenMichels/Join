import { loginUser, loginAsGuest } from "../auth/login.js";

export function loginListeners() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return console.warn("loginForm not found");
  document.querySelector(".logIn").addEventListener("click", async () => {
    const email = document.querySelector("#loginEmail").value.trim();
    const password = document.querySelector("#loginPassword").value.trim();

    try {
      const user = await loginUser(email, password);
      alert(`Willkommen zurück, ${user.name || "User"}!`);
      // window.location.href = "/board.html";
    } catch (err) {
      alert(err.message);
    }
  });

  document.querySelector(".guestLogIn").addEventListener("click", async () => {
    try {
      const guest = await loginAsGuest();
      alert(`Eingeloggt als Gast: ${guest.name || "Testuser"}`);
      // window.location.href = "/board.html";
    } catch (err) {
      alert(err.message);
    }
  });
}

export async function signupListeners() {
  const form = document.getElementById("signUpForm");

  if (!form) return console.warn("signUpForm not found");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("Submit triggered");
    await getNewUserInput();
  });

  const checkBox = document.getElementById("checkBox");
  const signUpBtn = document.getElementById("signUpBtn");
  if (checkBox && signUpBtn) {
    checkBox.addEventListener("change", () => {
      signUpBtn.disabled = !checkBox.checked;
    });
  }
}
