// login.js
import { requestData } from "../firebase.js";

const loginForm = document.getElementById("loginForm");
loginForm?.addEventListener("submit", async function (event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
});

async function loginUser(email, password) {
  try {
    const { data: users } = await requestData("GET", "/users/");
    const userList = Object.entries(users || {}).map(([id, data]) => ({ id, ...data }));
    const user = userList.find(
      (user) => user.userEmail === email && user.password === password
    );

    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      return user;
    } else {
      alert("Ungültige Anmeldedaten");
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    console.error("Fehler beim Login:", error);
    alert("Login fehlgeschlagen. Bitte versuche es erneut.");
    throw error; 
  }
}


export async function loginAsGuest() {
  try {
    const { data: users } = await requestData("GET", "/users/");
    const userList = Object.values(users);
    const guest = userList.find((u) => u.userName.toLowerCase() === "guest");

    if (guest) {
      localStorage.setItem("currentUser", JSON.stringify(guest));
      window.location.href = "startpage.html";
    } else {
      alert("Gast-Zugang nicht gefunden.");
    }
  } catch (err) {
    console.error("Fehler beim Gast-Login:", err);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  updateUserGreeting();
  updateSummary();
});

function updateUserGreeting() {
  const userString = localStorage.getItem("currentUser");
  if (!userString) return;

  try {
    const user = JSON.parse(userString);
    const name = user.userName || "Guest";

    const greetingEl = document.querySelector(".greetings > p:first-child");
    const nameEl = document.querySelector(".greetings .username");

    const hour = new Date().getHours();
    let greeting = "Hello";

    if (hour < 12) greeting = "Good Morning";
    else if (hour < 18) greeting = "Good Afternoon";
    else greeting = "Good Evening";

    if (greetingEl) greetingEl.textContent = `${greeting},`;
    if (nameEl) nameEl.textContent = name;
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
    console.error("Fehler beim Laden der Summary:", err);
  }
}

function countByStatus(tasks, status) {
  return tasks.filter((t) => t.status === status).length;
}

function countByPriority(tasks, prio) {
  return tasks.filter((t) => (t.prio || "").toLowerCase() === prio.toLowerCase()).length;
}

function getEarliestUrgentDueDate(tasks) {
  const urgentTasks = tasks
    .filter((t) => (t.prio || "").toLowerCase() === "high" && t.dueDate)
    .map((t) => new Date(t.dueDate))
    .sort((a, b) => a - b);

  if (urgentTasks.length === 0) return null;

  const options = { year: "numeric", month: "long", day: "numeric" };
  return urgentTasks[0].toLocaleDateString("en-US", options);
}

function setText(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text;
}