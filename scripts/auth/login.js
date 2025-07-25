import { requestData } from "../firebase.js";
import { loadAllUsersForLogin } from "../../contactPage/contactService.js";

const loginFormElement = document.getElementById("loginForm");

loginFormElement?.addEventListener("submit", handleFormSubmission);

async function handleFormSubmission(submitEvent) {
  submitEvent.preventDefault();
  const credentials = collectFormCredentials();
  await processLoginAttempt(credentials);
}

function collectFormCredentials() {
  return {
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value.trim(),
  };
}

async function processLoginAttempt(credentials) {
  try {
    await loginUser(credentials.email, credentials.password);
    redirectToStartpage();
  } catch (loginError) {
    console.warn("Login fehlgeschlagen:", loginError);
  }
}

function redirectToStartpage() {
  window.location.href = "startpage.html";
}

export async function loginUser(emailAddress, userPassword) {
    const allUsers = await loadAllUsersForLogin();
    console.log("Alle Benutzer:", allUsers);
    
    const authenticatedUser = findMatchingUser(
      allUsers,
      emailAddress,
      userPassword
    );

    if (!authenticatedUser) {
      console.log("Benutzer nicht gefunden oder ungültige Anmeldeinformationen.");
      throw new Error("Login fehlgeschlagen");
    }

    console.log("Authentifizierter Benutzer:", authenticatedUser);
    
    storeCurrentUser(authenticatedUser);
    console.log("User wurde ins localStorage gespeichert");
    return authenticatedUser;
}

function findMatchingUser(usersList, emailAddress, userPassword) {
  for (let userIndex = 0; userIndex < usersList.length; userIndex++) {
    const currentUser = usersList[userIndex];

    if (credentialsMatch(currentUser, emailAddress, userPassword)) {
      return currentUser;
    }
  }

  return null; // Kein User gefunden
}

function credentialsMatch(user, emailAddress, userPassword) {
  // Nur noch neues Format verwenden
  const userEmail = user.userEmailAddress;
  const password = user.userPassword;
  
  const emailMatches = userEmail?.toLowerCase() === emailAddress.toLowerCase();
  const passwordMatches = password === userPassword;
  
  console.log("Email-Vergleich:", userEmail, "===", emailAddress, "->", emailMatches);
  console.log("Password-Vergleich:", passwordMatches);
  
  return emailMatches && passwordMatches;
}

function storeCurrentUser(user) {
  console.log("Speichere User ins localStorage:", user);
  
  // Stelle sicher, dass der User im einheitlichen neuen Format gespeichert wird
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
  console.log("User gespeichert:", userToStore);
}

export async function loginAsGuest() {
  const guestUser = await findGuestUser();
  storeCurrentUser(guestUser);
  redirectToStartpage();
}

async function findGuestUser() {
  const { data: users } = await requestData("GET", "/users/");

  return Object.values(users || {}).find(
    (user) => user.userFullName?.toLowerCase() === "guest"
  );
}

document.addEventListener("DOMContentLoaded", initializeStartpage);

function initializeStartpage() {
  updateUserGreeting();
  updateSummary();
}

function updateUserGreeting() {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const timeBasedGreeting = generateTimeBasedGreeting();
    displayUserGreeting(timeBasedGreeting, currentUser.userFullName);
  } catch (warning) {
    console.warn("Fehler beim Parsen des Benutzers:", warning);
  }
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

function generateTimeBasedGreeting() {
  const currentHour = new Date().getHours();

  if (currentHour < 12) return "Good Morning";
  if (currentHour < 18) return "Good Afternoon";
  return "Good Evening";
}

function displayUserGreeting(greeting, userName) {
  const greetingElement = document.querySelector(".greetings > p:first-child");
  const nameElement = document.querySelector(".greetings .username");

  if (greetingElement) greetingElement.textContent = `${greeting},`;
  if (nameElement) nameElement.textContent = userName || "Guest";
}

async function updateSummary() {
  const allTasks = await fetchAllTasks();
  if (!allTasks) return;

  displayTaskCounts(allTasks);
  displayUrgentTaskInfo(allTasks);
}

async function fetchAllTasks() {
  const { data: tasks } = await requestData("GET", "/tasks/");
  return Object.values(tasks || {});
}

function displayTaskCounts(allTasks) {
  setText(".todoTaskAmount", countByStatus(allTasks, "todo"));
  setText(".doneTaskAmount", countByStatus(allTasks, "done"));
  setText(".taskInProgress", countByStatus(allTasks, "in-progress"));
  setText(".awaitingFeedback", countByStatus(allTasks, "await"));
  setText(".taskInBoard", allTasks.length);
  setText(".urgentTaskAmount", countByPriority(allTasks, "Urgent"));
}

function displayUrgentTaskInfo(allTasks) {
  const earliestUrgentDate = getEarliestUrgentDueDate(allTasks);
  setText(".urgentTaskDate", earliestUrgentDate || "No deadline");
}

function countByStatus(tasks, status) {
  return tasks.filter((t) => t.status === status).length;
}

function countByPriority(tasks, priority) {
  return tasks.filter(
    (t) => (t.prio || "").toLowerCase() === priority.toLowerCase()
  ).length;
}

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

function setText(selector, text) {
  const element = document.querySelector(selector);
  if (element) element.textContent = text;
}
