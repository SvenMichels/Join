import { loginAsGuest, loginUser } from "../auth/login.js";
import { collectUserInput } from "../../signup/signup.js";
import { requestData } from "../firebase.js";

export async function loginListeners() {
  const loginFormElement = document.getElementById("loginForm");
  if (!loginFormElement) return;

  document.querySelector(".logIn").addEventListener("click", async () => {
    loginListenersTry();
  });

  async function loginListenersTry() {
    const emailAddress = document.querySelector("#loginEmail").value.trim();
    const userPassword = document.querySelector("#loginPassword").value.trim();

    try {
      await loginUser(emailAddress, userPassword);
      window.location.href = "../../startpage/startpage.html";
    } catch (errorMessage) {
      // Handle login error silently
    }
  }

  document.querySelector(".guestLogIn").addEventListener("click", async () => {
    try {
      await loginAsGuest();
      window.location.href = "../../startpage/startpage.html";
    } catch (errorMessage) {
      // Handle guest login error silently
    }
  });
  bindPolicyLinks();
}

function bindPolicyLinks() {
  const linkSelectorsList = [
    'a[href$="privatpolicy.html"]',
    'a[href$="legalnotice.html"]',
  ];

  const combinedSelectors = linkSelectorsList.join(",");
  const allPolicyLinks = document.querySelectorAll(combinedSelectors);

  for (let linkIndex = 0; linkIndex < allPolicyLinks.length; linkIndex++) {
    const currentPolicyLink = allPolicyLinks[linkIndex];
    currentPolicyLink.addEventListener("click", async (event) => {
      if (!localStorage.getItem("token")) {
        event.preventDefault();
        await loginAsGuest();
        window.location.href = currentPolicyLink.href;
      }
    });
  }
}

export async function signupListeners() {
  const signupFormElement = document.getElementById("signUpForm");
  if (!signupFormElement) return

  formEventListener(signupFormElement);

  const privacyPolicyCheckbox = document.getElementById("checkBox");
  const signUpSubmitButton = document.getElementById("signUpBtn");
  if (privacyPolicyCheckbox && signUpSubmitButton) {
    privacyPolicyCheckbox.addEventListener("change", () => {
      signUpSubmitButton.disabled = !privacyPolicyCheckbox.checked;
    });
  }
  bindPolicyLinks();
}

function formEventListener(signupFormElement) {
  signupFormElement.addEventListener("submit", async (event) => {
    event.preventDefault();
    const userRegistrationData = await collectUserInput();
    requestData("POST", "/users/", userRegistrationData);
  });
}
