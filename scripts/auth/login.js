import { requestData } from "../firebase.js";

const loginFormElement = document.getElementById("loginForm");

loginFormElement?.addEventListener("submit", async (submitEvent) => {
  submitEvent.preventDefault();
  const emailInputValue = document.getElementById("email").value.trim();
  const passwordInputValue = document.getElementById("password").value.trim();

  try {
    await loginUser(emailInputValue, passwordInputValue);
    window.location.href = "startpage.html";
  } catch (loginError) {
    console.warn("Login fehlgeschlagen:", loginError);
  }
});

export async function loginUser(emailAddress, userPassword) {
  try {
    const { data: allUsersData } = await requestData("GET", "/users/");
    const userEntriesArray = Object.entries(allUsersData || {});
    const completeUsersList = [];
    
    for (let entryIndex = 0; entryIndex < userEntriesArray.length; entryIndex++) {
      const [userId, userData] = userEntriesArray[entryIndex];
      completeUsersList.push({ id: userId, ...userData });
    }

    let authenticatedUser = null;
    for (let userIndex = 0; userIndex < completeUsersList.length; userIndex++) {
      const currentUser = completeUsersList[userIndex];
      const emailMatches = currentUser.userEmail?.toLowerCase() === emailAddress.toLowerCase();
      const passwordMatches = currentUser.password === userPassword;
      
      if (emailMatches && passwordMatches) {
        authenticatedUser = currentUser;
        break;
      }
    }

    if (!authenticatedUser) throw new Error("Invalid credentials");

    localStorage.setItem("currentUser", JSON.stringify(authenticatedUser));
    return authenticatedUser;
  } catch (loginError) {
    console.warn("Fehler beim Login:", loginError);
  }
}

export async function loginAsGuest() {
  try {
    const { data: users } = await requestData("GET", "/users/");
    const guest = Object.values(users || {}).find(
      (user) => user.userName?.toLowerCase() === "guest"
    );

    if (!guest) return warn("Gast-Zugang nicht gefunden.");

    localStorage.setItem("currentUser", JSON.stringify(guest));
    window.location.href = "startpage.html";
  } catch (warning) {
    console.warn("Fehler beim Gast-Login:", warning);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateUserGreeting();
  updateSummary();
});

function updateUserGreeting() {
  try {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) return;

    const name = user.userName || "Guest";
    const greetingElement = document.querySelector(".greetings > p:first-child");
    const nameElement = document.querySelector(".greetings .username");

    const hour = new Date().getHours();
    const greeting =
      hour < 12 ? "Good Morning" :
      hour < 18 ? "Good Afternoon" :
      "Good Evening";

    if (greetingElement) greetingElement.textContent = `${greeting},`;
    if (nameElement) nameElement.textContent = name;
  } catch (warning) {
    console.warn("Fehler beim Parsen des Benutzers:", warning);
  }
}

async function updateSummary() {
  try {
    const { data: tasks } = await requestData("GET", "/tasks/");
    if (!tasks) return;

    const allTasks = Object.values(tasks);

    setText(".todoTaskAmount", countByStatus(allTasks, "todo"));
    setText(".doneTaskAmount", countByStatus(allTasks, "done"));
    setText(".taskInProgress", countByStatus(allTasks, "in-progress"));
    setText(".awaitingFeedback", countByStatus(allTasks, "await"));
    setText(".taskInBoard", allTasks.length);
    setText(".urgentTaskAmount", countByPriority(allTasks, "High"));

    const earliestUrgentDate = getEarliestUrgentDueDate(allTasks);
    setText(".urgentTaskDate", earliestUrgentDate || "No deadline");
  } catch (warning) {
    console.warn("Fehler beim Laden der Summary:", warning);
  }
}

function countByStatus(tasks, status) {
  return tasks.filter((t) => t.status === status).length;
}

function countByPriority(tasks, priority) {
  return tasks.filter((t) => (t.prio || "").toLowerCase() === priority.toLowerCase()).length;
}

function getEarliestUrgentDueDate(tasks) {
  const urgentDates = tasks
    .filter((t) => (t.prio || "").toLowerCase() === "high" && t.dueDate)
    .map((t) => new Date(t.dueDate))
    .sort((a, b) => a - b);

  if (!urgentDates.length) return null;

  return urgentDates[0].toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function setText(selector, text) {
  const element = document.querySelector(selector);
  if (element) element.textContent = text;
}