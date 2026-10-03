// "What's New" release notes — shown once per version bump, gated by
// settings.lastSeenWhatsNewVersion (see storage.js's showWhatsNew /
// dismissWhatsNew) so a returning user sees a summary of real changes the
// next time they open the app, instead of just quietly finding them.
// Brand-new users never see this: completeOnboarding() sets
// lastSeenWhatsNewVersion to LATEST_WHATS_NEW_VERSION immediately, since
// everything is already "new" to them.
//
// Bump LATEST_WHATS_NEW_VERSION and add a new entry at the front of
// WHATS_NEW_RELEASES whenever a change is significant enough that a
// returning user should hear about it — not every commit, just real
// user-facing additions. Each release's icon/heading/items text lives in
// i18n (whatsNew.releases.<version>.heading / .items.<n>) rather than
// here, matching the reading-plan data/i18n split used elsewhere.

export const LATEST_WHATS_NEW_VERSION = 1;

// itemCount tells WhatsNewScreen how many whatsNew.releases.<version>.items
// keys to read for that release.
export const WHATS_NEW_RELEASES = [{ version: 1, icon: "book-outline", itemCount: 4 }];
