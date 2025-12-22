'use client';

import posthog from 'posthog-js';

// 初始化 PostHog
export function initPostHog() {
  if (typeof window === 'undefined') return null;

  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

  if (!posthogKey) return null;

  // 檢查是否已經初始化
  if (!posthog.__loaded && !(posthog as any).__initialized) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('PostHog initialized');
        }
      },
      // 只在生產環境自動捕獲事件
      autocapture: process.env.NODE_ENV === 'production',
      // 捕獲頁面瀏覽
      capture_pageview: true,
      // 捕獲頁面離開
      capture_pageleave: true,
      // 禁用 session recording（如果需要可以啟用）
      disable_session_recording: !process.env.NEXT_PUBLIC_POSTHOG_SESSION_RECORDING,
    });
  }

  return posthog;
}

// 導出 posthog 實例以便在其他地方使用
export { posthog };

