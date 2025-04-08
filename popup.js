import { TASK_LIST_KEY } from "./task.js";

let taskList = [];

// Load tasks on page load
document.addEventListener('DOMContentLoaded', function () {

    chrome.storage.local.get(TASK_LIST_KEY, function (result) {

        taskList = result[TASK_LIST_KEY] || [];

        if (taskList != null || taskList != undefined)
            taskList.forEach(task => displayTask(task.id, task.name, task.url, task.alarmTime));

        updateTaskCount(taskList.length); // Update task count when the page loads
    });

});

// Generate a unique ID for each task
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Update the task count display
function updateTaskCount(count) {
    const taskCountElement = document.getElementById('taskCount');
    taskCountElement.textContent = `Active Bookmarks - ${count}`;
}

// Add a new task
function addTask() {
    // Show popup to get alarm time
    document.getElementById('alarm-popup').style.display = 'flex';
}

// Attach event listener to add task button
document.querySelector('.add-btn').addEventListener('click', addTask);


// Save the task with alarm time
document.getElementById('save-alarm-btn').addEventListener('click', function () {

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {

        // ::: CREATING TIME IN MS :::
        const alarmTime = document.getElementById('alarm-time-input').value;

        const currentTab = tabs[0];
        const taskId = generateUniqueId();
        const taskUrl = currentTab.url;
        const taskName = currentTab.title;

        const newTask = {
            id: taskId,
            name: taskName,
            url: taskUrl,
            alarmTime: alarmTime
        };

        taskList.push(newTask);

        chrome.runtime.sendMessage({
            action: 'createAlarm',
            alarmData: newTask
        },
            (response) => {
                if (response.success) {
                    console.log('Alarm created successfully!');
                } else {
                    console.error('Failed to create alarm');
                }
            });

        chrome.storage.local.set({ [TASK_LIST_KEY]: taskList });
        displayTask(taskId, taskName, taskUrl, alarmTime);
        updateTaskCount();

        // Hide popup
        document.getElementById('alarm-popup').style.display = 'none';
        document.getElementById('alarm-time-input').value = ''; // Clear input field
    });
});

// Close the popup
document.getElementById('close-popup').addEventListener('click', function () {
    document.getElementById('alarm-popup').style.display = 'none';
    document.getElementById('alarm-time-input').value = ''; // Clear input field
});

// Mark a task as complete
function markComplete(id) {
    alert(`Task with ID ${id} marked as complete!`);
}

// Display a message
function displayMessage(message, isError = false) {
    const messageContainer = document.getElementById('message-container');
    messageContainer.textContent = message;
    messageContainer.style.color = isError ? 'red' : 'green';
}

// Display a task
function displayTask(id, name, url, alarmTime) {
    const taskList = document.querySelector('.task-list');
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    taskItem.setAttribute('task-id', id);
    taskItem.innerHTML = `
        <div class="task-content">
            <div class="task-info">
                <span class="task-name"><a href="${url}" target="_blank">${name}</a></span><br><br>
                <span class="task-url">${url}</span><br>
                <div class="alarm-time">
                    Alarm Time: ${alarmTime ? new Date(alarmTime).toLocaleString() : 'Not set'}
                </div>
            </div><br>
            <div class="task-actions">
                <span class="complete-btn" onclick="markComplete('${id}')">&#10003;</span>
                <span class="delete-btn" onclick="deleteTask('${id}')">&#128465;</span>
            </div>
        </div>
    `;
    taskList.appendChild(taskItem);
}

// Delete a task
function deleteTask(id) {
    const taskExists = taskList.some(task => task.id === id);
    if (!taskExists) {
        displayMessage(`Task with ID ${id} does not exist.`, true);
        return;
    }

    taskList = taskList.filter(task => task.id !== id);
    chrome.storage.local.set({ [TASK_LIST_KEY]: taskList });

    const taskItem = document.querySelector(`.task-item[task-id="${id}"]`);

    if (taskItem) {
        taskItem.remove();
        updateTaskCount();
    } else {
        displayMessage(`Task with ID ${id} not found in DOM.`, true);
    }
}



// Attach event listener to search input field
document.getElementById('taskInput').addEventListener('keyup', function () {
    const query = this.value.toLowerCase();
    const tasks = document.querySelectorAll('.task-item');

    tasks.forEach(task => {
        const taskName = task.querySelector('.task-name').textContent.toLowerCase();
        if (taskName.includes(query)) {
            task.style.display = 'block';
        } else {
            task.style.display = 'none';
        }
    });
});

// Event delegation for delete actions
document.querySelector('.task-list').addEventListener('click', function (event) {
    if (event.target.classList.contains('delete-btn')) {
        const taskId = event.target.closest('.task-item').getAttribute('task-id');
        deleteTask(taskId);
    }
});

// Check for alarms and open URLs
function checkAlarms() {
    setInterval(function () {
        const now = new Date();
        tasks.forEach(task => {
            const alarmTime = new Date(task.alarmTime);
            if (alarmTime <= now && alarmTime > (now - 1000)) { // Check if the alarm time is reached
                chrome.tabs.create({ url: task.url });
                deleteTask(task.id); // Optionally delete the task after opening the URL
            }
        });
    }, 1000); // Check every second
}