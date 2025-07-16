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
import { getRandomColorClass, ensureUserHasColor } from "../scripts/utils/colors.js";
import { initializeBackButton, initializeFabMenu } from "../scripts/ui/fabContact.js";
import { isMobileView } from "../scripts/utils/mobileView.js";
import { setupDropdown } from "../scripts/ui/dropdown.js";
import { highlightActiveLinks } from "../scripts/utils/navUtils.js";

let contactList = [];
let currentlyEditingId = null;
const usedLetters = new Set();

window.contactList = contactList;

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("addBtn").addEventListener("click", openAddWindow);
  document.querySelectorAll(".cancelBtn, .closeBtn").forEach((btn) => btn.addEventListener("click", handleClose));
  document.getElementById("addContactForm").addEventListener("submit", addContact);
  setupDropdown('#openMenu', '#dropDownMenu');
  document.getElementById("editContactForm").addEventListener("submit", handleEditSubmit);

  loadShowContact();
  await loadContactsFromFirebase();
  await ensureColorClassForAllContacts();
  loadUserInitials();
  highlightActiveLinks();
});

function handleClose() {
  closeAddWindow();
  closeEditWindow();
}
function openAddWindow() {
  document.getElementById("addWindow").classList.remove("dp-none");
}
function closeAddWindow() {
  document.getElementById("addWindow").classList.add("dp-none");
}
function closeEditWindow() {
  document.getElementById("editWindow").classList.add("dp-none");
}

export function openEditWindow() {
  let contact = currentlyEditingId ? findContactById(currentlyEditingId) : null;

  if (!contact) {
    const u = JSON.parse(localStorage.getItem("currentUser")) || {};
    contact = {
      id: u.id || null,
      name: u.userName || "",
      email: u.userEmail || "",
      phone: u.phoneNumber || "",
    };
  }
  currentlyEditingId = contact.id;

  ["Name", "Email", "Phone"].forEach((f) => {
    const inp = document.querySelector(`#editWindow #contact${f}`);
    if (inp) inp.value = contact[f.toLowerCase()];
  });

  document.getElementById("editWindow").classList.remove("dp-none");
}

async function loadContactsFromFirebase() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
  contactList = await loadContacts();

  for (let contact of contactList) {
    await ensureUserHasColor(contact);
  }

  if (currentUser.id && !contactList.some((c) => c.id === currentUser.id)) {
    const userWithColor = await ensureUserHasColor(currentUser);
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
    if (!isMobileView) {
      showContact(firstId);
      document
        .querySelector(`.contact[data-id="${firstId}"]`)
        ?.classList.add("active");
    }
  }
}

async function addContact(e) {
  e.preventDefault();
  const name = getName();
  const contact = {name, email: getEmail(), phone: getPhone(), initials: getInitials(name), colorClass: getRandomColorClass(),};

  try {
    await addContactTry(contact);
  } catch (error) {
    console.warn("Fehler beim Erstellen des Kontakts:", error);
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

export function getInitials(name) {
  const [a = "", b = ""] = name.split(" ").filter(Boolean);
  return (a[0] || "").toUpperCase() + (b[0] || "").toUpperCase();
}

function getFirstLetter(name) {
  return name[0]?.toUpperCase() || "";
}

export function renderContact(name, email, phone, initials, firstLetter, id, colorClass) {
  renderAlphabetFilter(firstLetter);
  renderContactCard(name, email, initials, id, colorClass);
  renderSingleContact(name, email, phone, initials, id, colorClass);
}

function renderAlphabetFilter(letter) {
  if (usedLetters.has(letter)) return;
  usedLetters.add(letter);
  $("allContacts").innerHTML += alphabetfilter(letter);
}

function renderContactCard(name, email, initials, id, colorClass) {
  $("allContacts").innerHTML += contactCard( name, email, initials, id, colorClass);
}
function renderSingleContact(name, email, phone, initials, id, colorClass) {
  $("bigContact").innerHTML = singleContact(name, email, phone || "–", initials, id, colorClass);
  bindDeleteButton($("bigContact"));
  bindEditButton($("bigContact"));
}

function bindButton(container, selector, cb) {
  const btn = container.querySelector(selector);
  if (btn) btn.addEventListener("click", () => cb(btn.dataset.id));
}

const bindDeleteButton = (c) => bindButton(c, ".deleteBtn", deleteContact);
const bindEditButton = (c) => bindButton(c, ".editBtn", editContact);

function loadShowContact() {
  $("allContacts").addEventListener("click", (e) => {
    const card = e.target.closest(".contact");
    if (!card) return;
    document.querySelectorAll("#allContacts .contact.active").forEach((c) => c.classList.remove("active"));
    card.classList.add("active");
    showContact(card.dataset.id);
  });
}

export async function deleteContact(id) {
  await deleteContactFromFirebase(id);
  contactList = contactList.filter((c) => c.id !== id);

  clearContactListUI();
  renderAllContacts(contactList);
  clearBigContactView();
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
    editContactIf(contact)
    return;
  }
  currentlyEditingId = id;
  fillEditForm(contact);
  openEditWindow();
}

function editContactIf(contact){
    currentlyEditingId = null;
    openEditWindow();
}

function fillEditForm(c) {
  const map = {contactName: c.name, contactEmail: c.email, contactPhone: c.phone,};
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

function handleEditSubmit(e) {
  e.preventDefault();

  const updated = getEditContactInput();
  const contact = findContactById(currentlyEditingId);

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
      loadUserInitials();
      closeEditWindow();
    });
}

async function updateContact(contact, updated) {
  Object.assign(contact, updated, { initials: getInitials(updated.name) });
  await updateContactInFirebase(contact);
}

async function updateCurrentUser(updated) {
  const user = JSON.parse(localStorage.getItem("currentUser")) || {};
  const patched = {...user, userName: updated.name, userEmail: updated.email, phoneNumber: updated.phone,};
  localStorage.setItem("currentUser", JSON.stringify(patched));

 tryIfIfBlock()
}

async function tryIfIfBlock() {
   try {
    const { updateUser } = await import("../scripts/users/users.js");
    await updateUser(patched.id, patched);
  } catch (_) {}

  const card = document.querySelector(`.contact[data-id='${patched.id}']`);
  if (card) {
    card.querySelector(".contactName").textContent = patched.userName;
    card.querySelector(".email").textContent = patched.userEmail;
  }
  if (document.querySelector("#profileName")?.textContent === user.userName) {
    renderSingleContact(patched.userName, patched.userEmail, patched.phoneNumber, getInitials(patched.userName), patched.id, patched.colorClass || getRandomColorClass());
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
  renderSingleContact(c.name, c.email, c.phone, c.initials, c.id, c.colorClass || getRandomColorClass());

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
  usedLetters.clear();
}
function clearBigContactView() {
  $("bigContact").innerHTML = "";
}

function renderAllContacts(list) {
  sortContactsAlphabetically(list).forEach((c) =>
    renderContact(c.name, c.email, c.phone, c.initials, getFirstLetter(c.name), c.id, c.colorClass));
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

async function ensureColorClassForAllContacts() {
  for (const c of contactList) {
    if (!c.colorClass) {
      c.colorClass = getRandomColorClass();
      await updateContactInFirebase(c);
    }
  }
}

function loadUserInitials() {
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

