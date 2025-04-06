import { GetTaskList, SetTaskList } from "./extra.js";

let taskList = [];

// CONFINGERING AT THE INSTALL OR UPDATE
chrome.runtime.onInstalled.addListener((details) => {

    if (details.reason === "install") {
        SetTaskList(taskList);
    }
    else if (details.reason === "update") {
        taskList = GetTaskList();
    }

    console.log(details.reason);
});


// async function CreateTaskList(params) {
//     const taskData = await chrome.storage.local.get(TASK_LIST_KEY);
//     if (taskData === "undefined") {
//         chrome.storage.local.set(TASK_LIST_KEY, {});
//     }
// }

// // TRIGGERING FUNCTION WHEN ALARM TRIGGER :)
// chrome.alarms.onAlarm.addListener((alarms) => CheckStatus(alarms));


// async function CheckStatus(alarm) {

//     if (alarm.name === ALARM_NAME) {

//         const taskList = await chrome.storage.local.get(TASK_LIST_KEY);

//         console.log('Alarm triggered:', new Date().toLocaleTimeString());

//         // Current time in milliseconds
//         const now = Date.now();

//         taskList.forEach(task => {

//             // Convert alarmTime to milliseconds
//             const alarmTime = new Date(task.alarmTime).getTime();

//             // Check if the alarm time is reached within the last second
//             if (alarmTime <= now && alarmTime > (now - 1000)) {

//                 console.log('Creating tab with URL:', task.url);

//                 chrome.tabs.create({ url: task.url }, function (tab) {
//                     if (chrome.runtime.lastError) {
//                         console.error('Error creating tab:', chrome.runtime.lastError);
//                     } else {
//                         console.log('Tab created with ID:', tab.id);
//                     }
//                 });
//             }
//         });
//     }
// }