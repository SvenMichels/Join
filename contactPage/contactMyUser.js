import { renderContact, openEditWindow } from "./contacts.js";
import { ensureUserHasAssignedColor } from "../scripts/utils/colors.js";
import { getInitials } from "../scripts/utils/helpers.js";

document.addEventListener("DOMContentLoaded", () => {
  currentUserCard();
  const editBtn = document.getElementById("edit");
  if (editBtn) {
    editBtn.addEventListener("click", openEditWindow);
  }
});

async function currentUserCard() {
  const currentUserData = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUserData) return;

  const updatedUserData = await ensureUserHasAssignedColor(currentUserData);
  const { userName: fullUserName, userEmail: userEmailAddress } = updatedUserData;
  const phoneNumber = updatedUserData.phoneNumber || "–";
  const userInitials = getInitials(fullUserName);
  const firstCharacter = fullUserName[0]?.toUpperCase() || "";
  const userId = updatedUserData.id;
  const userColorClass = updatedUserData.colorClass;

  renderContact(fullUserName, userEmailAddress, phoneNumber, userInitials, firstCharacter, userId, userColorClass);
}
