import { requestData} from "../scripts/firebase.js";

export async function createContact(contact) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user?.id) throw new Error("Kein eingeloggter Benutzer");

  const path = `contacts/${user.id}`;
  const result = await requestData("POST", path, contact);
  return result;
}
  
export async function loadContacts() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user?.id) return [];

  const response = await requestData("GET", `contacts/${user.id}`);
  const data = response.data;
  return Object.entries(data || {}).map(([key, value]) => ({
    ...value,
    id: key,
  }));
}

export async function updateContactInFirebase(contact) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user?.id)
  await requestData("PUT", `contacts/${user.id}/${contact.id}`, contact)
}

export async function deleteContactFromFirebase(contactId) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user?.id)
  await requestData("DELETE", `contacts/${user.id}/${contactId}`)
}