export const TASK_LIST_KEY = "buzzTaskList";

// ::: FUNCTION TO SET THE LIST in chrome extension local storage
export function SetTaskList(taskList) {
    chrome.storage.local.set({ [TASK_LIST_KEY]: taskList });
}

// ::: FUNCTION TO GET THE TASK LIST FROM THE chrome exenstion local storage
export function GetTaskList() {
    return chrome.storage.local.get([TASK_LIST_KEY], function (result) {
        const taskList = result[TASK_LIST_KEY];

        if (taskList === undefined) {
            SetTaskList([]);
            return [];
        }

        //console.log(taskList);
        return taskList;
    })
}


export function CreateTaskObject(id, title, url, alarmTime) {
    return {
        "cardId": id,
        "cardTitle": title,
        "cardUrl": url,
        "alarmTime": alarmTime,
        "completed": false
    }
}

