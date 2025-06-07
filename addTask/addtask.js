function showSubMenu() {
  let subMenu = document.getElementById("subMenuContainer");
  subMenu.classList.toggle("d_none");
}

function changeToPolicy() {
  window.location.href = "../privatPolicy.html";
}

function changeToLegalNotice() {
  window.location.href = "../impressum.html";
}

if (window.location.pathname.endsWith("addtask.html")) {
  initAddtask();
}

function initAddtask() {
  addEventListener();
}

export function addEventListener() {
  const input = document.getElementById("titleInput");
  const error = document.querySelector(".error-message");

  input.addEventListener("error-message", () => {
    if (input.validity.valid) {
      error.style.display = "none";
    } else {
      error.style.display = "block";
    }
  });
}
