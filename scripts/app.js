import { loadData, postData, deleteData, requestData } from "./firebase.js";
import { formatFirebaseData, loadTasks } from "./utils/helpers.js";
import { createUser } from "./users/users.js";
import { loginListeners , signupListeners} from "./events/loginevents.js";

export async function init() {
  console.log("App initialized");
  loginListeners();
  signupListeners();
   requestData("POST","/users/", {userEmail: "test@guest.com", userName: "guest"});
}

init();

window.addEventListener("DOMContentLoaded", () => {
   document.getElementById("openMenu").addEventListener("click", closeOpenMenu);
});

function closeOpenMenu(){
  const element = document.getElementById("dropDownMenu");
  if (element.classList.contains("dp-none")) {
      document.getElementById(`dropDownMenu`).classList.remove("dp-none");
  } else {
    document.getElementById(`dropDownMenu`).classList.add("dp-none");
  }
} 