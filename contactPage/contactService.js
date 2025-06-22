import { 
    postData, 
    loadData, 
    deleteData, 
    putData } from "../scripts/firebase.js";

export async function createContact(contact) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user?.id) throw new Error("Kein eingeloggter Benutzer");

  const path = `contacts/${user.id}`;
  const result = await postData(path, contact);
  return result; // enthÃ¤lt Firebase-generierte ID
}

export async function loadContacts() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user?.id) return [];

  const data = await loadData(`contacts/${user.id}`);
  return Object.entries(data || {}).map(([key, value]) => ({
    ...value,
    id: key,
  }));
}

export async function updateContactInFirebase(contact) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user?.id) throw new Error("Kein eingeloggter Benutzer");

  await putData(`contacts/${user.id}/${contact.id}`, contact);
}

export async function deleteContactFromFirebase(contactId) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user?.id) throw new Error("Kein eingeloggter Benutzer");

  await deleteData(`contacts/${user.id}/${contactId}`);
}