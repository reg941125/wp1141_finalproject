/**
 * PostHog 事件追蹤工具函數
 * 
 * 使用範例：
 * import { trackEvent } from '@/lib/posthog-events';
 * 
 * trackEvent('button_clicked', {
 *   button_name: 'submit',
 *   page: 'login'
 * });
 */

import { posthog } from './posthog';

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  try {
    if (posthog && (posthog as any).__loaded) {
      posthog.capture(eventName, properties);
    }
  } catch (error) {
    console.error('PostHog trackEvent error:', error);
  }
}

// 識別用戶（當用戶登入時調用）
export function identifyUser(userId: string, userProperties?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  try {
    if (posthog && (posthog as any).__loaded) {
      posthog.identify(userId, userProperties);
    }
  } catch (error) {
    console.error('PostHog identifyUser error:', error);
  }
}

// 重置用戶（當用戶登出時調用）
export function resetUser() {
  if (typeof window === 'undefined') return;
  
  try {
    if (posthog && (posthog as any).__loaded) {
      posthog.reset();
    }
  } catch (error) {
    console.error('PostHog resetUser error:', error);
  }
}

// 設定用戶屬性
export function setUserProperties(properties: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  try {
    if (posthog && (posthog as any).__loaded) {
      posthog.setPersonProperties(properties);
    }
  } catch (error) {
    console.error('PostHog setUserProperties error:', error);
  }
}

