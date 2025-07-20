import {
  alphabetfilter,
  contactCard,
  singleContact,
} from "./contactTemplate.js";

import {
  createContact,
  loadContacts,
  updateContactInFirebase,
  deleteContactFromFirebase,
} from "../contactPage/contactService.js";
import {
  generateRandomColorClass,
  ensureUserHasAssignedColor,
} from "../scripts/utils/colors.js";
import { initializeBackButton, initializeFabMenu } from "../scripts/ui/fabContact.js";
import { isMobileView } from "../scripts/utils/mobileView.js";
import { setupDropdown } from "../scripts/ui/dropdown.js";
import { highlightActiveNavigationLinks } from "../scripts/utils/navUtils.js";
import { getInitials } from "../scripts/utils/helpers.js";
import { setupMobileDeviceListeners } from "../scripts/utils/mobileUtils.js";

let allContactsCollection = [];
let currentlyBeingEditedContactId = null;
const alphabetLettersUsedSet = new Set();

window.contactList = allContactsCollection;

// Initialize contacts page
document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("addBtn").addEventListener("click", openContactAdditionWindow);
  
  const closeButtons = document.querySelectorAll(".cancelBtn, .closeBtn");
  for (let buttonIndex = 0; buttonIndex < closeButtons.length; buttonIndex++) {
    closeButtons[buttonIndex].addEventListener("click", handleWindowClosing);
  }
  
  document
    .getElementById("addContactForm")
    .addEventListener("submit", addNewContactToDatabase);
  setupDropdown("#openMenu", "#dropDownMenu");
  document
    .getElementById("editContactForm")
    .addEventListener("submit", handleContactEditSubmission);

  loadAndShowContactDetails();
  await loadAllContactsFromFirebaseDatabase();
  await ensureColorClassAssignmentForAllContacts();
  loadUserInitialsDisplay();
  highlightActiveNavigationLinks();
  setupMobileDeviceListeners();
});

function handleWindowClosing() {
  closeAddWindow();
  closeEditWindow();
}
function openContactAdditionWindow() {
  document.getElementById("addWindow").classList.remove("dp-none");
}
function closeAddWindow() {
  document.getElementById("addWindow").classList.add("dp-none");
}
function closeEditWindow() {
  document.getElementById("editWindow").classList.add("dp-none");
}

export async function openEditWindow() {
  let contact = currentlyBeingEditedContactId ? findContactById(currentlyBeingEditedContactId) : null;

  if (!contact) {
    const currentUserData = JSON.parse(localStorage.getItem("currentUser")) || {};
    
    // Try to get the most complete user data including phone number
    let phoneNumber = currentUserData.phoneNumber;
    if (!phoneNumber && currentUserData.id) {
      try {
        const { getUserDataById } = await import("../scripts/users/users.js");
        const firebaseUserData = await getUserDataById(currentUserData.id);
        phoneNumber = firebaseUserData?.phoneNumber || "";
      } catch (error) {
        phoneNumber = "";
      }
    }
    
    contact = {
      id: currentUserData.id || null,
      name: currentUserData.userName || "",
      email: currentUserData.userEmail || "",
      phone: phoneNumber || "",
    };
  }
  currentlyBeingEditedContactId = contact.id;

  // Fill form fields with proper mapping
  const nameInput = document.querySelector(`#editWindow #contactName`);
  const emailInput = document.querySelector(`#editWindow #contactEmail`);
  const phoneInput = document.querySelector(`#editWindow #contactPhone`);
  
  if (nameInput) nameInput.value = contact.name || "";
  if (emailInput) emailInput.value = contact.email || "";
  if (phoneInput) phoneInput.value = contact.phone || "";

  document.getElementById("editWindow").classList.remove("dp-none");
}

async function loadAllContactsFromFirebaseDatabase() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
  contactList = await loadContacts();

  for (let contact of contactList) {
    await ensureUserHasAssignedColor(contact);
  }

  if (currentUser.id && !contactList.some((c) => c.id === currentUser.id)) {
    const userWithColor = await ensureUserHasAssignedColor(currentUser);
    
    // Try to get phone number from Firebase if not in localStorage
    let phoneNumber = userWithColor.phoneNumber;
    if (!phoneNumber) {
      try {
        const { getUserDataById } = await import("../scripts/users/users.js");
        const firebaseUserData = await getUserDataById(currentUser.id);
        phoneNumber = firebaseUserData?.phoneNumber || "";
      } catch (error) {
        phoneNumber = "";
      }
    }
    
    contactList.push({
      id: userWithColor.id,
      name: userWithColor.userName,
      email: userWithColor.userEmail,
      phone: phoneNumber,
      initials: getInitials(userWithColor.userName),
      colorClass: userWithColor.colorClass,
    });
  }

  clearContactListUI();
  renderAllContacts(contactList);

  // Show current user's contact by default, not just the first one
  if (contactList.length && currentUser.id) {
    const userContactId = currentUser.id;
    showContact(userContactId);
    const userContactElement = document.querySelector(`.contact[data-id="${userContactId}"]`);
    if (userContactElement) {
      userContactElement.classList.add("active");
    }
  } else if (contactList.length) {
    const firstId = contactList[0].id;
    if (!isMobileView()) {
      showContact(firstId);
      document
        .querySelector(`.contact[data-id="${firstId}"]`)
        ?.classList.add("active");
    }
  }
}

async function addNewContactToDatabase(e) {
  e.preventDefault();
  const name = getName();
  const contact = {
    name,
    email: getEmail(),
    phone: getPhone(),
    initials: getInitials(name),
    colorClass: generateRandomColorClass(),
  };

  try {
    await addContactTry(contact);
  } catch (error) {
    // Silently handle contact creation errors
  }
}

async function addContactTry(contact) {
  const result = await createContact(contact);
  contact.id = result.data.name;
  contactList.push(contact);

  clearContactListUI();
  renderAllContacts(contactList);
  emptyInput();
  showUserFeedback();
  setTimeout(closeAddWindow, 800);
}

const $ = (id) => document.getElementById(id);
const trimVal = (id) => $(id).value.trim();

function getName() {
  return trimVal("contactName");
}

function getEmail() {
  return trimVal("contactEmail");
}

function getPhone() {
  return trimVal("contactPhone");
}

function emptyInput() {
  ["contactName", "contactEmail", "contactPhone"].forEach((id) => {
    const el = $(id);
    if (el) el.value = "";
  });
}

function getFirstLetter(name) {
  return name[0]?.toUpperCase() || "";
}

export function renderContact(
  name,
  email,
  phone,
  initials,
  firstLetter,
  id,
  colorClass
) {
  renderAlphabetFilter(firstLetter);
  renderContactCard(name, email, initials, id, colorClass);
  renderSingleContact(name, email, phone, initials, id, colorClass);
}

function renderAlphabetFilter(letter) {
  if (alphabetLettersUsedSet.has(letter)) return;
  alphabetLettersUsedSet.add(letter);
  $("allContacts").innerHTML += alphabetfilter(letter);
}

function renderContactCard(name, email, initials, id, colorClass) {
  $("allContacts").innerHTML += contactCard(
    name,
    email,
    initials,
    id,
    colorClass
  );
}

function renderSingleContact(name, email, phone, initials, id, colorClass) {
  const displayPhone = phone && phone.trim() !== "" ? phone : "–";
  $("bigContact").innerHTML = singleContact(
    name,
    email,
    displayPhone,
    initials,
    id,
    colorClass
  );
  bindDeleteButton($("bigContact"));
  bindEditButton($("bigContact"));
}

function bindButton(container, selector, cb) {
  const btn = container.querySelector(selector);
  if (btn) btn.addEventListener("click", () => cb(btn.dataset.id));
}

const bindDeleteButton = (containerElement) => {
  bindButton(containerElement, ".deleteBtn", deleteContact);
  bindButton(containerElement, "#fabDelete", deleteContact);
};
const bindEditButton = (containerElement) => {
  bindButton(containerElement, ".editBtn", editContact);
  bindButton(containerElement, "#fabEdit", editContact);
};

function loadAndShowContactDetails() {
  $("allContacts").addEventListener("click", (e) => {
    const card = e.target.closest(".contact");
    if (!card) return;
    document
      .querySelectorAll("#allContacts .contact.active")
      .forEach((c) => c.classList.remove("active"));
    card.classList.add("active");
    showContact(card.dataset.id);
  });
}

export async function deleteContact(id) {
  try {
    // First delete from Firebase
    await deleteContactFromFirebase(id);
    
    // Then remove from local contactList
    contactList = contactList.filter((contactItem) => contactItem.id !== id);

    // Update UI
    clearContactListUI();
    renderAllContacts(contactList);
    clearBigContactView();
    
    // Show success feedback
    showUserFeedback();
    
  } catch (deleteError) {
    // Handle deletion error - could show user feedback here
    alert("Failed to delete contact. Please try again.");
  }
  handlePostDeleteView(contactList);
}

function handlePostDeleteView(list) {
  if (!list.length) {
    hideSingleContactView();
    return;
  }

  const firstId = list[0].id;
  if (isMobileView()) {
    hideSingleContactView();
  } else {
    showContact(firstId);
    document.querySelector(`.contact[data-id="${firstId}"]`)?.classList.add('active');
  }
}

export function editContact(id) {
  const contact = findContactById(id);

  if (!contact) {
    editContactIf(contact);
    return;
  }
  currentlyBeingEditedContactId = id;
  fillEditForm(contact);
  openEditWindow();
}

function editContactIf(contact) {
  currentlyBeingEditedContactId = null;
  openEditWindow();
}

function fillEditForm(c) {
  const map = {
    contactName: c.name,
    contactEmail: c.email,
    contactPhone: c.phone,
  };
  Object.entries(map).forEach(([id, val]) => {
    const el = document.querySelector(`#editWindow #${id}`);
    if (el) el.value = val;
  });
}

function getEditContactInput() {
  return {
    name: trimValEdit("contactName"),
    email: trimValEdit("contactEmail"),
    phone: trimValEdit("contactPhone"),
  };
}

function trimValEdit(id) {
  return document.querySelector(`#editWindow #${id}`).value.trim();
}

function handleContactEditSubmission(e) {
  e.preventDefault();

  const updated = getEditContactInput();
  const contact = findContactById(currentlyBeingEditedContactId);

  if (contact) {
    handleIfEditSubmit(contact, updated);
  } else {
    handleElseEditSubmit(updated);
  }
}

function handleIfEditSubmit(contact, updated) {
  updateContact(contact, updated).then(() => {
    rerenderAfterEdit(contact.id);
    showContact(contact.id);
    closeEditWindow();
  });
}

function handleElseEditSubmit(updated) {
  updateCurrentUser(updated).then(() => {
    loadUserInitialsDisplay();
    
    // Re-render the contact list and show updated contact
    clearContactListUI();
    renderAllContacts(contactList);
    
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser?.id) {
      showContact(currentUser.id);
      const userContactElement = document.querySelector(`.contact[data-id="${currentUser.id}"]`);
      if (userContactElement) {
        userContactElement.classList.add("active");
      }
    }
    
    closeEditWindow();
  });
}

async function updateContact(contact, updated) {
  Object.assign(contact, updated, { initials: getInitials(updated.name) });
  await updateContactInFirebase(contact);
}

async function updateCurrentUser(updated) {
  const user = getCurrentUser();
  const patchedUser = createPatchedUser(user, updated);
  
  saveUserToLocalStorage(patchedUser);
  updateContactInList(user.id, updated);
  await tryUpdateUserInDatabase(patchedUser, user);
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser")) || {};
}

function createPatchedUser(user, updated) {
  return {
    ...user,
    userName: updated.name,
    userEmail: updated.email,
    phoneNumber: updated.phone,
  };
}

function saveUserToLocalStorage(patchedUser) {
  localStorage.setItem("currentUser", JSON.stringify(patchedUser));
}

function updateContactInList(userId, updated) {
  const userContactIndex = contactList.findIndex(contact => contact.id === userId);
  
  if (userContactIndex !== -1) {
    contactList[userContactIndex] = {
      ...contactList[userContactIndex],
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      initials: getInitials(updated.name)
    };
  }
}

async function tryUpdateUserInDatabase(patched, originalUser) {
    const { updateUserInformation } = await import("../scripts/users/users.js");
    await updateUserInformation(patched.id, patched);


  const card = document.querySelector(`.contact[data-id='${patched.id}']`);
  if (card) {
    card.querySelector(".contactName").textContent = patched.userName;
    card.querySelector(".email").textContent = patched.userEmail;
  }
  
  if (document.querySelector("#profileName")?.textContent === originalUser.userName) {
    const displayPhone = patched.phoneNumber && patched.phoneNumber.trim() !== "" ? patched.phoneNumber : "–";
    renderSingleContact(
      patched.userName,
      patched.userEmail,
      displayPhone,
      getInitials(patched.userName),
      patched.id,
      patched.colorClass || generateRandomColorClass()
    );
  }
}

function rerenderAfterEdit(id) {
  clearContactListUI();
  renderAllContacts(contactList);
}

function findContactById(id) {
  return contactList.find((c) => String(c.id) === String(id));
}

function showContact(id) {
  const c = findContactById(id);
  if (!c) return;
  renderSingleContact(
    c.name,
    c.email,
    c.phone,
    c.initials,
    c.id,
    c.colorClass || generateRandomColorClass()
  );

  const single = document.querySelector('.singleContact');
  if (isMobileView()) {
    single.classList.add('slide-in');
    initializeFabMenu(id);
    initializeBackButton();
  } else {
    single.style.display = 'flex';
    single.classList.remove('slide-out'); 
  }
}

window.addEventListener('resize', () => {
  const single = document.querySelector('.singleContact');
  const fab    = document.getElementById('fabContainer');

  if (isMobileView()) {
    if (single) single.style.display = 'none';
    if (fab)    fab.style.display    = '';
  } else {
    if (single) {
      single.style.display = 'flex';
      single.classList.remove('slide-in', 'slide-out');
    }
    if (fab) fab.style.display = 'none';
  }
});


function clearContactListUI() {
  $("allContacts").innerHTML = "";
  alphabetLettersUsedSet.clear();
}
function clearBigContactView() {
  $("bigContact").innerHTML = "";
}

function renderAllContacts(list) {
  sortContactsAlphabetically(list).forEach((c) =>
    renderContact(
      c.name,
      c.email,
      c.phone,
      c.initials,
      getFirstLetter(c.name),
      c.id,
      c.colorClass
    )
  );
}

function sortContactsAlphabetically(arr) {
  return [...arr].sort((a, b) =>
    a.name.localeCompare(b.name, "de", { sensitivity: "base" })
  );
}

export function showUserFeedback() {
  const el = $("userFeedback");
  if (!el) return;
  el.classList.remove("dp-none");
  el.classList.add("centerFeedback");
  el.addEventListener("animationend", () =>
    setTimeout(() => {
      el.classList.add("dp-none");
      el.classList.remove("centerFeedback");
    }, 1500)
  );
}

async function ensureColorClassAssignmentForAllContacts() {
  for (const c of contactList) {
    if (!c.colorClass) {
      c.colorClass = generateRandomColorClass();
      await updateContactInFirebase(c);
    }
  }
}

function loadUserInitialsDisplay() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) return;
  const btn = $("openMenu");
  if (btn) btn.textContent = getInitials(user.userName || "U");
}

function hideSingleContactView() {
  const single = document.querySelector('.singleContact');
  const fab    = document.getElementById('fabContainer');
  if (!single) return;
  single.classList.remove('slide-in');
  single.classList.add('slide-out');
  setTimeout(() => {
    single.style.display = 'none';
    if (fab) fab.style.display    = 'none';
  }, 300);
}
  function isMobileDevice() {
    return window.innerWidth <= 820;
  }

  function isLandscapeMode() {
    return window.matchMedia("(orientation: landscape)").matches;
  }

  function toggleRotateWarning() {
    const warning = document.getElementById("rotateWarning");
    const shouldShow = isMobileDevice() && isLandscapeMode();
    warning.style.display = shouldShow ? "flex" : "none";
  }

  window.addEventListener("orientationchange", toggleRotateWarning);
  window.addEventListener("resize", toggleRotateWarning);
  document.addEventListener("DOMContentLoaded", toggleRotateWarning);

