// Shared read-aloud helper so every "Listen" button (verse, encouragement,
// story) and the Settings "Test Voice" button all speak with the same
// voice/pitch/rate the user picked in Settings, instead of a hardcoded rate.

import * as Speech from "expo-speech";

export function speak(text, settings) {
  Speech.stop();
  Speech.speak(text, {
    rate: settings.speechRate,
    pitch: settings.speechPitch,
    voice: settings.speechVoiceURI || undefined,
  });
}
