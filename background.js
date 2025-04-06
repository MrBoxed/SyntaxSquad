// Service worker script



(() => {
    let tasks = [];

    // Fetch tasks from storage
    chrome.storage.local.get(['tasks'], function (result) {
        if (result.tasks) {
            try {
                tasks = JSON.parse(result.tasks); // Use the global tasks variable
                console.log('Value currently is:', tasks);
            } catch (error) {
                console.error('Failed to parse JSON:', error);
            }
        } else {
            console.log('No tasks found in storage');
        }
    });

    // Set an alarm to trigger every minute
    chrome.runtime.onInstalled.addListener(() => {
        console.log('Service worker installed.');

        chrome.alarms.create('checkTime', {
            periodInMinutes: 1 // Set to every minute
        });
    });

    // Handle the alarm event
    chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === 'checkTime') {
            console.log('Alarm triggered:', new Date().toLocaleTimeString());

            const now = Date.now(); // Current time in milliseconds

            tasks.forEach(task => {
                const alarmTime = new Date(task.alarmTime).getTime(); // Convert alarmTime to milliseconds

                // Check if the alarm time is reached within the last second
                if (alarmTime <= now && alarmTime > (now - 1000)) {

                    console.log('Creating tab with URL:', task.url);

                    chrome.tabs.create({ url: task.url }, function (tab) {
                        if (chrome.runtime.lastError) {
                            console.error('Error creating tab:', chrome.runtime.lastError);
                        } else {
                            console.log('Tab created with ID:', tab.id);
                        }
                    });
                }
            });
        }
    });

})();


// background.js

chrome.runtime.onInstalled.addListener(() => {
    console.log('Background service worker installed.');
});

let alarms = {}; // Store alarms as {alarmName: {time: Date, callback: function}}

function createAlarm(alarmName, time, callback) {
    if (!(time instanceof Date)) {
        console.error('Time must be a Date object.');
        return;
    }

    alarms[alarmName] = { time: time, callback: callback };
    console.log(`Alarm "${alarmName}" set for ${time}`);

    checkAlarms(); //Immediately check in case the alarm is in the very near future.
}

function removeAlarm(alarmName) {
    if (alarms[alarmName]) {
        delete alarms[alarmName];
        console.log(`Alarm "${alarmName}" removed.`);
    } else {
        console.log(`Alarm "${alarmName}" not found.`);
    }
}

function checkAlarms() {
    const now = new Date();

    for (const alarmName in alarms) {
        const alarm = alarms[alarmName];
        if (now >= alarm.time) {
            console.log(`Alarm "${alarmName}" triggered.`);
            alarm.callback();
            delete alarms[alarmName]; // Remove triggered alarm
        }
    }
}

// Check alarms every second. Adjust as needed.
setInterval(checkAlarms, 1000);

// Example usage (from popup or content script):

// Example 1: Set an alarm for 5 seconds from now.
function setExampleAlarm() {
    const now = new Date();
    const alarmTime = new Date(now.getTime() + 5000); // 5 seconds from now

    createAlarm('exampleAlarm', alarmTime, () => {
        console.log('Example alarm triggered!');
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'images/icon48.png', // Replace with your icon path
            title: 'Alarm!',
            message: 'Your alarm has gone off!',
        });
    });
}

//Example 2: Set alarm for a specific date and time.
function setSpecificAlarm() {
    const specificTime = new Date(2024, 11, 25, 12, 0, 0); //Year, month(0-11), day, hour, minute, second.
    createAlarm('christmasAlarm', specificTime, () => {
        console.log("Merry Christmas");
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'images/icon48.png',
            title: 'Merry Christmas',
            message: 'It\'s Christmas!',
        });
    });

}

// Example 3: Remove an alarm.
function removeExampleAlarm() {
    removeAlarm('exampleAlarm');
}

// Listen for messages from popup or content script.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'setAlarm') {
        createAlarm(request.alarmName, new Date(request.time), request.callback);
        sendResponse({ success: true });
    } else if (request.action === 'removeAlarm') {
        removeAlarm(request.alarmName);
        sendResponse({ success: true });
    } else if (request.action === 'exampleAlarm') {
        setExampleAlarm();
        sendResponse({ success: true });
    } else if (request.action === 'specificAlarm') {
        setSpecificAlarm();
        sendResponse({ success: true });
    }
});