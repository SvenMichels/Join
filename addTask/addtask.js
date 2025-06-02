function showSubMenu() {
  let subMenu = document.getElementById('subMenuContainer');
  subMenu.classList.toggle('d_none');
}

function changeToPolicy() {
  window.location.href = '../privatPolicy.html';
}

function changeToLegalNotice() {
  window.location.href = '../impressum.html';
}


// export function addEventListener(input1, input2) {
//   const input = document.getElementById("input1");
//   const error = document.querySelector(".error-message");

//   input.addEventListener("input2", () => {
//     if (input.validity.valid) {
//       error.style.display = "none";
//     } else {
//       error.style.display = "block";
//     }
//   });
// }

  // const input = document.getElementById("input1");
  // const error = document.querySelector(".error-message");

  // input.addEventListener("input2", () => {
  //   if (input.validity.valid) {
  //     error.style.display = "none";
  //   } else {
  //     error.style.display = "block";
  //   }
  // });
