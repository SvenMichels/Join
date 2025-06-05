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

function validatePasswordsMatch() {
  if (passwordInput.value !== confirmPasswordInput.value) {
    confirmPasswordInput.setCustomValidity("Passwords do not match");
  } else {
    confirmPasswordInput.setCustomValidity("");
  }
}

// Event-Listener für die Passwortüberprüfung
function passwordListener() {
  passwordInput.addEventListener("input", validatePasswordsMatch);
  confirmPasswordInput.addEventListener("input", validatePasswordsMatch);

  checkbox.addEventListener("change", () => {
    signUpBtn.disabled = !checkbox.checked;
  });
}

function togglePasswordVisibility(input, icon) {
    // Passwort anzeigen/verstecken
togglePasswordIcon.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  togglePasswordIcon.src = isHidden
    ? "../assets/icons/visibility_off.svg"
    : "../assets/icons/visibility.svg";
});

// Bestätigungspasswort anzeigen/verstecken
toggleConfirmIcon.addEventListener("click", () => {
  const isHidden = confirmPasswordInput.type === "password";
  confirmPasswordInput.type = isHidden ? "text" : "password";
  toggleConfirmIcon.src = isHidden
    ? "../assets/icons/visibility_off.svg"
    : "../assets/icons/visibility.svg";
});
}

export async function getNewUserInput() {
  const inputName = document.getElementById("inputName").value.trim();
  const inputEmail = document.getElementById("inputEmail").value.trim();
  const inputPassword = document.getElementById("inputPassword").value;
  const inputConfirmPassword = document.getElementById(
    "inputConfirmPassword"
  ).value;

  if (inputPassword !== inputConfirmPassword) {
    // alert("Passwords do not match");
    return;
  }

  const userData = {
    userName: inputName,
    userEmail: inputEmail,
    password: inputPassword,
  };

  try {
    const userId = await createUser(userData);
    // alert("User created with ID: " + userId);
  } catch (error) {
    console.error("User creation failed", error);
    alert("Registration failed. Please try again.");
  }
}
