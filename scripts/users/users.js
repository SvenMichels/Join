import { requestData } from "../firebase.js";
// import { getNewUserInput } from "../../signup/signup.js";

export async function createUser(userData) {
  // try {
    const response = await requestData("POST", "/users", userData); // Firebase erzeugt automatisch eine ID

  //   const customId = response.data.name; // 'name' enthält die Firebase-ID
  //   const userWithId = { ...userData, id: customId };

  //   return await requestData("PUT", `/users/${customId}`, userWithId);
  // } catch (error) {
  //   console.log("Error creating user:", error);
  //   throw error;
  }
// }

export async function getUser(userId) {
  const response = await requestData("GET", `/users/${userId}`);
  return response.data;
}

export async function updateUser(userId, updatedData) {
  return await requestData("PATCH", `/users/${userId}`, updatedData);
}

export async function deleteUser(userId) {
  return await requestData("DELETE", `/users/${userId}`);
}
