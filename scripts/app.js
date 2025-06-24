import { loadData, postData, deleteData, requestData } from "./firebase.js";
import { formatFirebaseData, loadTasks } from "./utils/helpers.js";
import { createUser } from "./users/users.js";
import { loginListeners , signupListeners} from "./events/loginevents.js";

export async function init() {
  console.log("App initialized");
  loginListeners();
  signupListeners();
  //  requestData("POST","/users/", {userEmail: "test@guest.com", userName: "guest"});
}

init();