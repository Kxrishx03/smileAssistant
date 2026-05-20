import { useEffect, useState } from 'react';
import {
  PermissionsAndroid,
  Alert,
  Linking,
  Platform
} from 'react-native';

const PERMISSIONS = [
  PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,   // Mic — for Vosk
  PermissionsAndroid.PERMISSIONS.CALL_PHONE,     // Calls
  PermissionsAndroid.PERMISSIONS.READ_CONTACTS,  // Find contacts by name
  PermissionsAndroid.PERMISSIONS.CAMERA,         // Open camera
];

export function usePermissions() {
  const [granted, setGranted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestPermissions();
  }, []);

  async function requestPermissions() {
    if (Platform.OS !== 'android') {
      setGranted(true);
      setLoading(false);
      return;
    }

    try {
      const results = await PermissionsAndroid.requestMultiple(PERMISSIONS);

      // Check every permission was approved
      const allGranted = Object.values(results).every(
        status => status === PermissionsAndroid.RESULTS.GRANTED
      );

      if (!allGranted) {
        Alert.alert(
          '⚠️ Permissions Required',
          'Nova needs microphone, contacts, camera and call permissions to work properly.',
          [
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }

      setGranted(allGranted);
    } catch (error) {
      console.error('[Permissions] Error:', error);
      setGranted(false);
    } finally {
      setLoading(false);
    }
  }

  return { granted, loading, retry: requestPermissions };
}