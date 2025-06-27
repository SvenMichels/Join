import { getUser, updateUser } from "../scripts/users/users.js"; // user daten bekommen und aktualisieren
import { renderContact, getInitials, openEditWindow} from "./contacts.js"; //rendern des eigenen Kontakts und aktualisieren

document.addEventListener("DOMContentLoaded", async() =>  {
    currentUserCards();
    document.getElementById("edit").addEventListener("click", openEditWindow);
});

function currentUserCards() {
let currentUserJSON = localStorage.getItem("currentUser");
let currentUser = JSON.parse(currentUserJSON);

pushUserDataToTemplate(currentUser);
console.log("currentUser.id:", currentUser.userName);
console.log("currentUser:", currentUser);
}

function pushUserDataToTemplate(currentUser){
    const name = currentUser.userName;
    const email = currentUser.userEmail;
    const phone = currentUser.phoneNumber;
    const initials = getInitials(name);
    const firstLetter = name[0].toUpperCase();
    const id = currentUser.id;

    renderContact(name, email, phone, initials, firstLetter, id);
}
// daten verarbeiten und ins Template einsetzen