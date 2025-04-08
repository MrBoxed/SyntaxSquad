import { TASK_LIST_KEY } from "./task.js";

// ::: FUNCTION FOR CREATING THE ALARM :::
export async function CreateAlarm(alarmData) {

    let taskList = [];

    await chrome.storage.local.get(TASK_LIST_KEY, function (result) {
        taskList = result[TASK_LIST_KEY] || [];

        if (taskList) {
            taskList.forEach(element => {
                if ((element.url == alarmData.url) && (element.alarmTime == alarmData.alarmTime)) {
                    console.log("Same alarm");
                    return;
                }
            });
        }
    });

    const inputDate = new Date(alarmData.alarmTime);
    const currentTime = new Date();
    const timeDiff = inputDate - currentTime;
    const timeInMs = Date.now() + timeDiff;

    console.log("TIME_IN_MS: ", timeDiff);

    if (timeInMs < 0) {
        console.log("The alarm is in past, cant set!");
        return;
    }
    else {

        // if it doesn't exists then create alarm
        chrome.alarms.create(alarmData.id, {
            when: timeInMs // Time in ms
        });
        console.log("Alarm Created");
    }
}