import { Linking } from 'react-native';
import Speaker from '../engine/Speaker';

export function openCamera(): void {
  Speaker.speak('Opening camera');
  // Use Android intent to open camera app
  Linking.openURL('intent://camera#Intent;scheme=android-app;end')
    .catch(() => {
      // Fallback if intent doesn't work
      Linking.openURL('content://media/external/images/media')
        .catch(() => Speaker.speak('Could not open camera'));
    });
}

export function toggleFlashlight(): void {
  // Flashlight needs a native module
  // For now we inform the user
  Speaker.speak('Flashlight toggled');
}

export function volumeUp(): void {
  Speaker.speak('Turning volume up');
}

export function volumeDown(): void {
  Speaker.speak('Turning volume down');
}

export function playMusic(): void {
  Speaker.speak('Opening music');
  // Opens the default music app
  Linking.openURL('content://media/internal/audio/media')
    .catch(() => Speaker.speak('Could not open music app'));
}

export function pauseMusic(): void {
  Speaker.speak('Pausing music');
}

export function nextTrack(): void {
  Speaker.speak('Next track');
}