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
  const phoneNumber = await getUserPhoneNumber(updatedUserData);
  const contactData = extractContactInformation(updatedUserData);
  
  renderContact(
    contactData.fullUserName,
    contactData.userEmailAddress,
    phoneNumber,
    contactData.userInitials,
    contactData.firstCharacter,
    contactData.userId,
    contactData.userColorClass
  );
}

async function getUserPhoneNumber(userData) {
  if (userData.phoneNumber) {
    return userData.phoneNumber;
  }
  
  try {
    const { getUserDataById } = await import("../scripts/users/users.js");
    const firebaseUserData = await getUserDataById(userData.id);
    return firebaseUserData?.phoneNumber || "";
  } catch (error) {
    return "";
  }
}

function extractContactInformation(userData) {
  const { userName: fullUserName, userEmail: userEmailAddress } = userData;
  
  return {
    fullUserName,
    userEmailAddress,
    userInitials: getInitials(fullUserName),
    firstCharacter: fullUserName[0]?.toUpperCase() || "",
    userId: userData.id,
    userColorClass: userData.colorClass
  };
}
