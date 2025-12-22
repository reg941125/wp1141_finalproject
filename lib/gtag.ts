// Google Analytics 4 配置和工具函數

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// 檢查是否在生產環境且有 GA ID
export const isGAEnabled = Boolean(
  GA_TRACKING_ID && 
  process.env.NODE_ENV === 'production'
);

// 頁面瀏覽事件
export const pageview = (url: string) => {
  if (!isGAEnabled) return;
  
  window.gtag('config', GA_TRACKING_ID as string, {
    page_path: url,
  });
};

// 自定義事件
interface GtagEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
}

export const event = ({ action, category, label, value }: GtagEvent) => {
  if (!isGAEnabled) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// 常用事件追蹤函數
export const trackEvent = {
  // 登入事件
  login: (method: string) => {
    event({
      action: 'login',
      category: 'engagement',
      label: method,
    });
  },

  // 註冊事件
  signUp: (method: string) => {
    event({
      action: 'sign_up',
      category: 'engagement',
      label: method,
    });
  },

  // 搜尋事件
  search: (searchTerm: string) => {
    event({
      action: 'search',
      category: 'engagement',
      label: searchTerm,
    });
  },

  // 發布內容
  postContent: (contentType: 'question' | 'answer' | 'job' | 'note') => {
    event({
      action: 'post_content',
      category: 'content',
      label: contentType,
    });
  },

  // 互動事件
  interaction: (interactionType: 'like' | 'follow' | 'message' | 'share') => {
    event({
      action: 'user_interaction',
      category: 'engagement',
      label: interactionType,
    });
  },

  // 查看內容
  viewContent: (contentType: 'question' | 'profile' | 'job' | 'note') => {
    event({
      action: 'view_content',
      category: 'content',
      label: contentType,
    });
  },
};

