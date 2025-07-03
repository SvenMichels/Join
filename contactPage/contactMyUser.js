import { getUser, updateUser } from "../scripts/users/users.js"; // user daten bekommen und aktualisieren
import { renderContact, getInitials, openEditWindow} from "./contacts.js"; //rendern des eigenen Kontakts und aktualisieren

document.addEventListener("DOMContentLoaded", async() =>  {
    currentUserCards();
    document.getElementById("edit").addEventListener("click", openEditWindow);
    document.getElementById("editSubmitBtn").addEventListener("click", storeNewData);
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

function storeNewData(name, email, phone) {
    let currentUserJSON = localStorage.getItem("currentUser");
    let currentUser = JSON.parse(currentUserJSON);

    currentUser.userName = name;
    currentUser.userEmail = email;
    currentUser.phoneNumber = phone;

    updateUser(currentUser)
        .then(() => {
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
            pushUserDataToTemplate(currentUser);
            alert("Daten erfolgreich aktualisiert!");
        })
        .catch((error) => {
            console.error("Fehler beim Aktualisieren der Daten:", error);
            alert("Fehler beim Aktualisieren der Daten. Bitte versuche es erneut.");
        });
    
}