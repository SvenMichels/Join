import { createUser } from "../scripts/users/users.js";

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
}

document.addEventListener("DOMContentLoaded", () => {
  const signUpBtn = document.getElementById("signUpBtn");
  if (!signUpBtn) {
    return;
  }
  signUpBtn.addEventListener("click", showUserFeedback);
});

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

    await submitUser(userData);
  });
}

export async function collectUserInput() {
  const userName = document.getElementById("inputName").value.trim();
  const userEmail = document.getElementById("inputEmail").value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  console.log("TEst");

  if (!userName || !userEmail) {
    alert("Name and email are required");
    return null;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return null;
  }

  return { userName, userEmail, password };
}

async function submitUser(userData) {
  try {
    await createUser(userData);
  } catch (error) {
    console.error("User creation failed", error);
    alert("Registration failed. Please try again.");
  }
}

function showUserFeedback() {
  const feedback = document.getElementById("userFeedback");
  if (!feedback) return;

  feedback.classList.remove("dp-none");
  feedback.classList.add("centerFeedback");

  feedback.addEventListener("animationend", () => {
    setTimeout(() => {
      feedback.classList.add("dp-none");
      feedback.classList.remove("centerFeedback");
    }, 1500);
  });
}
