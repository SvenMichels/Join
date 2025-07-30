/**
 * @fileoverview Manages user greeting display and mobile fade effect logic.
 * @module userGreetingManager
 */

import { getInitials } from "../scripts/utils/helpers.js";

/**
 * Updates the greeting message and user name on the dashboard.
 * Pulls user data from localStorage and displays time-based greeting.
 */
export function updateUserGreetingDisplay() {
  const userString = localStorage.getItem("currentUser");
  if (!userString) {
    console.log("No current user data found");
    return;
  }

  const userData = JSON.parse(userString);
  const userName = userData.userFullName || "Guest";
  const greeting = getTimeBasedGreeting();

  const greetingEl = document.querySelector(".greetings > p:first-child");
  const nameEl = document.querySelector(".greetings .username");
  const profileBtn = document.getElementById("openMenu");

  if (greetingEl) greetingEl.textContent = `${greeting},`;
  if (nameEl) nameEl.textContent = userName;
  if (profileBtn) profileBtn.textContent = getInitials(userName);
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
