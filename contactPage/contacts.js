import {
  alphabetfilter,
  contactCard,
  singleContact,
} from "./contactTemplate.js";
import { requestData } from "../scripts/firebase.js";
import { createUser } from "../scripts/users/users.js";

let contactList = []; //muss später in der datenbank gespeichtert und aufgerufen werden können (rendern)
let contactIdCounter = 0; //test //muss theoretisch auch geladen werden

const usedLetters = new Set();

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("addBtn").addEventListener("click", openAddWindow);
  document.getElementById("closeBtn").addEventListener("click", closeAddWindow, closeEditWindow);
  document.getElementById("submitBtn").addEventListener("click", addContact);
  document.getElementById("openMenu").addEventListener("click", closeOpenMenu)
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

function closeOpenMenu(){
  const element = document.getElementById("dropDownMenu");
  if (element.classList.contains("dp-none")) {
      document.getElementById(`dropDownMenu`).classList.remove("dp-none");
  } else {
    document.getElementById(`dropDownMenu`).classList.add("dp-none");
  }
}

async function addContact(event) {
  event.preventDefault();
  const name = getName();
  const email = getEmail();
  const phone = getPhone();
  const initials = getInitials(name);
  const firstLetter = getFirstLetter(name);
  const id = contactIdCounter++;

  const contact = { name, email, phone, initials, id };
  contactList.push(contact);
  // const contactData = { name, email, phone, initials};

  try {
    await createUser(contactData);
    renderContact(name, email, phone, initials, firstLetter);
    emptyInput();
    closeAddWindow();
  } catch (error) {
    console.error("Fehler beim Erstellen des Kontakts:", error);
    alert("Kontakt konnte nicht gespeichert werden.");
  }
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

function renderContact(name, email, phone, initials, firstLetter, id) {
  renderAlphabetFilter(firstLetter);
  renderContactCard(name, email, initials, id);
  renderSingleContact(name, email, phone, initials, id);
}

function renderAlphabetFilter(firstLetter) {
  if (usedLetters.has(firstLetter)) return;
  usedLetters.add(firstLetter);
  document.getElementById("allContacts").innerHTML +=
    alphabetfilter(firstLetter);
}

function renderContactCard(name, email, initials, id) {
  const allContactsRef = document.getElementById("allContacts");
  allContactsRef.innerHTML += contactCard(name, email, initials, id);
}

function renderSingleContact(name, email, phone, initials, id) {
  const bigContactRef = document.getElementById("bigContact");
  bigContactRef.innerHTML = singleContact(name, email, phone, initials, id);

  document.addEventListener("click", function (event) {
    if (event.target.matches(".deleteBtn")) {
      const id = parseInt(event.target.dataset.id);
      deleteContact(id);
    }
  });
}

function emptyInput() {
  document.getElementById("contactName").value = "";
  document.getElementById("contactEmail").value = "";
  document.getElementById("contactPhone").value = "";
}

function deleteContact(id) {
  // Gesuchten Kontakt aus dem contactList-Array entfernen
  contactList = contactList.filter((contact) => contact.id !== id);

  // UI neu aufbauen
  document.getElementById("allContacts").innerHTML = "";
  usedLetters.clear();

  for (const contact of contactList) {
    renderContact(
      contact.name,
      contact.email,
      contact.phone,
      contact.initials,
      getFirstLetter(contact.name),
      contact.id
    );
  }

  // Einzelansicht zurücksetzen
  document.getElementById("bigContact").innerHTML = "";
}

function showContact(id) {
  const contact = contacts.find((c) => c.id === id);
  if (contact) {
    renderSingleContact(
      contact.name,
      contact.email,
      contact.phone,
      contact.initials,
      contact.id
    );
  }
}