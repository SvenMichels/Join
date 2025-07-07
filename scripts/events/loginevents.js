import { loginAsGuest, loginUser } from "../auth/login.js";
import { collectUserInput } from "../../signUp/signup.js"
import { requestData } from "../firebase.js";

export async function loginListeners() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return console.log("loginForm not found");
  document.querySelector(".logIn").addEventListener("click", async () => {
    
   loginListenersTry();
  });

  async function loginListenersTry(){
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
      await loginAsGuest();
      window.location.href = "../../startpage/startpage.html";
    } catch (err) {
      console.log(`Guest login failed: ${err.message}`);
    }
  });
  bindPolicyLinks();
}

function bindPolicyLinks() {
  const selectors = [
    'a[href$="privatpolicy.html"]',
    'a[href$="legalnotice.html"]'
  ].join()
  const links = document.querySelectorAll(selectors)
  links.forEach(async link => {
    link.addEventListener("click", async event => {
      if (!localStorage.getItem("token")) {
        event.preventDefault()
        await loginAsGuest()
        window.location.href = link.href
      }
    })
  })
}

export async function signupListeners() {
  const form = document.getElementById("signUpForm");
  if (!form) return console.log("signUpForm not found");

 formEventListener();

  const checkBox = document.getElementById("checkBox");
  const signUpBtn = document.getElementById("signUpBtn");
  if (checkBox && signUpBtn) {
    checkBox.addEventListener("change", () => {
      signUpBtn.disabled = !checkBox.checked;
    });
  }
  bindPolicyLinks();
}

function formEventListener(){
   form.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("Submit triggered");
    const userdata = await collectUserInput();
  requestData("POST","/users/", userdata);
  });
}