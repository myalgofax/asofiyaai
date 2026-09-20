import { Platform } from 'react-native';
import { Camera } from 'expo-camera';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';

async function requestBrowserMediaPermissions() {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;

    await Promise.allSettled([
        navigator.mediaDevices.getUserMedia({ audio: true }).then(media => {
            media.getTracks().forEach(track => track.stop());
        }),
        navigator.mediaDevices.getUserMedia({ video: true }).then(media => {
            media.getTracks().forEach(track => track.stop());
        })
    ]);
}

export async function requestStartupPermissions() {
    if (Platform.OS === 'web') {
        await requestBrowserMediaPermissions();
        return;
    }

    await Camera.requestCameraPermissionsAsync();
    await ExpoSpeechRecognitionModule.requestPermissionsAsync();
}