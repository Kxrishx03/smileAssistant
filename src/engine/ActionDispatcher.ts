import { ParsedCommand } from './CommandParser';
import Speaker from './Speaker';
import { makeCall } from '../actions/callAction';
import { setAlarm, setTimer } from '../actions/alarmAction';
import { tellTime, tellDate } from '../actions/timeAction';
import {
  openCamera,
  toggleFlashlight,
  volumeUp,
  volumeDown,
  playMusic,
  pauseMusic,
  nextTrack,
} from '../actions/deviceAction';
import DeviceInfo from 'react-native-device-info';

export async function dispatch(command: ParsedCommand): Promise<void> {
  switch (command.type) {

    case 'CALL':
      await makeCall(command.name);
      break;

    case 'SET_ALARM':
      setAlarm(command.hour, command.minute);
      break;

    case 'SET_TIMER':
      setTimer(command.seconds);
      break;

    case 'TELL_TIME':
      tellTime();
      break;

    case 'TELL_DATE':
      tellDate();
      break;

    case 'TELL_BATTERY': {
      // Get real battery level from the device
      const level = await DeviceInfo.getBatteryLevel();
      const percentage = Math.round(level * 100);
      Speaker.speak(`Battery is at ${percentage} percent`);
      break;
    }

    case 'READ_NOTIFICATIONS':
      Speaker.speak('You have no new notifications');
      break;

    case 'OPEN_CAMERA':
      openCamera();
      break;

    case 'TOGGLE_FLASHLIGHT':
      toggleFlashlight();
      break;

    case 'PLAY_MUSIC':
      playMusic();
      break;

    case 'PAUSE_MUSIC':
      pauseMusic();
      break;

    case 'NEXT_TRACK':
      nextTrack();
      break;

    case 'VOLUME_UP':
      volumeUp();
      break;

    case 'VOLUME_DOWN':
      volumeDown();
      break;

    case 'UNKNOWN':
      Speaker.speak(`Sorry, I don't know how to do that yet`);
      console.log('[Dispatcher] Unknown command:', command.raw);
      break;
  }
}