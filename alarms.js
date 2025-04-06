const ALARM_NAME = "buzzAlarm";


// ::: FUNCTION FOR CREATING THE ALARM :::
export async function CreateAlarm(alarmData) {

    const alarmName = ALARM_NAME + `_${alarmData.id}`;

    // if it doesn't exists then create alarm
    if (typeof alarm === 'undefined') {
        chrome.alarms.create(ALARM_NAME, {
            periodInMinutes: 1 // Repeat every 1 minutes
        });
    }
}