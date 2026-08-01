// Crash/error reporting via Sentry — opt-in and silent by default. Nothing
// is sent anywhere until a Sentry DSN is configured in app.json's
// extra.sentryDsn (a DSN is meant to be embedded client-side and isn't a
// secret, unlike an auth token). Until then, Sentry.init() is simply never
// called and every Sentry.* call elsewhere becomes a documented no-op.
//
// To turn this on: create a free Sentry project at sentry.io, copy its DSN
// into app.json's extra.sentryDsn, and rebuild. Source map upload (for
// readable native stack traces) is a separate, later step requiring the
// @sentry/react-native/expo config plugin and a SENTRY_AUTH_TOKEN — not set
// up here, since it needs an authenticated Sentry account this session
// doesn't have.

import Constants from "expo-constants";
import * as Sentry from "@sentry/react-native";

export function initCrashReporting() {
  const dsn = Constants.expoConfig?.extra?.sentryDsn;
  if (!dsn) return;
  Sentry.init({
    dsn,
    tracesSampleRate: 0.2,
  });
}

export { Sentry };
