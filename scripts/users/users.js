import { requestData } from "../firebase.js";

export async function createNewUserAccount(newUserData) {
    const databaseResponse = await requestData("POST", "users", newUserData);
    return databaseResponse;
}

export async function getUserDataById(userIdentifier) {
  const userDataResponse = await requestData("GET", `/users/${userIdentifier}`);
  return userDataResponse.data;
}

export async function updateUserInformation(userIdentifier, updatedUserData) {
  return await requestData("PATCH", `users/${userIdentifier}`, updatedUserData);
}

export async function deleteUserAccount(userIdentifier) {
  return await requestData("DELETE", `/users/${userIdentifier}`);
}
