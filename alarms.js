import { TASK_LIST_KEY } from "./task.js";

// ::: FUNCTION FOR CREATING THE ALARM :::
export async function CreateAlarm(alarmData) {

    let taskList = [];
    chrome.storage.local.get(TASK_LIST_KEY, function (result) {
        taskList = result[TASK_LIST_KEY] || [];
    });

    if (taskList) {
        taskList.forEach(element => {
            if ((element.url == alarmData.url) && (element.alarmTime == alarmData.alarmTime)) {
                console.log("Same alarm");
                return;
            }
        });
    }

    const inputDate = new Date(alarmData.alarmTime);
    const currentTime = new Date();
    const timeInMs = inputDate - currentTime;

    // if it doesn't exists then create alarm
    chrome.alarms.create(alarmData.id, {
        when: timeInMs // Time in ms
    });

    console.log("Alarm Crated");
}