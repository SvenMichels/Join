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

if (windows.location.pathname.enndsWith("addtask.html")) {
  initAddtask();
}

function initAddtask {
  addEventListener();
}

export function addEventListener() {
  const input = document.getElementById("taskName");
  const error = document.getElementById("errorMessage");

  input.addEventListener("errorMessage", () => {
    if (input.validity.valid) {
      error.style.display = "none";
    }else {
      error.style.display = "block";
    }
  })};

function validateDataAndSave() {
  const taskName = document.getElementById("taskName");
  const taskDescription = document.getElementById("taskDescription");
  const dateInput = document.getElementById("taskDate");

  const userSelectedName = taskName.value;
  const userSelectedDesc = taskDescription.value;
  const userSelectedDate = dateInput.value;

  if(userSelectedName === ""){
    alert("Please Select a Title.")
  }else if(userSelectedDesc === "")
    {alert("Please Add a Description.")
  }else if(userSelectedDate === ""){
    alert("Please Add a Date.")
  }else {
    alert("Your Task was Addet to your Board")
  }
}