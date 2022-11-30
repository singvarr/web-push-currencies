export async function requestNotificationPermission() {
    const permission = await window.Notification.requestPermission()
    if (permission !== 'granted') {
        throw new Error('Permission not granted for Notification')
    }
}
