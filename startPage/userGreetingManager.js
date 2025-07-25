/**
 * User Greeting Manager
 * Verwaltet Begrüßungslogik und Benutzeranzeige
 */

import { getInitials } from "../scripts/utils/helpers.js";

/**
 * Aktualisiert Begrüßungsanzeige
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
 * Ermittelt zeitbasierte Begrüßung
 * @returns {string} Begrüßungstext
 */
function getTimeBasedGreeting() {
  const hour = new Date().getHours();
  
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

/**
 * Behandelt Mobile Greeting Fade-Effekt
 */
export function handleMobileGreetingFadeEffect() {
  if (window.innerWidth < 767) {
    const greetings = document.querySelector(".greetings");
    if (greetings) {
      setTimeout(() => greetings.classList.add("hidden"), 500);
    }
  }
}
