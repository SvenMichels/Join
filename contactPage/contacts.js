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

let contactList = [];
let currentlyEditingId = null;
const usedLetters = new Set();

window.contactList = contactList;

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("addBtn").addEventListener("click", openAddWindow);
  document
    .querySelectorAll(".cancelBtn, .closeBtn")
    .forEach(btn => btn.addEventListener("click", handleClose));
  document.getElementById("addContactForm").addEventListener("submit", addContact);
  document.getElementById("openMenu").addEventListener("click", closeOpenMenu);
  document
    .getElementById("editContactForm")
    .addEventListener("submit", handleEditSubmit);
  loadShowContact();
  await loadContactsFromFirebase();
  loadUserInitials();
});

function handleClose() {
  closeAddWindow();
  closeEditWindow();
}

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
  document.querySelector("#editWindow #contactName").value = "";
  document.querySelector("#editWindow #contactEmail").value = "";
  document.querySelector("#editWindow #contactPhone").value = "";
  currentlyEditingId = null;
}

function closeOpenMenu() {
  const element = document.getElementById("dropDownMenu");
  if (element.classList.contains("dp-none")) {
    document.getElementById(`dropDownMenu`).classList.remove("dp-none");
  } else {
    document.getElementById(`dropDownMenu`).classList.add("dp-none");
  }
}

async function loadContactsFromFirebase() {
  contactList = await loadContacts();
  renderAllContacts(contactList);

  if (contactList.length > 0) {
    const firstId = contactList[0].id;
    showContact(firstId);
    const firstCard = document.querySelector(`.contact[data-id="${firstId}"]`);
    if (firstCard) {
      firstCard.classList.add("active");
    }
  }
}

async function addContact(event) {
  event.preventDefault();
  const name = getName();
  const email = getEmail();
  const phone = getPhone();
  const initials = getInitials(name);
  const firstLetter = getFirstLetter(name);
  const contact = { name, email, phone, initials };

  try {
    const result = await createContact(contact);
    contact.id = result.data.name;
    contactList.push(contact);
    clearContactListUI();
    renderAllContacts(contactList);
    emptyInput();
    showUserFeedback();
  } catch (error) {
    console.error("Fehler beim Erstellen des Kontakts:", error);
    alert("Kontakt konnte nicht gespeichert werden.");
  }

   setTimeout(() => {
     closeAddWindow();
    }, 800);
  };


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

  console.log("Rendering contact card with ID:", id);
}

function renderSingleContact(name, email, phone, initials, id) {
  const bigContactRef = document.getElementById("bigContact");
  bigContactRef.innerHTML = singleContact(name, email, phone, initials, id);
  bindDeleteButton(bigContactRef);
  bindEditButton(bigContactRef);
}

function bindActionButton(container, buttonClass, callback) {
  const button = container.querySelector(buttonClass);

  if (!button) return;

  button.addEventListener("click", () => {
    const id = button.dataset.id;
    callback(id);
  });
}

function bindDeleteButton(container) {
  bindActionButton(container, ".deleteBtn", deleteContact);
}

function bindEditButton(container) {
  bindActionButton(container, ".editBtn", editContact);
}

function loadShowContact() {
  document
    .getElementById("allContacts")
    .addEventListener("click", function (event) {
      const contactCard = event.target.closest(".contact");
      if (contactCard) {
        document
          .querySelectorAll("#allContacts .contact.active")
          .forEach((el) => el.classList.remove("active"));
        contactCard.classList.add("active");
        const id = contactCard.dataset.id;
        console.log("Click on contactCard ID:", id);
        showContact(id);
      }
    });
}

function emptyInput() {
  document.getElementById("contactName").value = "";
  document.getElementById("contactEmail").value = "";
  document.getElementById("contactPhone").value = "";
}

async function deleteContact(id) {
  await deleteContactFromFirebase(id);
  contactList = removeContactById(contactList, id);
  clearContactListUI();
  renderAllContacts(contactList);
  clearBigContactView();
}

function removeContactById(list, id) {
  return list.filter((contact) => contact.id !== id);
}

function clearContactListUI() {
  document.getElementById("allContacts").innerHTML = "";
  usedLetters.clear();
}

function renderAllContacts(contacts) {
  const sortedContacts = sortContactsAlphabetically(contacts)
  for (const contact of sortedContacts) {
    renderContact(
      contact.name,
      contact.email,
      contact.phone,
      contact.initials,
      getFirstLetter(contact.name),
      contact.id
    );
  }
}

function clearBigContactView() {
  document.getElementById("bigContact").innerHTML = "";
}

function showContact(id) {
  const contact = contactList.find((contact) => contact.id === id);
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

function findContactById(id) {
  return contactList.find(c => String(c.id) === String(id));
}

function editContact(id) {
  const contact = findContactById(id);
  if (!contact) return;

  currentlyEditingId = id;
  fillEditForm(contact);
  openEditWindow();
}

function fillEditForm(contact) {
  const map = {
    contactName: contact.name,
    contactEmail: contact.email,
    contactPhone: contact.phone,
  };

  for (const [fieldId, value] of Object.entries(map)) {
    const input = document.querySelector(`#editWindow #${fieldId}`);
    if (input) input.value = value;
  }
}

function getEditContactInput() {
  return {
    name: getValueFromEdit("contactName"),
    email: getValueFromEdit("contactEmail"),
    phone: getValueFromEdit("contactPhone"),
  };
}

function getValueFromEdit(id) {
  return document.querySelector(`#editWindow #${id}`).value.trim();
}

function handleEditSubmit(event) {
  event.preventDefault();

  const contact = findContactById(currentlyEditingId);
  if (!contact) return;

  const updated = getEditContactInput();
  updateContact(contact, updated);
  rerenderAfterEdit(currentlyEditingId);
  showContact(currentlyEditingId);
  closeEditWindow();
}

async function updateContact(contact, updated) {
  Object.assign(contact, updated, {
    initials: getInitials(updated.name),
  });
  await updateContactInFirebase(contact);
}

function rerenderAfterEdit(id) {
  clearContactListUI();
  renderAllContacts(contactList);

  const updatedContact = findContactById(id);
  if (updatedContact) renderSingleContact(updatedContact);
}

function loadUserInitials(){
  const userString = localStorage.getItem("currentUser");
  if (!userString) return;
  const user = JSON.parse(userString);
  const name = user.userName || "Guest";
  const profileButton = document.getElementById("openMenu");
  if (profileButton) profileButton.textContent = getInitials(name);
}

function sortContactsAlphabetically(list) {
  return [...list].sort((a, b) =>
    a.name.localeCompare(b.name, "de", { sensitivity: "base" })
  );
}

// document.addEventListener("DOMContentLoaded", () => {
//   const signUpBtn = document.getElementById("submitBtn");
//   if (!signUpBtn) {
//     return;
//   }
//   signUpBtn.addEventListener("click", showUserFeedback);
// });

function showUserFeedback() {
  const feedback = document.getElementById("userFeedback");
  if (!feedback) return;

  feedback.classList.remove("dp-none");
  feedback.classList.add("centerFeedback");

  feedback.addEventListener("animationend", () => {
    setTimeout(() => {
      feedback.classList.add("dp-none");
      feedback.classList.remove("centerFeedback");
    }, 1500);
  });
}