import { alphabetfilter, contactCard, singleContact } from './contactTemplate.js';

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("addBtn").addEventListener("click", openAddWindow);
  document.getElementById("closeBtn").addEventListener("click", closeAddWindow, closeEditWindow);
  document.getElementById("submitBtn").addEventListener("click", addContact);
 });

document.getElementById("bigContactCard").addEventListener("DOMContentLoaded", () => {
  document.getElementById("edit").addEventListener("click", openEditWindow);
});

function openAddWindow() {
  document.getElementById(`addWindow`).classList.remove("dp-none");
}

function closeAddWindow() {
  document.getElementById(`addWindow`).classList.add("dp-none");
}

function openEditWindow() {
  document.getElementById(`editWindow`).classList.remove("dp-none");
}

function closeEditWindow() {
  document.getElementById(`editWindow`).classList.add("dp-none");
}

function addContact(event) {
  event.preventDefault();
  const name = getName();
  const email = getEmail();
  const phone = getPhone();
  const initials = getInitials(name);
  const firstLetter = getFirstLetter(name);

  renderContact(name, email, phone, initials, firstLetter);
  emptyInput();
  closeAddWindow();
}

function getName() {
 return document.getElementById("contactName").value.trim();
}

function getEmail() {
  return document.getElementById("contactEmail").value.trim();
}

function getPhone() {
  return document.getElementById("contactPhone").value.trim();
}

function getInitials(name) {
  const words = name.split(" ").filter(Boolean);
  const first = words[0]?.[0]?.toUpperCase() || "";
  const second = words[1]?.[0]?.toUpperCase() || "";
  return first + second;
}

function getFirstLetter(name) {
  return name[0]?.toUpperCase() || "";
}

const usedLetters = new Set();

function createAlphabetFilterIfNeeded(letter) {
  if (!usedLetters.has(letter)) {
    usedLetters.add(letter);
    return alphabetfilter(letter);
  }
  return "";
}

function renderContact(name, email, phone, initials, firstLetter) {
  renderAlphabetFilter(firstLetter);
  renderContactCard(name, email, initials);
  renderSingleContact(name, email, phone, initials);
}

function renderAlphabetFilter(firstLetter) {
  if (usedLetters.has(firstLetter)) return;
  usedLetters.add(firstLetter);
  document.getElementById("allContacts").innerHTML += alphabetfilter(firstLetter);
}

function renderContactCard(name, email, initials) {
  const allContactsRef = document.getElementById("allContacts");
  allContactsRef.innerHTML += contactCard(name, email, initials);
}

function renderSingleContact(name, email, phone, initials) {
  const bigContactRef = document.getElementById("bigContact");
  bigContactRef.innerHTML = singleContact(name, email, phone, initials);
}

function emptyInput() {
  document.getElementById('contactName').value = "";
  document.getElementById('contactEmail').value = "";
  document.getElementById('contactPhone').value = "";
}