import { signupListeners } from "../scripts/events/loginevents.js"

const userPasswordInputField = document.getElementById("inputPassword");
const confirmPasswordInputField = document.getElementById("inputConfirmPassword");
const privacyPolicyCheckbox = document.getElementById("checkBox");
const signUpSubmitButton = document.getElementById("signUpBtn");
const passwordVisibilityToggleIcon = document.querySelector(
  "#inputPassword + .toggle-password"
);
const confirmPasswordVisibilityToggleIcon = document.querySelector(
  "#inputConfirmPassword + .toggle-password"
);

if (window.location.pathname.endsWith("signup.html")) {
  initializeSignupPageFunctionality();
  signupListeners();
}

function initializeSignupPageFunctionality() {
  setupPasswordMatchValidation();
  setupPasswordVisibilityToggle();
  setupSignupFormHandler();
}

function setupPasswordMatchValidation() {
  userPasswordInputField.addEventListener("input", validatePasswordsMatchCorrectly);
  confirmPasswordInputField.addEventListener("input", validatePasswordsMatchCorrectly);
}

function validatePasswordsMatchCorrectly() {
  const passwordsDoNotMatch = userPasswordInputField.value !== confirmPasswordInputField.value;
  confirmPasswordInputField.setCustomValidity(
    passwordsDoNotMatch ? "Passwords do not match" : ""
  );
}

function setupPasswordVisibilityToggle() {
  passwordVisibilityToggleIcon.addEventListener("click", () => {
    togglePasswordInputVisibility(userPasswordInputField, passwordVisibilityToggleIcon);
  });

  confirmPasswordVisibilityToggleIcon.addEventListener("click", () => {
    togglePasswordInputVisibility(confirmPasswordInputField, confirmPasswordVisibilityToggleIcon);
  });
}

function togglePasswordInputVisibility(passwordInputElement, visibilityToggleIcon) {
  const isCurrentlyHidden = passwordInputElement.type === "password";
  passwordInputElement.type = isCurrentlyHidden ? "text" : "password";
  visibilityToggleIcon.src = isCurrentlyHidden
    ? "../assets/icons/visibility_off.svg"
    : "../assets/icons/visibility.svg";
}

function setupSignupFormHandler() {
  signUpSubmitButton.addEventListener("click", async () => {
    if (!privacyPolicyCheckbox.checked) return;

    const userInputData = collectUserInput();
    if (!userInputData) return;

    await submitUser();
  });
}

export async function collectUserInput() {
  const userFullName = document.getElementById("inputName").value.trim();
  const emailAddress = document.getElementById("inputEmail").value.trim();
  const userPassword = userPasswordInputField.value;
  const confirmPassword = confirmPasswordInputField.value;

  return { userFullName, emailAddress, userPassword };
}

async function submitUser() {
  try {
    showUserFeedback()
  } catch (errorMessage) {
    console.warn("User creation failed", errorMessage);
  }
}

function showUserFeedback() {
  const feedbackDisplayElement = document.getElementById("userFeedback");
  if (!feedbackDisplayElement) return;

  feedbackDisplayElement.classList.remove("dp-none");
  feedbackDisplayElement.classList.add("centerFeedback");

  feedbackAnimationEnd(feedbackDisplayElement)
}

function feedbackAnimationEnd(feedbackDisplayElement) {
  feedbackDisplayElement.addEventListener("animationend", () => {
    setTimeout(() => {
      feedbackDisplayElement.classList.add("dp-none");
      feedbackDisplayElement.classList.remove("centerFeedback");
      window.location.href = "../index.html"
    }, 1500);
  });
}