import { CreateAlarm } from "./alarms.js";
import { GetTaskList, SetTaskList, TASK_LIST_KEY } from "./task.js";

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


// TRIGGERING FUNCTION WHEN ALARM TRIGGER :)
chrome.alarms.onAlarm.addListener((alarm) => {

    chrome.storage.local.get(TASK_LIST_KEY, function (result) {
        taskList = result[TASK_LIST_KEY] || [];
        console.log("Alarm Trigger :" + alarm.name);

        const size = taskList.length;
        let item;

        for (let i = 0; i < size; i++) {
            item = taskList[i];

            if (item.id == alarm.name) {

                chrome.tabs.create({ url: item.url }, function (tab) {
                    if (chrome.runtime.lastError) {
                        console.error('Error creating tab:', chrome.runtime.lastError);
                    } else {
                        console.log('Tab created with ID:', tab.id);
                    }
                });

                taskList = taskList.filter((data) => data.id != item.id);
                chrome.storage.local.set({ [TASK_LIST_KEY]: taskList });
                break;
            }
        }
    });
});

// MESSAGE RECEIVING FROM MAIN HTML PAGE
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.action === "createAlarm") {
        const { alarmData } = message;

        CreateAlarm(alarmData);

        sendResponse({ success: true });
    }
});

////////////////////////////////////////////////////////
///////    ::: FUNCTIONS BELOW THIS :::     ////////////
////////////////////////////////////////////////////////
