/**
 * Logs out the current user by clearing local storage and redirecting to login.
 */
export function logoutUser() {
  // Remove user data from local storage
  localStorage.removeItem("currentUser");
  localStorage.removeItem("token");

  // Redirect to login page
  window.location.href = "../index.html";
}
