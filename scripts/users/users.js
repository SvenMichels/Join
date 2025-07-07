import { requestData } from "../firebase.js";

export async function createUser(userData) {
    const response = await requestData("POST", "users", userData);
  }

export async function getUser(userId) {
  const response = await requestData("GET", `/users/${userId}`);
  return response.data;
}

export async function updateUser(userId, updatedData) {
  return await requestData("PATCH", `users/${userId}`, updatedData);
}

export async function deleteUser(userId) {
  return await requestData("DELETE", `/users/${userId}`);
}
