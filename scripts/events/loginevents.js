import { loginUser } from "../auth/login.js";
import { collectUserInput, checkFormValidity, submitUser } from "../../signup/signup.js";
import { requestData } from "../firebase.js";

import { initInputField, showValidateBubble } from "../auth/Validation.js";



initInputField("loginEmail", "emailHint", "email");
initInputField("loginPassword", "pwHint", "password");

/**
 * Initializes login event listeners.
 * @description Binds login form, guest login, and policy links with validation
 * @returns {Promise<void>}
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
 * @description Attaches click event handler to the main login button
 * @returns {void}
 * @private
 */
function bindUserLoginButton() {
  const loginButton = getLoginButton();
  if (!loginButton) return;
  loginButton.addEventListener("click", handleUserLogin);
}

/**
 * Toggles password visibility with icon change.
 * @description Shows/hides password field content and updates the visibility icon
 * @param {string} elementId - ID of the password input element
 * @param {string} iconId - ID of the toggle icon element
 * @returns {void}
 */
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
 * @description Attaches click event handler for guest login functionality
 * @returns {void}
 * @private
 */
function bindGuestLoginButton() {
  const guestButton = document.querySelector(".button-guest-login");
  let isGuest = false;
  guestButton.addEventListener("click", () => handleUserLogin(isGuest = true));
}

/**
 * Handles user login submission including validation.
 * @description Processes login attempt for regular users or guest users
 * @param {boolean} [isGuest=false] - Whether this is a guest login attempt
 * @returns {Promise<void>}
 * @private
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

/**
 * Gets form validation state for email and password fields.
 * @description Validates email and password inputs for form submission
 * @returns {boolean|undefined} Validation state or undefined if fields are empty
 */
export function getFormValidation() {
  const isEmailValid = confirmInputForFormValidation('inputEmail', 'emailHint');
  const isPasswordValid = confirmInputForFormValidation('inputPassword', 'pwHint');


  const passwordValue = document.getElementById('inputPassword')?.value;
  const emailValue = document.getElementById('inputEmail')?.value;
  if (passwordValue && emailValue) return isEmailValid, isPasswordValid;
}

/**
 * Handles user authentication with provided credentials.
 * @description Validates credentials and attempts user login
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.email - User email address
 * @param {string} credentials.password - User password
 * @returns {Promise<void>}
 * @private
 */
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

/**
 * Enables a button by removing disabled state and restoring styling.
 * @description Activates button and restores normal appearance
 * @param {HTMLElement} btn - Button element to enable
 * @returns {void}
 */
export function enableButton(btn) {
  if (!btn) return;
  btn.classList.remove("disabled");
  btn.classList.add("background-color");
  btn.style.backgroundColor = "";
}

/**
 * Disables a button by adding disabled state and updating styling.
 * @description Deactivates button and applies disabled appearance
 * @param {HTMLElement} btn - Button element to disable
 * @returns {void}
 */
export function disableButton(btn) {
  if (!btn) return;
  btn.classList.add("disabled");
  btn.classList.remove("background-color");
  btn.style.backgroundColor = "#ccc";
}

/**
 * Collects login credentials from input fields.
 * @description Extracts email and password values from login form inputs
 * @returns {{ email: string, password: string }} Login credentials object
 * @private
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
 * @description Finds and returns the main login button element
 * @returns {HTMLElement|null} Login button element or null if not found
 * @private
 */
function getLoginButton() {
  return document.querySelector(".logIn") || document.querySelector(".btn") || null;
}

/**
 * Gets all login-related DOM elements.
 * @description Retrieves button and input elements needed for login functionality
 * @returns {Object} Object containing login form elements
 * @private
 */
function getLoginElements() {
  return {
    btn: getLoginButton(),
    emailInput: document.getElementById("loginEmail"),
    passwordInput: document.getElementById("loginPassword"),
  };
}

/**
 * Validates if email and password meet minimum length requirements.
 * @description Checks if both email and password have at least 6 characters
 * @param {string} email - Email value to validate
 * @param {string} pwd - Password value to validate
 * @returns {boolean} True if both inputs meet minimum requirements
 * @private
 */
function areInputsValid(email, pwd) {
  return email.length >= 6 && pwd.length >= 6;
}

/**
 * Creates email input event handler.
 * @description Returns function to handle email input validation and button state
 * @param {HTMLElement} emailInput - Email input element
 * @param {HTMLElement} passwordInput - Password input element
 * @param {HTMLElement} btn - Login button element
 * @returns {Function} Email input event handler
 * @private
 */
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

/**
 * Creates password input event handler.
 * @description Returns function to handle password input validation and button state
 * @param {HTMLElement} emailInput - Email input element
 * @param {HTMLElement} passwordInput - Password input element
 * @param {HTMLElement} btn - Login button element
 * @returns {Function} Password input event handler
 * @private
 */
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

/**
 * Creates button click event handler.
 * @description Returns function to handle login button click validation
 * @param {HTMLElement} emailInput - Email input element
 * @param {HTMLElement} passwordInput - Password input element
 * @param {HTMLElement} btn - Login button element
 * @returns {Function} Button click event handler
 * @private
 */
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

/**
 * Binds input validation listeners to login form elements.
 * @description Sets up real-time validation for email and password inputs
 * @returns {void}
 * @private
 */
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
 * @description Performs user authentication and handles success/failure
 * @param {{ email: string, password: string }} credentials - User login credentials
 * @returns {Promise<void>}
 * @private
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
 * @description Navigates user to the main application page after successful login
 * @returns {void}
 * @private
 */
function redirectToStartpage() {
  window.location.href = "../../startpage/startpage.html";
}

/**
 * Binds listeners for policy and legal notice links.
 * @description Sets up click handlers for privacy policy and legal notice links
 * @returns {void}
 */
export function bindPolicyLinks() {
  const policyLinks = getAllPolicyLinks();
  attachPolicyListeners(policyLinks);
}

/**
 * Selects all policy-related anchor elements.
 * @description Finds all links pointing to privacy policy and legal notice pages
 * @returns {NodeListOf<HTMLAnchorElement>} Collection of policy link elements
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
 * @description Adds authentication-aware click handlers to policy links
 * @param {NodeListOf<HTMLAnchorElement>} policyLinks - Collection of policy link elements
 * @returns {void}
 * @private
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
 * @description If user is not authenticated, log in as guest before accessing policy pages
 * @param {MouseEvent} event - Click event object
 * @param {HTMLAnchorElement} linkElement - Clicked link element
 * @returns {Promise<void>}
 * @private
 */
async function handlePolicyClick(event, linkElement) {
  if (userNeedsAuthentication()) {
    event.preventDefault();
    await authenticateAndRedirect(linkElement.href);
  }
}

/**
 * Checks whether user is authenticated.
 * @description Determines if user has valid authentication token
 * @returns {boolean} True if user needs authentication
 * @private
 */
function userNeedsAuthentication() {
  return !localStorage.getItem("token");
}

/**
 * Authenticates as guest and redirects to requested page.
 * @description Performs guest login and navigates to target URL
 * @param {string} targetUrl - URL to redirect to after authentication
 * @returns {Promise<void>}
 * @private
 */
async function authenticateAndRedirect(targetUrl) {
  await loginUser();
  window.location.href = targetUrl;
}

/**
 * Initializes event listeners for signup form.
 * @description Sets up signup form validation and submission handlers
 * @returns {Promise<void>}
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
 * @description Attaches form submission handler to signup form
 * @param {HTMLFormElement} formElement - Signup form element
 * @returns {void}
 */
export function bindSignupForm(formElement) {
  formElement.addEventListener("submit", handleSignupSubmission);
}

/**
 * Binds change event to privacy checkbox to enable/disable signup button.
 * @description Sets up privacy checkbox validation for signup form
 * @returns {void}
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
 * @description Processes user registration form data and submits to server
 * @param {SubmitEvent} event - Form submission event
 * @returns {Promise<void>}
 * @private
 */
async function handleSignupSubmission(event) {
  event.preventDefault();
  const userRegistrationData = await collectUserInput();
  requestData("POST", "/users/", userRegistrationData);
  submitUser();
}

/**
 * Shows login failure feedback animation.
 * @description Displays animated feedback message when login fails
 * @returns {Promise<void>} Promise that resolves when animation completes
 */
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