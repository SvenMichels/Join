import { loginAsGuest, loginUser } from "../auth/login.js";
import { collectUserInput } from "../../signup/signup.js";
import { requestData } from "../firebase.js";

/**
 * Initializes login event listeners.
 * Binds login form, guest login, and policy links.
 */
export async function loginListeners() {
  const loginFormElement = document.getElementById("loginForm");
  if (!loginFormElement) return;

  bindUserLoginButton();
  bindGuestLoginButton();
  bindPolicyLinks();
}

/**
 * Binds the standard user login button click event.
 */
function bindUserLoginButton() {
  const loginButton = document.querySelector(".logIn");
  loginButton.addEventListener("click", handleUserLogin);
}

/**
 * Binds the guest login button click event.
 */
function bindGuestLoginButton() {
  const guestButton = document.querySelector(".button-guest-login");
  guestButton.addEventListener("click", handleGuestLogin);
}

/**
 * Handles user login submission including validation.
 */
async function handleUserLogin() {
  const loginFormElement = document.getElementById("loginForm");

  if (!loginFormElement) {
    console.warn("Login form not found!");
    return;
  }

  const credentials = collectLoginCredentials();
  if (!credentials.email || !credentials.password) {
    console.warn("Please enter both email and password!");
    return;
  }

  if (!isValidEmail(credentials.email)) {
    console.warn("Please enter a valid email address!");
    return;
  }

  await attemptUserLogin(credentials);
}

/**
 * Handles guest login flow.
 */
async function handleGuestLogin() {
  await loginAsGuest();
  redirectToStartpage();
}

/**
 * Collects login credentials from input fields.
 * 
 * @returns {{ email: string, password: string }}
 */
function collectLoginCredentials() {
  return {
    email: document.querySelector("#loginEmail").value.trim(),
    password: document.querySelector("#loginPassword").value.trim(),
  };
}

/**
 * Validates email format using regex.
 * 
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Attempts to log in the user and redirects on success.
 * 
 * @param {{ email: string, password: string }} credentials
 */
async function attemptUserLogin(credentials) {
  await loginUser(credentials.email, credentials.password);
  redirectToStartpage();
}

/**
 * Redirects to the application start page.
 */
function redirectToStartpage() {
  window.location.href = "../../startpage/startpage.html";
}

/**
 * Binds listeners for policy and legal notice links.
 */
function bindPolicyLinks() {
  const policyLinks = getAllPolicyLinks();
  attachPolicyListeners(policyLinks);
}

/**
 * Selects all policy-related anchor elements.
 * 
 * @returns {NodeListOf<HTMLAnchorElement>}
 */
function getAllPolicyLinks() {
  const linkSelectors = [
    'a[href$="privatpolicy.html"]',
    'a[href$="legalnotice.html"]',
  ];

  const combinedSelectors = linkSelectors.join(",");
  return document.querySelectorAll(combinedSelectors);
}

/**
 * Attaches click handlers to policy links.
 * 
 * @param {NodeListOf<HTMLAnchorElement>} policyLinks
 */
function attachPolicyListeners(policyLinks) {
  for (let linkIndex = 0; linkIndex < policyLinks.length; linkIndex++) {
    const currentLink = policyLinks[linkIndex];
    currentLink.addEventListener("click", (event) =>
      handlePolicyClick(event, currentLink)
    );
  }
}

/**
 * Handles click on protected policy links.
 * If user is not authenticated, log in as guest.
 * 
 * @param {MouseEvent} event
 * @param {HTMLAnchorElement} linkElement
 */
async function handlePolicyClick(event, linkElement) {
  if (userNeedsAuthentication()) {
    event.preventDefault();
    await authenticateAndRedirect(linkElement.href);
  }
}

/**
 * Checks whether user is authenticated.
 * 
 * @returns {boolean}
 */
function userNeedsAuthentication() {
  return !localStorage.getItem("token");
}

/**
 * Authenticates as guest and redirects to requested page.
 * 
 * @param {string} targetUrl
 */
async function authenticateAndRedirect(targetUrl) {
  await loginAsGuest();
  window.location.href = targetUrl;
}

/**
 * Initializes event listeners for signup form.
 */
export async function signupListeners() {
  const signupFormElement = document.getElementById("signUpForm");
  if (!signupFormElement) return;

  bindSignupForm(signupFormElement);
  bindPrivacyCheckbox();
  bindPolicyLinks();
}

/**
 * Binds submit event to signup form.
 * 
 * @param {HTMLFormElement} formElement
 */
function bindSignupForm(formElement) {
  formElement.addEventListener("submit", handleSignupSubmission);
}

/**
 * Binds change event to privacy checkbox to enable/disable signup button.
 */
function bindPrivacyCheckbox() {
  const checkbox = document.getElementById("checkBox");
  const submitButton = document.getElementById("signUpBtn");

  if (checkbox && submitButton) {
    checkbox.addEventListener("change", () =>
      toggleSubmitButton(checkbox, submitButton)
    );
  }
}

/**
 * Enables or disables the signup button based on checkbox state.
 * 
 * @param {HTMLInputElement} checkbox
 * @param {HTMLButtonElement} submitButton
 */
function toggleSubmitButton(checkbox, submitButton) {
  submitButton.disabled = !checkbox.checked;
}

/**
 * Handles signup form submission.
 * 
 * @param {SubmitEvent} event
 */
async function handleSignupSubmission(event) {
  event.preventDefault();
  const userRegistrationData = await collectUserInput();
  requestData("POST", "/users/", userRegistrationData);
}
