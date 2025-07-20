import { requestData} from "../scripts/firebase.js";

export async function createContact(contactData) {
  const currentUserString = localStorage.getItem("currentUser");
  const currentUserData = JSON.parse(currentUserString);
  if (!currentUserData?.id) throw new Error("Kein eingeloggter Benutzer");

  const apiPath = `contacts/${currentUserData.id}`;
  const creationResult = await requestData("POST", apiPath, contactData);
  return creationResult;
}
  
export async function loadContacts() {
  const currentUserString = localStorage.getItem("currentUser");
  const currentUserData = JSON.parse(currentUserString);
  if (!currentUserData?.id) return [];

  const contactsResponse = await requestData("GET", `contacts/${currentUserData.id}`);
  const contactsRawData = contactsResponse.data;
  const contactEntriesArray = Object.entries(contactsRawData || {});
  const processedContactsList = [];
  
  for (let entryIndex = 0; entryIndex < contactEntriesArray.length; entryIndex++) {
    const [contactKey, contactValue] = contactEntriesArray[entryIndex];
    processedContactsList.push({
      ...contactValue,
      id: contactKey,
    });
  }
  
  return processedContactsList;
}

export async function updateContactInFirebase(contact) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user?.id)
  await requestData("PUT", `contacts/${user.id}/${contact.id}`, contact)
}

export async function deleteContactFromFirebase(contactId) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user?.id) {
    throw new Error("No current user found");
  }
  
  const deleteResult = await requestData("DELETE", `contacts/${user.id}/${contactId}`);
  return deleteResult;
}