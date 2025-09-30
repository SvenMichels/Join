/**
 * @fileoverview Manages user greeting display and mobile fade effect logic.
 * @module userGreetingManager
 */

import { getInitials } from "../scripts/utils/helpers.js";

/**
 * Retrieves stored user data from localStorage.
 *
 * Attempts to parse the `currentUser` JSON string from localStorage.
 * If no data exists or parsing fails, it returns `null`.
 *
 * @returns {Object|null} The parsed user data object or `null` if not available/invalid.
 */
const GREETING_FLAG_KEY = "hasSeenGreetingFeedback";
const GREETING_SELECTOR = ".greetings";
let hasFadedGreeting = false;

const initialUserState = getStoredUserData();
if (initialUserState?.[GREETING_FLAG_KEY]) {
  hasFadedGreeting = true;
}

export function updateUserGreetingDisplay() {
  const userData = getStoredUserData();
  if (!userData) return;

  if (userData[GREETING_FLAG_KEY]) {
    hideGreetingImmediately();
    hasFadedGreeting = true;
    return;
  }

  const userName = userData.userFullName || "Guest";
  const greeting = getTimeBasedGreeting();

  updateGreetingElements(greeting, userName);
  showGreetingContainer();
}

/**
 * Updates the greeting display with the current user's information.
 *
 * - Retrieves the stored user data.
 * - Falls back to "Guest" if no user data is available.
 * - Generates a time-based greeting (e.g., "Good morning").
 * - Passes the data to `updateGreetingElements` for rendering.
 *
 * @returns {void}
 */
function getStoredUserData() {
  const userString = localStorage.getItem("currentUser");
  try {
    return userString ? JSON.parse(userString) : null;
  } catch {
    return null;
  }
}

/**
 * Updates the greeting elements in the header with personalized text.
 *
 * - Sets the greeting message (e.g., "Good morning,").
 * - Renders the user's full name in the designated element.
 * - Displays the user's initials inside the profile button.
 *
 * @param {string} greeting - The greeting message (e.g., "Hello", "Welcome").
 * @param {string} name - The full name of the user to be displayed.
 * @returns {void}
 */
function updateGreetingElements(greeting, name) {
  const greetingEl = document.querySelector(".greetings > p:first-child");
  const nameEl = document.querySelector(".greetings .username");
  const profileBtn = document.getElementById("openMenu");

  if (greetingEl) greetingEl.textContent = `${greeting},`;
  if (nameEl) {
    const parts = name.trim().split(" ");
    if (parts.length > 1) {
      const lastName = parts.pop();
      const firstName = parts.join(" ");
      nameEl.innerHTML = `<span class="last-name" id="username">${firstName} ${lastName}</span>`;
    } else {
      nameEl.textContent = name;
    }
  }
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
// export function handleMobileGreetingFadeEffect() {
//   if (hasFadedGreeting) return;

//   const userData = getStoredUserData();
//   if (userData?.[GREETING_FLAG_KEY]) {
//     hasFadedGreeting = true;
//     hideGreetingImmediately();
//     window.removeEventListener("resize", handleMobileGreetingFadeEffect);
//     return;
//   }

//   if (window.innerWidth < 768) {
//     const greetings = document.querySelector(GREETING_SELECTOR);
//     if (!greetings) return;

//     greetings.classList.remove("hidden");

//     setTimeout(() => {
//       greetings.classList.add("hidden");
//       hasFadedGreeting = true;
//       markGreetingSeen();
//       window.removeEventListener("resize", handleMobileGreetingFadeEffect);
//     }, 1500);
//   }

//   window.removeEventListener("resize", handleMobileGreetingFadeEffect);
// }

function markGreetingSeen() {
  const userData = getStoredUserData();
  if (!userData || userData[GREETING_FLAG_KEY]) return;

  userData[GREETING_FLAG_KEY] = true;
  try {
    localStorage.setItem("currentUser", JSON.stringify(userData));
  } catch {
    // Ignore storage errors
  }
}

function hideGreetingImmediately() {
  const greetings = document.querySelector(GREETING_SELECTOR);
  if (greetings) greetings.classList.add("hidden");
}

function showGreetingContainer() {
  const greetings = document.querySelector(GREETING_SELECTOR);
  if (greetings) greetings.classList.remove("hidden");
}

// window.addEventListener("resize", handleMobileGreetingFadeEffect);