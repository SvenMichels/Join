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
const GREETING_VISIBLE_CLASS = "greeting-visible";
const GREETING_HIDDEN_CLASS = "greeting-hidden";
let hasFadedGreeting = false;

/**
 * Orchestrates the greeting update sequence for the current user.
 * @param {void} none - No parameters are required.
 * @dependencies getStoredUserData, getTimeBasedGreeting, updateGreetingElements
 * @void
 */
export function updateUserGreetingDisplay() {
  const userData = getStoredUserData();
  if (!userData) return;

  if (userData[GREETING_FLAG_KEY]) {
    hasFadedGreeting = true;
    return;
  }
  const userName = userData.userFullName || "Guest";
  const greeting = getTimeBasedGreeting();
  updateGreetingElements(greeting, userName);
}

/**
 * Retrieves and parses the current user data from localStorage.
 * @param {void} none - No parameters are required.
 * @dependencies localStorage
 * @void
 * @returns {Object|null} The parsed user object or null when unavailable.
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
 * Applies greeting text, username, and initials to the header elements.
 * @param {string} greeting - Localized greeting text based on the day period.
 * @param {string} name - The full name of the current user.
 * @dependencies document, getInitials
 * @void
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
 * Determines the appropriate greeting message for the current time of day.
 * @param {void} none - No parameters are required.
 * @dependencies Date
 * @void
 * @returns {string} The greeting that matches the current hour.
 */
function getTimeBasedGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

/**
 * Handles the fade-out animation of the greeting on mobile viewports.
 * @param {void} none - No parameters are required.
 * @dependencies getStoredUserData, document, window, markGreetingSeen
 * @void
 */
export function handleMobileGreetingFadeEffect() {
  const userData = getStoredUserData();
  const greetingsElement = document.querySelector(GREETING_SELECTOR);
  greetingsElement.classList.remove("hidefade");
  if (userData && userData[GREETING_FLAG_KEY]) {
    greetingsElement.classList.add("hidefade");
    window.removeEventListener("resize", handleMobileGreetingFadeEffect);
    return;
  }
  if (greetingsElement && window.innerWidth <= 768 && !hasFadedGreeting) {
    greetingsElement.classList.remove("hidefade");
    setTimeout(() => {
      greetingsElement.classList.add("hidefade");
    }, 2000);
    hasFadedGreeting = true;
    markGreetingSeen();
    window.removeEventListener("resize", handleMobileGreetingFadeEffect);
    return;
  }
}

/**
 * Updates the current user record to note that the greeting fade has executed.
 * @param {void} none - No parameters are required.
 * @dependencies getStoredUserData, localStorage
 * @void
 */
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

window.addEventListener("resize", handleMobileGreetingFadeEffect);