
import { getInitials } from "../scripts/utils/helpers.js";
import { renderContact } from "./contactRenderer.js";
import { openEditWindow } from "./contacts.js";

document.addEventListener("DOMContentLoaded", () => {
  currentUserCard();
});

async function currentUserCard() {
  const currentUserData = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUserData) return;

  const contactData = extractContactInformation(currentUserData);

  renderContact(
    contactData.userFullName,
    contactData.userEmailAddress,
    contactData.userPhoneNumber,
    contactData.userInitials,
    contactData.firstCharacter,
    contactData.userId,
    contactData.userColor
  );

  // Event-Listener NACH dem Rendern hinzufügen
  setTimeout(() => {
    const editBtn = document.getElementById("editContact");
    if (editBtn) {
      editBtn.addEventListener("click", () => openEditWindow());
    }
  }, 100);
}

function extractContactInformation(userData) {
  const userFullName = userData.userFullName;
  const userEmailAddress = userData.userEmailAddress;
  const userPhoneNumber = userData.userPhoneNumber;
  const userInitials = getInitials(userData.userFullName);
  const firstCharacter = userData.userFullName ? userData.userFullName.charAt(0).toUpperCase() : "?";
  const userId = userData.id;
  const userColor = userData.userColor;

  return {
    userFullName,
    userEmailAddress,
    userPhoneNumber,
    userInitials,
    firstCharacter,
    userId,
    userColor
  };
}