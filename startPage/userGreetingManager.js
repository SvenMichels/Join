/**
 * @fileoverview Manages user greeting display and mobile fade effect logic.
 * @module userGreetingManager
 */

import { getInitials } from "../scripts/utils/helpers.js";

/**
 * Updates the greeting message and user name on the dashboard.
 * Pulls user data from localStorage and displays time-based greeting.
 */
// TODO: REFACTOR: This function is too large and does too many things. Consider breaking it down into smaller functions.
// export function updateUserGreetingDisplay() {
//   const userString = localStorage.getItem("currentUser");
//   if (!userString) {
//     return;
//   }

//   const userData = JSON.parse(userString);
//   const userName = userData.userFullName || "Guest";
//   const greeting = getTimeBasedGreeting();

//   const greetingEl = document.querySelector(".greetings > p:first-child");
//   const nameEl = document.querySelector(".greetings .username");
//   const profileBtn = document.getElementById("openMenu");

//   if (greetingEl) greetingEl.textContent = `${greeting},`;
//   if (nameEl) nameEl.textContent = userName;
//   if (profileBtn) profileBtn.textContent = getInitials(userName);
// }

export function updateUserGreetingDisplay() {
  const userData = getStoredUserData();
  if (!userData) return;

  const userName = userData.userFullName || "Guest;"
  const greeting =getTimeBasedGreeting();

  updateGreetingElements(greeting, userName);
}

function getStoredUserData() {
  const userString = localStorage.getItem("currentUser");
  try {
    return userString ? JSON.parse(userString) : null;
  } catch {
    return null;
  }
}

function updateGreetingElements(greeting, name) {
  const greetingEl = document.querySelector(".greetings > p:first-child");
  const nameEl = document.querySelector(".greetings .username");
  const profileBtn = document.getElementById("openMenu");

  if (greetingEl) greetingEl.textContent = `${greeting},`;
  if (nameEl) nameEl.textContent = name;
  if (profileBtn) profileBtn.textContent = getInitials(name);
}

/**
 * Returns a greeting message depending on the current time of day.
 * 
 * @returns {string} A greeting string: "Good Morning", "Good Afternoon", or "Good Evening".
 */
function getTimeBasedGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

/**
 * Fades out the greeting message automatically on mobile view.
 * Applies a CSS class to hide the greeting after a short delay.
 */
export function handleMobileGreetingFadeEffect() {
  if (window.innerWidth < 767) {
    const greetings = document.querySelector(".greetings");
    if (greetings) {
      setTimeout(() => greetings.classList.add("hidden"), 500);
    }
  }
}
