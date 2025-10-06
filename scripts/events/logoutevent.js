import { LocalStorageService } from "../utils/localStorageHelper.js";

/**
 * Logs out the current user by clearing local storage and redirecting to login.
 */
export function logoutUserHandler() {
  const logoutElement = document.getElementById("logout-btn");
  if (!logoutElement) return;
  logoutElement.addEventListener("click", handleLogout);
}

function handleLogout() {
  clearCurrentUser();
  window.location.href = "../index.html";
}

export async function checkNoLoggedInUser() {
  const currentUser = LocalStorageService.getItem("currentUser");
  const isLoginPage = /(?:\/|\\)index\.html$/.test(window.location.pathname);
  if (isLoginPage) return;

  const isSignupPage = /(?:\/|\\)signup\.html$/.test(window.location.pathname);
  if (isSignupPage) return;

  if (!currentUser) {
    window.location.href = "../index.html";
  }
}

/**
 * Clears the current user data from local storage if it exists.
 * @returns {void}
 */
export function clearCurrentUser() {
  const currentUser = LocalStorageService.getItem("currentUser");
  if (currentUser) {
    LocalStorageService.clearItem("currentUser");
  }
}
