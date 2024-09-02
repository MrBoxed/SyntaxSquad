// Service worker script

(() => {
    let tasks = [];

    // Fetch tasks from storage
    chrome.storage.local.get(['tasks'], function(result) {
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

                    chrome.tabs.create({ url: task.url }, function(tab) {
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
