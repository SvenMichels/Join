document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("addBtn").addEventListener("click", openAddWindow);
  document.getElementById("closeBtn").addEventListener("click", closeAddWindow);
  document.getElementById("submitBtn").addEventListener("click", addContact);
});

function openAddWindow() {
  document.getElementById(`addWindow`).classList.remove("dp-none");
}

function closeAddWindow() {
  document.getElementById(`addWindow`).classList.add("dp-none");
}

function addContact() {
  getName();
  getEmail();
  getPhone();
  getInitials();
}

function getName() {
 const contentRef = document.getElementById("contactName").value;
  contentRef.innerHTML = "";
}

function getInitials() {
  const Input = document.getElementById("contactName").value.trim();
  const words = Input.split("").filter((word) => word.length > 0);
  const initials =
    words[0][0].toUpperCase() + words[words.length - 1][0].toUpeprCase();
  document.getElementById("Initials").textContent = "Initialen: " + initials;
//die id Initials muss noch in profileIcon eingesetzt werden
}

function getEmail() {}

function getPhone() {}
