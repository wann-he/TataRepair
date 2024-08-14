import {isPermissionGranted, requestPermission, sendNotification} from '@tauri-apps/api/notification';


export async function sendNotify(msg: string) {
    let permissionGranted = await isPermissionGranted();
    if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === 'granted';
    }
    if (permissionGranted) {
        // sendNotification('Tauri is awesome!');
        sendNotification({title: 'TaTa', body: msg});
    }
}