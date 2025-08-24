import { loginAsGuest, loginUser } from "../auth/login.js";
import { collectUserInput, checkFormValidity } from "../../signup/signup.js";
import { requestData } from "../firebase.js";
import { validateLoginEmailInput, validateLoginPasswordInput } from "../auth/loginValidation.js";

/**
 * Initializes login event listeners.
 * Binds login form, guest login, and policy links.
 */
export async function loginListeners() {
  const loginFormElement = document.getElementById("loginForm");
  if (!loginFormElement) return;

  loginFormElement.addEventListener("submit", (event) => {
    event.preventDefault();
    handleUserLogin();
  });

  // Initialize validation and bindings
  bindLoginInputValidation();
  bindUserLoginButton();
  bindGuestLoginButton();
  bindPolicyLinks();
}

/**
 * Binds the standard user login button click event.
 */
function bindUserLoginButton() {
  const loginButton = getLoginButton();
  if (!loginButton) return;
  loginButton.addEventListener("click", handleUserLogin);
}

/**
 * Binds the guest login button click event.
 */
function bindGuestLoginButton() {
  const guestButton = document.querySelector(".button-guest-login");
  let isGuest = false;
  guestButton.addEventListener("click", () => handleUserLogin(isGuest = true));
}

/**
 * Handles user login submission including validation.
 */
async function handleUserLogin(isGuest = false) {
  if (isGuest == true) {
    const emailEl = "developer@akademie.de";
    const pwEl = "123";
    const credentials = { email: emailEl, password: pwEl }
    handleUser(credentials);
    return
  } else {
    const credentials = collectLoginCredentials();
    handleUser(credentials);
  }
}

async function handleUser(credentials) {
  const loginBtn = document.querySelector(".btn");

  // Vor Login: Validierung anstoßen (Fehlertext anzeigen)
  validateLoginEmailInput(document.querySelector("#loginEmail"));
  validateLoginPasswordInput(document.querySelector("#loginPassword"));

  const emailOk = !!credentials.email && isValidEmail(credentials.email);
  const pwdOk = !!credentials.password && credentials.password.length >= 3 && !credentials.password.startsWith(" ");

  if (!emailOk || !pwdOk) {
    disableButton(loginBtn);
    return;
  }

  enableButton(loginBtn);
  await attemptUserLogin(credentials);
}

function enableButton(btn) {
  if (!btn) return;
  btn.disabled = false;
  btn.classList.remove("disabled");
  btn.classList.add("background-color");
  btn.style.backgroundColor = "";
}

function disableButton(btn) {
  if (!btn) return;
  btn.disabled = true;
  btn.classList.add("disabled");
  btn.classList.remove("background-color");
  btn.style.backgroundColor = "#ccc";
}

/**
 * Collects login credentials from input fields.
 * 
 * @returns {{ email: string, password: string }}
 */
function collectLoginCredentials() {
  const emailEl = document.querySelector("#loginEmail");
  const pwEl = document.querySelector("#loginPassword");
  return {
    email: emailEl ? emailEl.value.trim() : "",
    password: pwEl ? pwEl.value.trim() : "",
  };
}

/**
 * Returns the login button element used for enabling/disabling.
 */
function getLoginButton() {
  return document.querySelector(".logIn") || document.querySelector(".btn") || null;
}

/**
 * Binds input listeners for login email/password and updates the login button state.
 */
function bindLoginInputValidation() {
  const [email, password] = ["#loginEmail", "#loginPassword"].map(s => document.querySelector(s));
  const btn = getLoginButton();

  const update = () => {
    // Zeige Fehlermeldungen live an
    validateLoginEmailInput(email);
    validateLoginPasswordInput(password);

    const clearEmail = email?.value.trim() || "";
    const clearPwd = password?.value.trim() || "";
    const isPwdOk = clearPwd.length >= 3 && !clearPwd.startsWith(" ");

    (clearEmail && clearPwd && isValidEmail(clearEmail) && isPwdOk)
      ? enableButton(btn)
      : disableButton(btn);
  };

  [email, password].forEach(i => i && i.addEventListener("input", update));
  update();
}

/**
 * Validates email format using regex.
 * 
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(de|com|net|nl|org|uk|cn|au|dk|pl|cz|at|lu|ru)$/;
  return emailRegex.test(email);
}

export function isValidPhoneNumber(phone) {
  const phoneRegex = /^(?:\+49)?[0-9]{0,}$/;
  return phoneRegex.test(phone);
}

/**
 * Attempts to log in the user and redirects on success.
 * 
 * @param {{ email: string, password: string }} credentials
 */
async function attemptUserLogin(credentials) {
  try {
    await loginUser(credentials.email, credentials.password);
    redirectToStartpage();
  } catch (error) {
    console.warn("Login attempt failed:", error.message);
  }
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
export function bindPolicyLinks() {
  const policyLinks = getAllPolicyLinks();
  attachPolicyListeners(policyLinks);
}

/**
 * Selects all policy-related anchor elements.
 * 
 * @returns {NodeListOf<HTMLAnchorElement>}
 */
export function getAllPolicyLinks() {
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
  await loginUser();
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
export function bindSignupForm(formElement) {
  formElement.addEventListener("submit", handleSignupSubmission);
}

/**
 * Binds change event to privacy checkbox to enable/disable signup button.
 */
export function bindPrivacyCheckbox() {
  const checkbox = document.getElementById("checkBox");
  const submitButton = document.getElementById("signUpBtn");
  if (checkbox && submitButton) {
    checkbox.addEventListener("change", () => {
      checkFormValidity();
    });                                                                                      
  }
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

export function loginFailFeedback() {
  return new Promise((resolve) => {
    const LoginFeedback = document.getElementById("failLoginFeedback");
    if (!LoginFeedback) return resolve();

    LoginFeedback.classList.remove("dp-none");
    LoginFeedback.classList.add("centerFeedback");

    LoginFeedback.addEventListener(
      "animationend",
      () => {
        setTimeout(() => {
          LoginFeedback.classList.add("dp-none");
          LoginFeedback.classList.remove("centerFeedback");
          resolve();
        }, 1500);
      }, { once: true });
  });
}
