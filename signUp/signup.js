import { createUser } from "../scripts/users/users.js";
import { signupListeners } from "../scripts/events/loginevents.js"

const passwordInput = document.getElementById("inputPassword");
const confirmPasswordInput = document.getElementById("inputConfirmPassword");
const checkbox = document.getElementById("checkBox");
const signUpBtn = document.getElementById("signUpBtn");
const togglePasswordIcon = document.querySelector(
  "#inputPassword + .toggle-password"
);
const toggleConfirmIcon = document.querySelector(
  "#inputConfirmPassword + .toggle-password"
);

if (window.location.pathname.endsWith("signup.html")) {
  initSignup();
  signupListeners();
}

function initSignup() {
  setupPasswordValidation();
  setupPasswordToggle();
  setupSignupHandler();
}

function setupPasswordValidation() {
  passwordInput.addEventListener("input", validatePasswordsMatch);
  confirmPasswordInput.addEventListener("input", validatePasswordsMatch);
}

function validatePasswordsMatch() {
  const mismatch = passwordInput.value !== confirmPasswordInput.value;
  confirmPasswordInput.setCustomValidity(
    mismatch ? "Passwords do not match" : ""
  );
}

function setupPasswordToggle() {
  togglePasswordIcon.addEventListener("click", () => {
    toggleInputVisibility(passwordInput, togglePasswordIcon);
  });

  toggleConfirmIcon.addEventListener("click", () => {
    toggleInputVisibility(confirmPasswordInput, toggleConfirmIcon);
  });
}

function toggleInputVisibility(input, icon) {
  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";
  icon.src = isHidden
    ? "../assets/icons/visibility_off.svg"
    : "../assets/icons/visibility.svg";
}

function setupSignupHandler() {
  signUpBtn.addEventListener("click", async () => {
    if (!checkbox.checked) return;

    const userData = collectUserInput();
    if (!userData) return;

    await submitUser();
  });
}

export async function collectUserInput() {
  const userName = document.getElementById("inputName").value.trim();
  const userEmail = document.getElementById("inputEmail").value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  return { userName, userEmail, password };
}

async function submitUser() {
  try {
    showUserFeedback()
  } catch (error) {
    console.warn("User creation failed", error);
  }
}

function showUserFeedback() {
  const feedback = document.getElementById("userFeedback");
  if (!feedback) return;

  feedback.classList.remove("dp-none");
  feedback.classList.add("centerFeedback");

  feedbackAnimationEnd(feedback)
}

function feedbackAnimationEnd(feedback) {
  feedback.addEventListener("animationend", () => {
    setTimeout(() => {
      feedback.classList.add("dp-none");
      feedback.classList.remove("centerFeedback");
      window.location.href = "../index.html"
    }, 1500);
  });
}