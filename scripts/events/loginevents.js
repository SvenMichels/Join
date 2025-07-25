import { loginAsGuest, loginUser } from "../auth/login.js";
import { collectUserInput } from "../../signup/signup.js";
import { requestData } from "../firebase.js";

export async function loginListeners() {
  const loginFormElement = document.getElementById("loginForm");
  if (!loginFormElement) return;

  bindUserLoginButton();
  bindGuestLoginButton();
  bindPolicyLinks();
}

function bindUserLoginButton() {
  const loginButton = document.querySelector(".logIn");
  loginButton.addEventListener("click", handleUserLogin);
}

function bindGuestLoginButton() {
  const guestButton = document.querySelector(".button-guest-login");
  guestButton.addEventListener("click", handleGuestLogin);
}

async function handleUserLogin() {
  const loginFormElement = document.getElementById("loginForm");

  if (!loginFormElement) {
    console.warn("Login-Formular nicht gefunden!");
    return;
  }

  const credentials = collectLoginCredentials();
  if (!credentials.email || !credentials.password) {
    console.warn("Bitte geben Sie sowohl E-Mail als auch Passwort ein!");
    return;
  }

  if (!isValidEmail(credentials.email)) {
    console.warn("Bitte geben Sie eine gültige E-Mail-Adresse ein!");
    return;
  }
  await attemptUserLogin(credentials);
}

async function handleGuestLogin() {
  await loginAsGuest();
  redirectToStartpage();
}

function collectLoginCredentials() {
  return {
    email: document.querySelector("#loginEmail").value.trim(),
    password: document.querySelector("#loginPassword").value.trim(),
  };
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function attemptUserLogin(credentials) {
  await loginUser(credentials.email, credentials.password);
  redirectToStartpage();
}

function redirectToStartpage() {
  window.location.href = "../../startpage/startpage.html";
}

function bindPolicyLinks() {
  const policyLinks = getAllPolicyLinks();
  attachPolicyListeners(policyLinks);
}

function getAllPolicyLinks() {
  const linkSelectors = [
    'a[href$="privatpolicy.html"]',
    'a[href$="legalnotice.html"]',
  ];

  const combinedSelectors = linkSelectors.join(",");
  return document.querySelectorAll(combinedSelectors);
}

function attachPolicyListeners(policyLinks) {
  for (let linkIndex = 0; linkIndex < policyLinks.length; linkIndex++) {
    const currentLink = policyLinks[linkIndex];
    currentLink.addEventListener("click", (event) =>
      handlePolicyClick(event, currentLink)
    );
  }
}

async function handlePolicyClick(event, linkElement) {
  if (userNeedsAuthentication()) {
    event.preventDefault();
    await authenticateAndRedirect(linkElement.href);
  }
}

function userNeedsAuthentication() {
  return !localStorage.getItem("token");
}

async function authenticateAndRedirect(targetUrl) {
  await loginAsGuest();
  window.location.href = targetUrl;
}

export async function signupListeners() {
  const signupFormElement = document.getElementById("signUpForm");
  if (!signupFormElement) return;

  bindSignupForm(signupFormElement);
  bindPrivacyCheckbox();
  bindPolicyLinks();
}

function bindSignupForm(formElement) {
  formElement.addEventListener("submit", handleSignupSubmission);
}

function bindPrivacyCheckbox() {
  const checkbox = document.getElementById("checkBox");
  const submitButton = document.getElementById("signUpBtn");

  if (checkbox && submitButton) {
    checkbox.addEventListener("change", () =>
      toggleSubmitButton(checkbox, submitButton)
    );
  }
}

function toggleSubmitButton(checkbox, submitButton) {
  submitButton.disabled = !checkbox.checked;
}

async function handleSignupSubmission(event) {
  event.preventDefault();
  const userRegistrationData = await collectUserInput();
  requestData("POST", "/users/", userRegistrationData);
}
