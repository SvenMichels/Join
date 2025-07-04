import { getUser, updateUser } from "../scripts/users/users.js"; // user daten bekommen und aktualisieren
import { renderContact, getInitials, openEditWindow} from "./contacts.js"; //rendern des eigenen Kontakts und aktualisieren

document.addEventListener("DOMContentLoaded", async() =>  {
    currentUserCards();
    document.getElementById("edit").addEventListener("click", openEditWindow);
    document.getElementById("editSubmitBtn").addEventListener("click", getDataToStoreNewData);
});

function currentUserCards() {
let currentUserJSON = localStorage.getItem("currentUser");
let currentUser = JSON.parse(currentUserJSON);

pushUserDataToTemplate(currentUser);
}

function pushUserDataToTemplate(currentUser){
    const name = currentUser.userName;
    const email = currentUser.userEmail;
    const phone = currentUser.phoneNumber;
    const initials = getInitials(name);
    const firstLetter = name[0].toUpperCase();
    const id = currentUser.id;

    renderContact(name, email,  phone, initials, firstLetter, id);
}

function getDataToStoreNewData() {
    let currentUserJSON = localStorage.getItem("currentUser");
    let currentUser = JSON.parse(currentUserJSON);
    const id = currentUser.id;

    const name = currentUser.userName;
    const email = currentUser.userEmail;
    const phone = currentUser.phoneNumber;

    newDataToJson(name, email, phone, id);
}

function storeNewData(updatedUser) {
console.log("Aktualisiere Daten für:", updatedUser);
    updateUser(updatedUser.id, updatedUser.name, updatedUser.email, updatedUser.phoneNumber)
        .then(() => {
            localStorage.setItem("currentUser", JSON.stringify(updatedUser.phoneNumber));
            pushUserDataToTemplate(updatedUser);
            alert("Daten erfolgreich aktualisiert!");
        })
        .catch((error) => {
            console.error("Fehler beim Aktualisieren der Daten:", error);
            alert("Fehler beim Aktualisieren der Daten. Bitte versuche es erneut.");
        });
}

function newDataToJson(name, email, phone, id) {
    const initials = getInitials(name);
    const firstLetter = name[0]?.toUpperCase() || "";
    const updatedUser = {
        userName: name,
        userEmail: email,
        phoneNumber: phone,
        id: id,
        initials: initials,
        firstLetter: firstLetter,
    };

    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    storeNewData (updatedUser);
}