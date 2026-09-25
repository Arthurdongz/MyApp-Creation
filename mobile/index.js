import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

// The widget's headless task must be registered at the JS entry point (not
// inside App.js), since Android can invoke it to redraw the home-screen
// widget even when the app itself isn't open.
//
// react-native-android-widget uses TurboModuleRegistry.getEnforcing(), which
// throws immediately at import time if its native module isn't compiled
// into the running binary — e.g. on any binary built before this widget
// existed that later receives this file via an OTA update rather than a
// fresh native build. A static `import` of the library would be hoisted and
// evaluated before any try/catch could run, crashing the app on launch. Use
// a deferred require() inside try/catch instead, so an old binary just
// silently skips widget registration; a fresh `eas build` picks up the real
// native module and this stops being a no-op.
if (Platform.OS === 'android') {
  try {
    const { registerWidgetTaskHandler } = require('react-native-android-widget');
    const { widgetTaskHandler } = require('./src/widgets/widgetTaskHandler');
    registerWidgetTaskHandler(widgetTaskHandler);
  } catch (e) {
    console.warn('Widget registration skipped (native module not present in this build):', e?.message);
  }
}
