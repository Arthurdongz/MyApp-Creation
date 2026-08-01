import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import { registerWidgetTaskHandler } from 'react-native-android-widget';

import App from './App';
import { widgetTaskHandler } from './src/widgets/widgetTaskHandler';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

// The widget's headless task must be registered at the JS entry point (not
// inside App.js), since Android can invoke it to redraw the home-screen
// widget even when the app itself isn't open. No-ops on iOS/web, where this
// library isn't installed as a native module.
if (Platform.OS === 'android') {
  registerWidgetTaskHandler(widgetTaskHandler);
}
