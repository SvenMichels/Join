import { loadData, postData, deleteData, requestData } from "./firebase.js";
import { formatFirebaseData, loadTasks } from "./utils/helpers.js";
import { createUser } from "./users/users.js";
import { getNewUserInput } from "../signup/signup.js";
import { loginListeners } from "./events/loginevents.js";

export async function init() {
  console.log("App initialized");
  loginListeners();

}

init();
