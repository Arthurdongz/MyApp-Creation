// Proactively checks for and applies an OTA update on launch, instead of
// relying only on expo-updates' default behavior — which downloads a new
// update in the background but keeps running the bundle already booted
// with, only switching over on the NEXT cold start. Without this, a freshly
// published update needs two full closes-and-reopens to actually show up
// (one to download it, one more to launch with it), and simply backgrounding
// the app rather than fully closing it doesn't even trigger that — easy to
// read as "the update isn't working" when it's really just a launch or two
// behind.
import * as Updates from "expo-updates";

export async function checkForUpdateAndApply() {
  // False in local development / a dev client, or if updates aren't
  // configured — nothing to check in that case.
  if (!Updates.isEnabled) return;
  try {
    const checkResult = await Updates.checkForUpdateAsync();
    if (!checkResult.isAvailable) return;
    const fetchResult = await Updates.fetchUpdateAsync();
    if (fetchResult.isNew) {
      await Updates.reloadAsync();
    }
  } catch (e) {
    // No connectivity, or the check/fetch failed for some other reason —
    // the app just keeps running on whatever bundle it already launched
    // with, same as if this check didn't exist.
  }
}
