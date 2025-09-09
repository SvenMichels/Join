import { bindPrivacyCheckbox, bindPolicyLinks, bindSignupForm } from "../scripts/events/loginevents.js";
import { generateRandomColorClass } from "../scripts/utils/colors.js";
import { getInitials } from "../scripts/utils/helpers.js";
import { initInputField, confirmInputForFormValidation, showValidateBubble, setFieldValidity, hideValidateBubble } from "../scripts/auth/Validation.js";


let signUpSubmitButton;
let privacyPolicyCheckbox;

if (window.location.pathname.endsWith("signup.html")) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSignup);
  } else {
    initSignup();
  }
}

function initSignup() {
  cacheDom();
  initFields();
  signupListeners();
  checkFormValidity();
}

function cacheDom() {
  signUpSubmitButton = document.getElementById("signUpBtn");
  privacyPolicyCheckbox = document.getElementById("checkBox");
}

function initFields() {
  initInputField("inputName", "nameHint", "name");
  initInputField("inputEmail", "emailHint", "email");
  initInputField("inputPassword", "pwHint", "password");
  initInputField("inputConfirmPassword", "pwCheckHint", "password");

  ["inputName", "inputEmail", "inputPassword", "inputConfirmPassword"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", checkFormValidity);
  });
  privacyPolicyCheckbox?.addEventListener("change", checkFormValidity);
}

export async function signupListeners() {
  const form = document.getElementById("signUpForm");
  if (!form) return;

  bindSignupForm(form);

  togglePassword("inputPassword", "togglePasswordIcon");
  togglePassword("inputConfirmPassword", "toggleConfirmPasswordIcon");

  bindPrivacyCheckbox();
  bindPolicyLinks();
  checkFormValidity();
}

export function togglePassword(inputId, iconId) {
  const hiddenPassword = document.getElementById(inputId);
  const toggleHiddenIcon = document.getElementById(iconId);
  if (!hiddenPassword || !toggleHiddenIcon) return;

  if (toggleHiddenIcon.dataset.toggleBound === "true") return;
  hiddenPassword.type = "password";
  toggleHiddenIcon.style.cursor = "pointer";

  toggleHiddenIcon.addEventListener("click", (e) => {
    hidePasswordType(e, hiddenPassword, toggleHiddenIcon);
  });
  toggleHiddenIcon.dataset.toggleBound = "true";
}

function hidePasswordType(e, hiddenPassword, toggleHiddenIcon) {
  e.preventDefault();
  const hidden = hiddenPassword.type === "password";
  hiddenPassword.type = hidden ? "text" : "password";
  toggleHiddenIcon.src = hidden
    ? "../assets/icons/visibility.svg"
    : "../assets/icons/visibility_off.svg";
}

export async function handleSignupSubmission(event) {
  event?.preventDefault();
  if (signUpSubmitButton?.disabled) return;
  if (!privacyPolicyCheckbox?.checked) return;

  const userData = await collectUserInput();
  if (!userData) return;

  await submitUser();
}

export async function collectUserInput() {
  const userFullName = getTrimmedInputValue("inputName");
  const userEmail = getTrimmedInputValue("inputEmail");
  const userPassword = document.getElementById("inputPassword")?.value || "";
  const userColor = generateRandomColorClass();

  return {
    userFullName,
    userEmailAddress: userEmail,
    userPassword,
    userPhoneNumber: "",
    userColor,
    userInitials: getInitials(userFullName),
    firstCharachter: getFirstCharacter(userFullName)
  };
}

export function getTrimmedInputValue(id) {
  return document.getElementById(id)?.value.trim() || "";
}

export function getFirstCharacter(name) {
  return name ? name.charAt(0).toUpperCase() : "?";
}

export async function submitUser() {
  const feedback = document.getElementById("userFeedback");
  if (!feedback) return;

  feedback.classList.remove("dp-none");
  feedback.classList.add("centerFeedback");
  feedback.addEventListener("animationend", () => {
    setTimeout(() => {
      feedback.classList.add("dp-none");
      feedback.classList.remove("centerFeedback");
      window.location.href = "../index.html";
    }, 1500);
  }, { once: true });
}

function getFormValidationInputs() {
  const isNameValid = confirmInputForFormValidation("inputName", "nameHint");
  const isEmailValid = confirmInputForFormValidation("inputEmail", "emailHint");
  const isPasswordValid = confirmInputForFormValidation("inputPassword", "pwHint");
  const isPasswordConfirmValid = confirmInputForFormValidation("inputConfirmPassword", "pwCheckHint");
  const isPrivacyChecked = privacyPolicyCheckbox?.checked || false;
  const passwordValue = document.getElementById("inputPassword")?.value || "";
  const passwordConfirmValue = document.getElementById("inputConfirmPassword")?.value || "";
  return {
    isNameValid,
    isEmailValid,
    isPasswordValid,
    isPasswordConfirmValid,
    isPrivacyChecked,
    passwordValue,
    passwordConfirmValue
  };
}

function getFormValidation() {
  const { isNameValid, isEmailValid, isPasswordValid, isPasswordConfirmValid, isPrivacyChecked, passwordValue, passwordConfirmValue } = getFormValidationInputs();
  const doPasswordsMatch = checkPasswordForMatch("pwCheckHint", passwordValue, passwordConfirmValue, isPrivacyChecked);
  return {
    isNameValid,
    isEmailValid,
    isPasswordValid,
    isPasswordConfirmValid,
    isPrivacyChecked,
    doPasswordsMatch
  };
}

function updateSubmitButton(isFormValid) {
  if (!signUpSubmitButton) return;
  signUpSubmitButton.disabled = !isFormValid;
  signUpSubmitButton.style.backgroundColor = "#2a3647";
  signUpSubmitButton.style.opacity = isFormValid ? "1" : "0.5";
  signUpSubmitButton.style.cursor = isFormValid ? "pointer" : "not-allowed";
}

export function checkFormValidity() {
  const state = getFormValidation();
  const isFormValid =
    state.isNameValid &&
    state.isEmailValid &&
    state.isPasswordValid &&
    state.isPasswordConfirmValid &&
    state.doPasswordsMatch &&
    state.isPrivacyChecked;

  updateSubmitButton(isFormValid);
  return isFormValid;
}

function getPasswordElements() {
  return {
    passwordEl: document.getElementById("inputPassword"),
    confirmEl: document.getElementById("inputConfirmPassword"),
  };
}

function handleTooShort(isPrivacyChecked, bubbleId, confirmEl) {
  setFieldValidity("inputConfirmPassword", false);
  if (!isPrivacyChecked && confirmEl) {
    showValidateBubble("inputConfirmPassword", "Passwords must be at least 6 chars", bubbleId, 2000);
    setFieldClass(confirmEl, false);
  } else {
    hideValidateBubble(bubbleId);
  }
  return false;
}

function applyPrivacyCheckedUI(passwordEl, confirmEl, match, bubbleId) {
  hideValidateBubble(bubbleId);
  setFieldClass(passwordEl, true);
  setFieldClass(confirmEl, match);
  return match;
}

function showMatchFlow(passwordEl, confirmEl, bubbleId) {
  showValidateBubble("inputConfirmPassword", "Password Matches", bubbleId, 3000);
  setFieldClass(passwordEl, true);
  setFieldClass(confirmEl, true);
}

function showMismatchFlow(passwordEl, confirmEl, bubbleId) {
  showValidateBubble("inputConfirmPassword", "Passwords do not match", bubbleId, 3000);
  setFieldClass(passwordEl, true);
  setFieldClass(confirmEl, false);
}

function checkPasswordForMatch(bubbleId, passwordValue, passwordConfirmValue, isPrivacyChecked) {
  const { passwordEl, confirmEl } = getPasswordElements();
  const okLength = passwordValue.length >= 6 && passwordConfirmValue.length >= 6;
  if (!okLength) {
    return handleTooShort(isPrivacyChecked, bubbleId, confirmEl);
  }
  const match = passwordValue === passwordConfirmValue;
  setFieldValidity("inputConfirmPassword", match);
  if (isPrivacyChecked) {
    return applyPrivacyCheckedUI(passwordEl, confirmEl, match, bubbleId);
  }
  if (match) {
    showMatchFlow(passwordEl, confirmEl, bubbleId);
  } else {
    showMismatchFlow(passwordEl, confirmEl, bubbleId);
  }
  return match;
}


function setFieldClass(el, isValid) {
  if (!el) return;
  el.classList.toggle("validate-border-blue", !!isValid);
  el.classList.toggle("validate-border-red", !isValid);
}