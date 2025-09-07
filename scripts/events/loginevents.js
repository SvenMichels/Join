import { loginUser } from "../auth/login.js";
import { collectUserInput, checkFormValidity, submitUser } from "../../signup/signup.js";
import { requestData } from "../firebase.js";

import { initInputField } from "../auth/Validation.js";



initInputField("loginEmail", "emailHint", "email");
initInputField("loginPassword", "pwHint", "password");
togglePassword('loginPassword', "togglePasswordIcon");

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

export function togglePassword(elementId, iconId) {
  const pw = document.getElementById(elementId);
  pw.setAttribute('type', 'password');
  document.getElementById(iconId).addEventListener('click', () => {
    pw.type = pw.type === 'password' ? 'text' : 'password';
    pw.nextElementSibling.src = pw.type === 'password' ? './assets/icons/lock.svg' : '../../assets/icons/visibility_off.svg';
  })
};

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
    const pwEl = "123456";
    const credentials = { email: emailEl, password: pwEl }
    handleUser(credentials);
    return
  } else {
    const credentials = collectLoginCredentials();
    handleUser(credentials);
  }
}

export function getFormValidation() {
  const isEmailValid = confirmInputForFormValidation('inputEmail', 'emailHint');
  const isPasswordValid = confirmInputForFormValidation('inputPassword', 'pwHint');

  const passwordValue = document.getElementById('inputPassword')?.value;
  const emailValue = document.getElementById('inputEmail')?.value;
  if (passwordValue && emailValue) return isEmailValid, isPasswordValid;
}

async function handleUser(credentials) {
  const loginBtn = document.querySelector(".btn");
  let emailOk = credentials.email;
  let pwdOk = credentials.password;

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
  const passwordValue = document.getElementById('loginPassword')?.value;
  const emailValue = document.getElementById('loginEmail')?.value;
  return {
    email: emailValue,
    password: passwordValue,
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
function grabAllInputToCheck() {
  const credentials = collectLoginCredentials();
  const loginEmailHint = document.getElementById("emailHint");
  const loginPasswordHint = document.getElementById("pwHint");
  let validateOkay = false;
  if (loginEmailHint.innerText === "Looks good!" && loginPasswordHint.innerText === "Looks good!") {
    return validateOkay = true;
  }
  if (credentials.email.length <= 0) return;
  const loginEmail = credentials.email;
  const loginPassword = credentials.password;

  return loginEmail, loginPassword, validateOkay;
}

function bindLoginInputValidation() {
  const btn = getLoginButton();
  if (!btn) return;

  const update = () => {
    let validateOkay = grabAllInputToCheck();
    (loginEmail && loginPassword && validateOkay)
      ? enableButton(btn)
      : disableButton(btn);
  };

  [loginEmail, loginPassword].forEach(input => input && input.addEventListener("input", update));
  update();
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
  if (checkbox) {
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
  submitUser();
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
