import { loadData, postData, deleteData, requestData } from "./firebase.js";

export function init() {
  console.log("App initialized");

  requestData("PUT", "tasks", {
    taskHead: "Random Task",
    taskDescription: "This is a random task description.",
    taskStatus: "open",
    taskPriority: "high",
    taskDueDate: "2023-12-31",
    taskCreatedAt: "2023-10-01T12:00:00Z",
    taskCreatedBy: "Sven Michels",
    taskAssignedTo: "Sven Michels",
    taskCategory: "General",
    taskTags: ["example", "task"],
    taskComments: [
      {
        commentText: "This is a comment on the task.",
        commentAuthor: "Sven Michels",
        commentCreatedAt: "2023-10-01T12:00:00Z",
      },
    ],
    taskAttachments: [
      {
        attachmentName: "example.txt",
        attachmentUrl: "https://example.com/attachment.txt",
        attachmentUploadedAt: "2023-10-01T12:00:00Z",
      },
    ],
    taskInfo: "This is additional information about the task.",
  });

  requestData("PUT", "users", {
    name: "Sven Michels",
    email: "",
    role: "admin",
    createdAt: "2023-10-01T12:00:00Z",
    lastLogin: "2023-10-01T12:00:00Z",
    profilePicture: "https://example.com/profile.jpg",
    tasksAssigned: ["task1", "task2"],
    tasksCreated: ["task1", "task2"],
    tasksCompleted: ["task1"],
    tasksInProgress: ["task2"],
    tasksArchived: ["task1"],
    tasksDeleted: ["task1"],
    tasksShared: ["task1", "task2"],
    tasksCollaborated: ["task1", "task2"],
    tasksComments: [
      {
        commentText: "This is a comment on the user profile.",
        commentAuthor: "Sven Michels",
        commentCreatedAt: "2023-10-01T12:00:00Z",
      },
    ],
    tasksAttachments: [
      {
        attachmentName: "example.txt",
        attachmentUrl: "https://example.com/attachment.txt",
        attachmentUploadedAt: "2023-10-01T12:00:00Z",
      },
    ],
    tasksInfo: "This is additional information about the user.",
  });
}

init();
