import { NativeModules } from 'react-native';
import Speaker from '../engine/Speaker';

export function setAlarm(hour: number, minute: number): void {
  try {
    // Use Android's built-in AlarmClock via intent
    const { AlarmManager } = NativeModules;
    if (AlarmManager) {
      AlarmManager.setAlarm({
        hour,
        minute,
        message: 'Nova Alarm',
        vibrate: true,
      });
    }

    // Format for speech naturally
    const h = hour % 12 || 12;
    const m = minute === 0 ? "o'clock" : minute < 10 ? `oh ${minute}` : `${minute}`;
    const period = hour < 12 ? 'AM' : 'PM';

    Speaker.speak(`Alarm set for ${h} ${m} ${period}`);
  } catch (error) {
    Speaker.speak('Sorry, I could not set the alarm');
    console.error('[Alarm]', error);
  }
}

export function setTimer(seconds: number): void {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  // Confirm to user
  if (mins > 0) {
    Speaker.speak(`Timer set for ${mins} minute${mins > 1 ? 's' : ''}`);
  } else {
    Speaker.speak(`Timer set for ${secs} seconds`);
  }

  // When timer ends — Nova announces it
  setTimeout(() => {
    Speaker.speak('Time is up!');
  }, seconds * 1000);
}