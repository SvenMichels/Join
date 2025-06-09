function showSubMenu() {
  let subMenu = document.getElementById("subMenuContainer");
  subMenu.classList.toggle("d_none");
}

function changeToPolicy() {
  window.location.href = "../privatpolicy.html";
}

function changeToLegalNotice() {
  window.location.href = "../legalnotice.html";
}



// if (window.location.pathname.endsWith("addtask.html")) {
//   initAddtask();
// }

// function initAddtask() {
//   addEventListener();
// }

// export function addEventListener() {
//   const input = document.getElementById("taskName");
//   const error = document.getElementById("errorMessage");

//   input.addEventListener("errorMessage", () => {
//     if (input.validity.valid) {
//       error.style.display = "none";
//     }else {
//       error.style.display = "block";
//     }
//   })};
