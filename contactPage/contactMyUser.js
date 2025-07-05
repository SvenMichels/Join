import { renderContact, getInitials, openEditWindow } from "./contacts.js";

document.addEventListener("DOMContentLoaded", () => {
  currentUserCard();
  document.getElementById("edit").addEventListener("click", openEditWindow);
});

function currentUserCard() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) return;

  const { userName: name, userEmail: email } = user;
  const phone = user.phoneNumber || "–";
  const initials = getInitials(name);
  const firstLetter = name[0]?.toUpperCase() || "";
  const id = user.id;
  const colorClass = user.colorClass || getRandomColorClass();

  renderContact(name, email, phone, initials, firstLetter, id, colorClass);
}

function getRandomColorClass() {
  return `color-${Math.floor(Math.random() * 20) + 1}`;
}
