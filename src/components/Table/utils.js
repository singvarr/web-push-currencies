export const checkNotificationPermission = (grantedCallback, firstGrantedCallback, handleDeniedCallback, isRequestPermission) => {
    if (!("Notification" in window)) {
        // Check if the browser supports notifications
        alert("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
        // Check whether notification permissions have already been granted;
        // if so, create a notification
         grantedCallback()
    } else if (isRequestPermission && Notification.permission !== "denied") {
        // We need to ask the user for permission
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                 firstGrantedCallback()
            }
            if (permission === "denied") {
                handleDeniedCallback()
            }
        });
    }
}
