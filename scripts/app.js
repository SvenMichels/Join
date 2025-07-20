import { requestData } from "./firebase.js";
import { formatFirebaseDataToArray, loadAllTasksFromDatabase } from "./utils/helpers.js";
import { createNewUserAccount } from "./users/users.js";
import { loginListeners , signupListeners} from "./events/loginevents.js";

// Initialize the app
export async function init() {
  loginListeners();
  signupListeners();
}

init();