/**
 * Logs out the current user by clearing local storage and redirecting to login.
 */
export function logoutUser() {
  localStorage.removeItem("currentUser");
  window.location.href = "../index.html";
}
