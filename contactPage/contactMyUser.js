import { renderContact, getInitials, openEditWindow } from "./contacts.js";
import { ensureUserHasColor } from "../scripts/utils/colors.js";

document.addEventListener("DOMContentLoaded", () => {
  currentUserCard();
  const editBtn = document.getElementById("edit");
  if (editBtn) {
    editBtn.addEventListener("click", openEditWindow);
  }
});

async function currentUserCard() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) return;

  const updatedUser = await ensureUserHasColor(user);
  const { userName: name, userEmail: email } = updatedUser;
  const phone = updatedUser.phoneNumber || "–";
  const initials = getInitials(name);
  const firstLetter = name[0]?.toUpperCase() || "";
  const id = updatedUser.id;
  const colorClass = updatedUser.colorClass;

  renderContact(name, email, phone, initials, firstLetter, id, colorClass);
}
