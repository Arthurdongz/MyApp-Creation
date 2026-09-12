// Proactively checks for and applies an OTA update, instead of relying only
// on expo-updates' default behavior — which downloads a new update in the
// background but keeps running the bundle already booted with, only
// switching over on the NEXT cold start. Without this, a freshly published
// update needs two full closes-and-reopens to actually show up (one to
// download it, one more to launch with it), and simply backgrounding the
// app rather than fully closing it doesn't even trigger that — easy to read
// as "the update isn't working" when it's really just a launch or two
// behind. Besides the silent check on every launch, this is also reachable
// on demand from Settings > Check for Updates and by pulling down to
// refresh from the top of the Today screen, so a user doesn't have to
// guess whether relaunching twice will surface something new.
import * as Updates from "expo-updates";

// Shared by both the silent launch-time check and the user-triggered one
// (Settings > Check for Updates, and pull-to-refresh) — returns a status
// string so callers that want to show feedback can, while the silent
// launch-time caller just ignores the return value.
async function performUpdateCheck() {
  // False in local development / a dev client, or if updates aren't
  // configured — nothing to check in that case.
  if (!Updates.isEnabled) return { status: "unsupported" };
  try {
    const checkResult = await Updates.checkForUpdateAsync();
    if (!checkResult.isAvailable) return { status: "upToDate" };
    const fetchResult = await Updates.fetchUpdateAsync();
    if (fetchResult.isNew) {
      // Resolves right before the reload instruction fires — the app is
      // about to restart, so there's rarely a next line of caller code
      // that actually runs after this.
      await Updates.reloadAsync();
      return { status: "reloading" };
    }
    return { status: "upToDate" };
  } catch (e) {
    return { status: "error", error: e };
  }
}

export async function checkForUpdateAndApply() {
  await performUpdateCheck();
}

// User-triggered check — Settings' "Check for Updates" row and pulling
// down to refresh both call this and show feedback based on the result,
// instead of the update only ever being noticed after two full app closes
// (one launch to download it in the background, one more to actually
// switch over to it).
export async function checkForUpdateManually() {
  return performUpdateCheck();
}
