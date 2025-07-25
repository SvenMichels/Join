import { loginListeners , signupListeners} from "./events/loginevents.js";

// Initialize the app
export async function init() {
  loginListeners();
  signupListeners();
}

init();