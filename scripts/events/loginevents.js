import { loginAsGuest, loginUser } from "../auth/login.js";
import { collectUserInput } from "../../signup/signup.js";
import { requestData } from "../firebase.js";

export async function loginListeners() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return console.log("loginForm not found");
  document.querySelector(".logIn").addEventListener("click", async () => {
    const email = document.querySelector("#loginEmail").value.trim();
    const password = document.querySelector("#loginPassword").value.trim();

try {
  await loginUser(email, password);
  window.location.href = "../../startpage/startpage.html";
} catch (err) {
  console.warn(`Login failed: ${err.message}`);

}
  });

  document.querySelector(".guestLogIn").addEventListener("click", async () => {
    try {
      const guest = await loginAsGuest();
      window.location.href = "../../startpage/startpage.html";
    } catch (err) {
      console.log(`Guest login failed: ${err.message}`);
    }
  });
}

export async function signupListeners() {
  const form = document.getElementById("signUpForm");
  if (!form) return console.log("signUpForm not found");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("Submit triggered");
    const userdata = await collectUserInput();
  requestData("POST","/users/", userdata);
  });

  const checkBox = document.getElementById("checkBox");
  const signUpBtn = document.getElementById("signUpBtn");
  if (checkBox && signUpBtn) {
    checkBox.addEventListener("change", () => {
      signUpBtn.disabled = !checkBox.checked;
    });
  }
}