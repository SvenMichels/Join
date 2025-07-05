import { getUser, updateUser } from "../scripts/users/users.js"; 
import { renderContact, getInitials, openEditWindow } from "./contacts.js"; 

document.addEventListener("DOMContentLoaded", async () => {
    currentUserCards();
    document.getElementById("edit").addEventListener("click", openEditWindow);
    document.getElementById("editSubmitBtn").addEventListener("click", getDataToStoreNewData);
});

function currentUserCards() {
    const currentUserJSON = localStorage.getItem("currentUser");
    const currentUser = JSON.parse(currentUserJSON);
    if (!currentUser) return;

    pushUserDataToTemplate(currentUser);
}

function pushUserDataToTemplate(currentUser) {
    const name = currentUser.userName;
    const email = currentUser.userEmail;
    const phone = currentUser.phoneNumber || "–";
    const initials = getInitials(name);
    const firstLetter = name[0]?.toUpperCase() || "";
    const id = currentUser.id;
    const colorClass = currentUser.colorClass || getRandomColorClass();

    renderContact(name, email, phone, initials, firstLetter, id, colorClass);
}

function getDataToStoreNewData() {
    const currentUserJSON = localStorage.getItem("currentUser");
    const currentUser = JSON.parse(currentUserJSON);
    if (!currentUser) return;

    const id = currentUser.id;
    const name = document.getElementById("contactName").value;
    const email = document.getElementById("contactEmail").value;
    const phone = document.getElementById("contactPhone").value;

    newDataToJson(name, email, phone, id);
}

function newDataToJson(name, email, phone, id) {
    const initials = getInitials(name);
    const firstLetter = name[0]?.toUpperCase() || "";

    const currentUserJSON = localStorage.getItem("currentUser");
    const currentUser = JSON.parse(currentUserJSON) || {};

    const colorClass = currentUser.colorClass || getRandomColorClass();

    const updatedUser = {
        userName: name,
        userEmail: email,
        phoneNumber: phone,
        id: id,
        initials: initials,
        firstLetter: firstLetter,
        colorClass: colorClass,
    };

    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    storeNewData(updatedUser);
}

function storeNewData(updatedUser) {
    console.log("Aktualisiere Daten für:", updatedUser);

    const payload = {
        userName: updatedUser.userName,
        userEmail: updatedUser.userEmail,
        phoneNumber: updatedUser.phoneNumber,
        colorClass: updatedUser.colorClass
    };

    updateUser(updatedUser.id, payload)
        .then(() => {
            localStorage.setItem("currentUser", JSON.stringify(updatedUser));
            pushUserDataToTemplate(updatedUser);
            alert("Daten erfolgreich aktualisiert!");
        })
        .catch((error) => {
            console.error("Fehler beim Aktualisieren der Daten:", error);
            alert("Fehler beim Aktualisieren der Daten. Bitte versuche es erneut.");
        });
}

function getRandomColorClass() {
    const totalColors = 20;
    const randomIndex = Math.floor(Math.random() * totalColors) + 1;
    return `color-${randomIndex}`;
}
