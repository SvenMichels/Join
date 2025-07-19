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

export function openEditWindow() {
  let contact = currentlyBeingEditedContactId ? findContactById(currentlyBeingEditedContactId) : null;

  if (!contact) {
    const u = JSON.parse(localStorage.getItem("currentUser")) || {};
    contact = {
      id: u.id || null,
      name: u.userName || "",
      email: u.userEmail || "",
      phone: u.phoneNumber || "",
    };
  }
  currentlyBeingEditedContactId = contact.id;

  ["Name", "Email", "Phone"].forEach((f) => {
    const inp = document.querySelector(`#editWindow #contact${f}`);
    if (inp) inp.value = contact[f.toLowerCase()];
  });

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
    contactList.push({
      id: userWithColor.id,
      name: userWithColor.userName,
      email: userWithColor.userEmail,
      phone: userWithColor.phoneNumber || "–",
      initials: getInitials(userWithColor.userName),
      colorClass: userWithColor.colorClass,
    });
  }

  clearContactListUI();
  renderAllContacts(contactList);

  if (contactList.length) {
    const firstId = contactList[0].id;
    showContact(firstId);
    document
      .querySelector(`.contact[data-id="${firstId}"]`)
      ?.classList.add("active");
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
  $("bigContact").innerHTML = singleContact(
    name,
    email,
    phone || "–",
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

const bindDeleteButton = (c) => bindButton(c, ".deleteBtn", deleteContact);
const bindEditButton = (c) => bindButton(c, ".editBtn", editContact);

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

async function deleteContact(id) {
  await deleteContactFromFirebase(id);
  contactList = contactList.filter((c) => c.id !== id);

  clearContactListUI();
  renderAllContacts(contactList);
  clearBigContactView();
}

function editContact(id) {
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
    closeEditWindow();
  });
}

async function updateContact(contact, updated) {
  Object.assign(contact, updated, { initials: getInitials(updated.name) });
  await updateContactInFirebase(contact);
}

async function updateCurrentUser(updated) {
  const user = JSON.parse(localStorage.getItem("currentUser")) || {};
  const patched = {
    ...user,
    userName: updated.name,
    userEmail: updated.email,
    phoneNumber: updated.phone,
  };
  localStorage.setItem("currentUser", JSON.stringify(patched));

  tryIfIfBlock();
}

async function tryIfIfBlock() {
  try {
    const { updateUserInformation } = await import("../scripts/users/users.js");
    await updateUserInformation(patched.id, patched);
  } catch (_) {}

  const card = document.querySelector(`.contact[data-id='${patched.id}']`);
  if (card) {
    card.querySelector(".contactName").textContent = patched.userName;
    card.querySelector(".email").textContent = patched.userEmail;
  }
  if (document.querySelector("#profileName")?.textContent === user.userName) {
    renderSingleContact(
      patched.userName,
      patched.userEmail,
      patched.phoneNumber,
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
}

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


