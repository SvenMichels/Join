import { requestData } from "../firebase.js";

// === LOGIN FORM HANDLING ===
const loginForm = document.getElementById("loginForm");

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    await loginUser(email, password);
    window.location.href = "startpage.html";
  } catch (err) {
    console.warn("Login fehlgeschlagen:", err.message);
  }
});

// === LOGIN-FUNKTION ===
export async function loginUser(email, password) {
  try {
    const { data: users } = await requestData("GET", "/users/");
    const userList = Object.entries(users || {}).map(([id, data]) => ({ id, ...data }));

    const user = userList.find(
      (user) =>
        user.userEmail?.toLowerCase() === email.toLowerCase() &&
        user.password === password
    );

    if (!user) throw new Error("Invalid credentials");

    localStorage.setItem("currentUser", JSON.stringify(user));
    return user;
  } catch (err) {
    console.warn("Fehler beim Login:", err);
    throw err;
  }
}

// === GAST-LOGIN ===
export async function loginAsGuest() {
  try {
    const { data: users } = await requestData("GET", "/users/");
    const guest = Object.values(users || {}).find(
      (user) => user.userName?.toLowerCase() === "guest"
    );

    if (!guest) return warn("Gast-Zugang nicht gefunden.");

    localStorage.setItem("currentUser", JSON.stringify(guest));
    window.location.href = "startpage.html";
  } catch (err) {
    console.warn("Fehler beim Gast-Login:", err);
  }
}

// === INIT ON LOAD ===
document.addEventListener("DOMContentLoaded", () => {
  updateUserGreeting();
  updateSummary();
});

// === BEGRÜSSUNG ===
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
  } catch (err) {
    console.warn("Fehler beim Parsen des Benutzers:", err);
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
  } catch (err) {
    console.warn("Fehler beim Laden der Summary:", err);
  }
}

// === HELPER ===
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