import { loginUser } from "../auth/login.js";
import { collectUserInput, checkFormValidity, submitUser } from "../../signup/signup.js";
import { requestData } from "../firebase.js";

import { initInputField, showValidateBubble } from "../auth/Validation.js";



initInputField("loginEmail", "emailHint", "email");
initInputField("loginPassword", "pwHint", "password");

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
  togglePassword('loginPassword', "togglePasswordIcon");
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
  const icon = document.getElementById(iconId);

  pw.setAttribute('type', 'password');

  icon.addEventListener('click', () => {
    const isHidden = pw.type === 'password';
    pw.type = isHidden ? 'text' : 'password';
    icon.src = isHidden ? '../../assets/icons/visibility_off.svg' : './assets/icons/lock.svg';
  });
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

export function enableButton(btn) {
  if (!btn) return;
  btn.classList.remove("disabled");
  btn.classList.add("background-color");
  btn.style.backgroundColor = "";
}

export function disableButton(btn) {
  if (!btn) return;
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

function getLoginElements() {
  return {
    btn: getLoginButton(),
    emailInput: document.getElementById("loginEmail"),
    passwordInput: document.getElementById("loginPassword"),
  };
}

function areInputsValid(email, pwd) {
  return email.length >= 6 && pwd.length >= 6;
}

function handleEmailInput(emailInput, passwordInput, btn) {
  return () => {
    const email = emailInput.value?.trim() || "";
    const pwd = passwordInput.value?.trim() || "";

    if (email.length < 6 && email.length > 0) {
      showValidateBubble("loginEmail", "Use 6–64 characters.", "emailHint", 2000);
    }

    areInputsValid(email, pwd) ? enableButton(btn) : disableButton(btn);
  };
}

function handlePasswordInput(emailInput, passwordInput, btn) {
  return () => {
    const email = emailInput.value?.trim() || "";
    const pwd = passwordInput.value?.trim() || "";

    if (pwd.length < 6 && pwd.length > 0) {
      showValidateBubble("loginPassword", "Use 6–32 characters.", "pwHint", 2000);
    }

    areInputsValid(email, pwd) ? enableButton(btn) : disableButton(btn);
  };
}

function handleButtonClick(emailInput, passwordInput, btn) {
  return () => {
    const email = emailInput.value?.trim() || "";
    const pwd = passwordInput.value?.trim() || "";

    if (email.length === 0) {
      showValidateBubble("loginEmail", "Email is required.", "emailHint", 2000);
    }
    if (pwd.length === 0) {
      showValidateBubble("loginPassword", "Password is required.", "pwHint", 2000);
    }
    if (email.length === 0 && pwd.length === 0) {
      showValidateBubble("loginEmail", "Email is required.", "emailHint", 2000);
      showValidateBubble("loginPassword", "Password is required.", "pwHint", 2000);
    }

    areInputsValid(email, pwd) ? enableButton(btn) : disableButton(btn);
  };
}

function bindLoginInputValidation() {
  const { btn, emailInput, passwordInput } = getLoginElements();
  if (!btn || !emailInput || !passwordInput) return;

  const updateEmailListener = handleEmailInput(emailInput, passwordInput, btn);
  const updatePasswordListener = handlePasswordInput(emailInput, passwordInput, btn);
  const updateOnClick = handleButtonClick(emailInput, passwordInput, btn);

  btn.addEventListener("click", updateOnClick);
  emailInput.addEventListener("input", updateEmailListener);
  passwordInput.addEventListener("input", updatePasswordListener);

  updateEmailListener();
  updatePasswordListener();
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

document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("loginEmail");
  if (emailInput) {
    emailInput.setAttribute("autocomplete", "username");
  }

  const pwInput = document.getElementById("loginPassword");
  if (pwInput) {
    pwInput.setAttribute("autocomplete", "current-password");
  }
});