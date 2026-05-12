'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

let initialized = false;

export function PostHogProvider() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host =
      process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com';
    if (!key || initialized) return;
    posthog.init(key, {
      api_host: host,
      capture_pageview: false,
      person_profiles: 'identified_only',
    });
    initialized = true;
    posthog.capture('page_view', {
      page: 'maasik_landing',
      path: typeof window !== 'undefined' ? window.location.pathname : '/',
    });
  }, []);

  return null;
}

export function track(event: string, props?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  try {
    posthog.capture(event, props);
  } catch {
    // no-op
  }
}
