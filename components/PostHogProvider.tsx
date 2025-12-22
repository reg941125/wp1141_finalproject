'use client';

import { PostHogProvider } from 'posthog-js/react';
import { initPostHog } from '@/lib/posthog';
import { useEffect, useState } from 'react';

export default function PostHogProviderWrapper({ children }: { children: React.ReactNode }) {
  const [posthogClient, setPosthogClient] = useState<ReturnType<typeof initPostHog>>(null);

  useEffect(() => {
    const client = initPostHog();
    setPosthogClient(client);
  }, []);

  if (!posthogClient) {
    return <>{children}</>;
  }

  return <PostHogProvider client={posthogClient}>{children}</PostHogProvider>;
}

