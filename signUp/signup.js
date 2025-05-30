const passwordInput = document.getElementById("inputPassword");
const confirmPasswordInput = document.getElementById("inputConfirmPassword");
const checkbox = document.getElementById("checkBox");
const signUpBtn = document.getElementById("signUpBtn");

const togglePasswordIcon = document.querySelector('#inputPassword + .toggle-password');
const toggleConfirmIcon = document.querySelector('#inputConfirmPassword + .toggle-password');

function validatePasswordsMatch() {
  if (passwordInput.value !== confirmPasswordInput.value) {
    confirmPasswordInput.setCustomValidity("Passwords do not match");
  } else {
    confirmPasswordInput.setCustomValidity("");
  }
}

passwordInput.addEventListener("input", validatePasswordsMatch);
confirmPasswordInput.addEventListener("input", validatePasswordsMatch);

checkbox.addEventListener("change", () => {
  signUpBtn.disabled = !checkbox.checked;
});

// Passwort anzeigen/verstecken
togglePasswordIcon.addEventListener('click', () => {
  const isHidden = passwordInput.type === 'password';
  passwordInput.type = isHidden ? 'text' : 'password';
  togglePasswordIcon.src = isHidden
    ? '../assets/icons/visibility_off.svg'
    : '../assets/icons/visibility.svg';
});

// Bestätigungspasswort anzeigen/verstecken
toggleConfirmIcon.addEventListener('click', () => {
  const isHidden = confirmPasswordInput.type === 'password';
  confirmPasswordInput.type = isHidden ? 'text' : 'password';
  toggleConfirmIcon.src = isHidden
    ? '../assets/icons/visibility_off.svg'
    : '../assets/icons/visibility.svg';
});
