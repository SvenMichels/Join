import { loadData, postData, deleteData, requestData } from "./firebase.js";
import { formatFirebaseData, loadTasks } from "./utils/helpers.js";
import { createUser } from "./users/users.js";
// import { getNewUserInput } from "../signup/signup.js";
import { loginListeners } from "./events/loginevents.js";

export async function init() {
  console.log("App initialized");

}

init();

// async function randomTest() {
//   const response = await requestData("POST", "/users/", {
//     userName: "test User",
//     userEmail: "blabla@bla.com",
//     userAssignedTo: "",
//     password: "123",
//     userTelephone: "0123456789",
//   });
//   const userId = response.data.name;

//   await requestData("PATCH", `/users/${userId}`, {
//     id: userId + "RANDOMUSERID",
//   });
// }

//   requestData("PUT", "tasks", {
//     taskHead: "Random Task",
//     taskDescription: "This is a random task description.",
//     taskStatus: "open",
//     taskPriority: "high",
//     taskDueDate: "2023-12-31",
//     taskCreatedAt: "2023-10-01T12:00:00Z",
//     taskCreatedBy: "Sven Michels",
//     taskAssignedTo: "Sven Michels",
//     taskCategory: "General",
//     taskTags: ["example", "task"],
//     taskComments: [
//       {
//         commentText: "This is a comment on the task.",
//         commentAuthor: "Sven Michels",
//         commentCreatedAt: "2023-10-01T12:00:00Z",
//       },
//     ],
//     taskAttachments: [
//       {
//         attachmentName: "example.txt",
//         attachmentUrl: "https://example.com/attachment.txt",
//         attachmentUploadedAt: "2023-10-01T12:00:00Z",
//       },
//     ],
//     taskInfo: "This is additional information about the task.",
//   });

//   requestData("PUT", "users", {
//     name: "Sven Michels",
//     email: "",
//     role: "admin",
//     createdAt: "2023-10-01T12:00:00Z",
//     lastLogin: "2023-10-01T12:00:00Z",
//     profilePicture: "https://example.com/profile.jpg",
//     tasksAssigned: ["task1", "task2"],
//     tasksCreated: ["task1", "task2"],
//     tasksCompleted: ["task1"],
//     tasksInProgress: ["task2"],
//     tasksArchived: ["task1"],
//     tasksDeleted: ["task1"],
//     tasksShared: ["task1", "task2"],
//     tasksCollaborated: ["task1", "task2"],
//     tasksComments: [
//       {
//         commentText: "This is a comment on the user profile.",
//         commentAuthor: "Sven Michels",
//         commentCreatedAt: "2023-10-01T12:00:00Z",
//       },
//     ],
//     tasksAttachments: [
//       {
//         attachmentName: "example.txt",
//         attachmentUrl: "https://example.com/attachment.txt",
//         attachmentUploadedAt: "2023-10-01T12:00:00Z",
//       },
//     ],
//     tasksInfo: "This is additional information about the user.",
//   });
