import { requestData } from "../firebase.js";
import { fetchUsersFromDatabase } from "../firebase.js";
import { countByStatus } from "../../startPage/taskStatisticsManager.js";

const loginFormElement = document.getElementById("loginForm");

loginFormElement?.addEventListener("submit", handleFormSubmission);

/**
 * Handles form submission and triggers login process.
 * 
 * @param {SubmitEvent} submitEvent - Form submit event.
 */
async function handleFormSubmission(submitEvent) {
  submitEvent.preventDefault();
  const credentials = collectFormCredentials();
  await processLoginAttempt(credentials);
}

/**
 * Collects user credentials from the login form.
 * 
 * @returns {{ email: string, password: string }}
 */
function collectFormCredentials() {
  return {
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value.trim(),
  };
}

/**
 * Tries to log the user in with provided credentials.
 * 
 * @param {{ email: string, password: string }} credentials 
 */
async function processLoginAttempt(credentials) {
  try {
    await loginUser(credentials.email, credentials.password);
    redirectToStartpage();
  } catch (loginError) {
    console.warn("Login failed:", loginError);
  }
}

/**
 * Redirects to the start page upon successful login.
 */
function redirectToStartpage() {
  window.location.href = "startpage.html";
}

/**
 * Authenticates a user based on email and password.
 * 
 * @param {string} emailAddress 
 * @param {string} userPassword 
 * @returns {Promise<Object>}
 */
export async function loginUser(emailAddress, userPassword) {
  const allUsers = await loadAllUsersForLogin();

  const authenticatedUser = findMatchingUser(allUsers, emailAddress, userPassword);

  if (!authenticatedUser) {
    throw new Error("Login failed");
  }

  storeCurrentUser(authenticatedUser);
  return authenticatedUser;
}

/**
 * Finds a user in the list that matches the provided credentials.
 * 
 * @param {Array} usersList 
 * @param {string} emailAddress 
 * @param {string} userPassword 
 * @returns {Object|null}
 */
function findMatchingUser(usersList, emailAddress, userPassword) {
  for (let userIndex = 0; userIndex < usersList.length; userIndex++) {
    const currentUser = usersList[userIndex];

    if (credentialsMatch(currentUser, emailAddress, userPassword)) {
      return currentUser;
    }
  }

  return null;
}

/**
 * Checks if provided credentials match user data.
 * 
 * @param {Object} user 
 * @param {string} emailAddress 
 * @param {string} userPassword 
 * @returns {boolean}
 */
function credentialsMatch(user, emailAddress, userPassword) {
  const userEmail = user.userEmailAddress;
  const password = user.userPassword;

  const emailMatches = userEmail?.toLowerCase() === emailAddress.toLowerCase();
  const passwordMatches = password === userPassword;
  return emailMatches && passwordMatches;
}

/**
 * Stores the currently logged-in user in localStorage.
 * 
 * @param {Object} user - The authenticated user object.
 */
function storeCurrentUser(user) {

  const userToStore = {
    id: user.userId || user.id,
    userFullName: user.userFullName,
    userEmailAddress: user.userEmailAddress,
    userPassword: user.userPassword,
    userPhoneNumber: user.userPhoneNumber,
    userColor: user.userColor,
    userInitials: user.userInitials,
    firstCharacter: user.firstCharacter
  };

  localStorage.setItem("currentUser", JSON.stringify(userToStore));
}

/**
 * Logs in as a predefined guest user and redirects.
 */
export async function loginAsGuest() {
  const guestUser = await findGuestUser();
  storeCurrentUser(guestUser);
  redirectToStartpage();
}

/**
 * Finds the guest user object from the database.
 * 
 * @returns {Promise<Object>}
 */
async function findGuestUser() {
  const { data: users } = await requestData("GET", "/users/");

  return Object.values(users || {}).find(
    (user) => user.userFullName?.toLowerCase() === "guest"
  );
}

document.addEventListener("DOMContentLoaded", initializeStartpage);

/**
 * Initializes the start page by updating UI elements.
 */
function initializeStartpage() {
  updateUserGreeting();
  updateSummary();
}

/**
 * Updates the greeting section based on time and user.
 */
function updateUserGreeting() {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const timeBasedGreeting = generateTimeBasedGreeting();
    displayUserGreeting(timeBasedGreeting, currentUser.userFullName);
  } catch (warning) {
    console.warn("Failed to parse user data:", warning);
  }
}

/**
 * Returns the current user object from localStorage.
 * 
 * @returns {Object|null}
 */
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

/**
 * Generates a greeting string based on current time.
 * 
 * @returns {string}
 */
function generateTimeBasedGreeting() {
  const currentHour = new Date().getHours();

  if (currentHour < 12) return "Good Morning";
  if (currentHour < 18) return "Good Afternoon";
  return "Good Evening";
}

/**
 * Displays greeting and user name on the UI.
 * 
 * @param {string} greeting 
 * @param {string} userName 
 */
function displayUserGreeting(greeting, userName) {
  const greetingElement = document.querySelector(".greetings > p:first-child");
  const nameElement = document.querySelector(".greetings .username");

  if (greetingElement) greetingElement.textContent = `${greeting},`;
  if (nameElement) nameElement.textContent = userName || "Guest";
}

/**
 * Loads all tasks and updates dashboard summary.
 */
async function updateSummary() {
  const allTasks = await fetchAllTasks();
  if (!allTasks) return;

  displayTaskCounts(allTasks);
  displayUrgentTaskInfo(allTasks);
}

/**
 * Fetches all tasks from backend.
 * 
 * @returns {Promise<Array>}
 */
export async function fetchAllTasks() {
  const { data: tasks } = await requestData("GET", "/tasks/");  
  return Object.values(tasks || {});
}

/**
 * Updates task count boxes on the summary dashboard.
 * 
 * @param {Array} allTasks 
 */
function displayTaskCounts(allTasks) {
  setText(".todoTaskAmount", countByStatus(allTasks, "todo"));
  setText(".doneTaskAmount", countByStatus(allTasks, "done"));
  setText(".taskInProgress", countByStatus(allTasks, "in-progress"));
  setText(".awaitingFeedback", countByStatus(allTasks, "await"));
  setText(".taskInBoard", allTasks.length);
  setText(".urgentTaskAmount", countByPriority(allTasks, "Urgent"));
}

/**
 * Displays the earliest deadline among urgent tasks.
 * 
 * @param {Array} allTasks 
 */
function displayUrgentTaskInfo(allTasks) {
  const earliestUrgentDate = getEarliestUrgentDueDate(allTasks);
  setText(".urgentTaskDate", earliestUrgentDate || "No deadline");
}

/**
 * Counts tasks by given priority.
 * 
 * @param {Array} tasks 
 * @param {string} priority 
 * @returns {number}
 */
function countByPriority(tasks, priority) {
  return tasks.filter(
    (t) => (t.prio || "").toLowerCase() === priority.toLowerCase()
  ).length;
}

/**
 * Returns the earliest due date among urgent tasks.
 * 
 * @param {Array} tasks 
 * @returns {string|null}
 */
function getEarliestUrgentDueDate(tasks) {
  const urgentDates = tasks
    .filter((t) => (t.prio || "").toLowerCase() === "urgent" && t.dueDate)
    .map((t) => new Date(t.dueDate))
    .sort((a, b) => a - b);

  if (!urgentDates.length) return null;

  return urgentDates[0].toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Sets text content for a given selector.
 * 
 * @param {string} selector 
 * @param {string|number} text 
 */
function setText(selector, text) {
  const element = document.querySelector(selector);
  if (element) element.textContent = text;
}

/**
 * Transforms raw Firebase user data into an array for login usage.
 *
 * @function transformUsersForLogin
 * @param {Object} usersData - Raw user data as key-value pairs.
 * @returns {Object[]} Array of formatted user objects.
 */
function transformUsersForLogin(usersData) {
  const userEntries = Object.entries(usersData);
  
  return userEntries.map(([id, user]) => ({
    userId: id,
    userFullName: user.userFullName,
    userEmailAddress: user.userEmailAddress,
    userPassword: user.userPassword,
    userPhoneNumber: user.userPhoneNumber,
    userInitials: user.userInitials,
    firstCharacter: user.firstCharacter,
    userColor: user.userColor
  }));
}

/**
 * Loads all users from the database and prepares them for login.
 *
 * @async
 * @function loadAllUsersForLogin
 * @returns {Promise<Object[]>} Array of user objects.
 */
export async function loadAllUsersForLogin() {
  const usersData = await fetchUsersFromDatabase();
  return transformUsersForLogin(usersData);
}