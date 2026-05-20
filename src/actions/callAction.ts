import Contacts from 'react-native-contacts';
import RNPhoneCall from 'react-native-phone-call';
import Speaker from '../engine/Speaker';

export async function makeCall(name: string): Promise<void> {
  try {
    Speaker.speak(`Looking up ${name}`);

    // Search contacts for this name
    const contacts = await Contacts.getContactsMatchingString(name);

    if (contacts.length === 0) {
      Speaker.speak(`I could not find ${name} in your contacts`);
      return;
    }

    // Find the first contact that has a phone number
    const contact = contacts.find(c => c.phoneNumbers.length > 0);

    if (!contact) {
      Speaker.speak(`${name} has no phone number saved`);
      return;
    }

    const number = contact.phoneNumbers[0].number.replace(/\s/g, '');

    // Speak first — small delay so TTS finishes before call starts
    Speaker.speak(`Calling ${contact.displayName}`);
    setTimeout(() => {
      RNPhoneCall.call({ number, prompt: false });
    }, 2000);

  } catch (error) {
    Speaker.speak('Sorry, I could not make the call');
    console.error('[Call]', error);
  }
}