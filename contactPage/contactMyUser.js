import { getUser, updateUser } from "../scripts/users/users.js"; // user daten bekommen und aktualisieren
import { renderContact} from "./contacts.js"; //rendern des eigenen Kontakts und aktualisieren

document.addEventListener("DOMContentLoaded", async() =>  {
    currentUserCards();
});

function currentUserCards() {
let currentUserJSON = localStorage.getItem("currentUser");
let currentUser = JSON.parse(currentUserJSON);

console.log("currentUser.id:", currentUser.id);
console.log("currentUser:", currentUser);
}

