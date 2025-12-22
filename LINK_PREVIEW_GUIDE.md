# 外部連結預覽功能指南

## 功能概述

當用戶在題目討論區、回答、或筆記中貼上外部連結時，系統會自動顯示一個精美的預覽卡片，包含：
- 網站圖片/縮圖
- 標題
- 描述
- 網站名稱和圖標
- 連結 URL

## 使用方法

### 基本使用

只需在內容中單獨一行貼上 URL，系統會自動生成預覽：

```markdown
這是一個很棒的資源：

https://example.com/article

繼續其他內容...
```

### 效果展示

**站內連結（題目討論區）**：
- 格式：`https://wp1141-finalproject.vercel.app/questions/[postId]`
- 顯示：嵌入式貼文卡片（標題、內容預覽、作者、統計數據）

**外部連結**：
- 格式：任何其他 `https://` 或 `http://` 連結
- 顯示：外部連結預覽卡片（Open Graph 元數據）

### 支持的元數據

系統會從網頁中提取以下元數據：

1. **Open Graph 標籤**：
   - `og:title` - 標題
   - `og:description` - 描述
   - `og:image` - 圖片
   - `og:site_name` - 網站名稱

2. **Twitter Card 標籤**：
   - `twitter:title`
   - `twitter:description`
   - `twitter:image`

3. **標準 HTML 標籤**：
   - `<title>` - 頁面標題
   - `<meta name="description">` - 頁面描述
   - `<link rel="icon">` - 網站圖標

## 技術實現

### 組件結構

```
MarkdownRenderer (檢測連結)
├── PostLinkEmbed (站內連結)
└── ExternalLinkPreview (外部連結)
    └── API: /api/link-preview (獲取元數據)
```

### API 端點

**請求**：
```
GET /api/link-preview?url=https://example.com
```

**回應**：
```json
{
  "title": "頁面標題",
  "description": "頁面描述",
  "image": "https://example.com/image.jpg",
  "url": "https://example.com",
  "siteName": "網站名稱",
  "favicon": "https://example.com/favicon.ico"
}
```

### 安全性措施

1. **URL 驗證**：只允許 `http://` 和 `https://` 協議
2. **請求超時**：10 秒超時限制
3. **錯誤處理**：失敗時顯示簡單連結
4. **相對路徑處理**：自動轉換為絕對路徑

## 效能優化

### 當前實現
- 客戶端渲染
- 按需加載（用戶看到才加載）
- 載入動畫提升體驗

### 未來優化建議

#### 1. 服務端快取
```typescript
// app/api/link-preview/route.ts
import { kv } from '@vercel/kv'; // 或其他快取方案

export async function GET(request: Request) {
  const url = searchParams.get('url');
  
  // 檢查快取
  const cached = await kv.get(`link-preview:${url}`);
  if (cached) {
    return NextResponse.json(cached);
  }
  
  // 獲取並快取
  const metadata = await fetchMetadata(url);
  await kv.set(`link-preview:${url}`, metadata, { ex: 86400 }); // 24小時
  
  return NextResponse.json(metadata);
}
```

#### 2. 使用專業服務
考慮使用第三方預覽服務：
- [LinkPreview.net](https://www.linkpreview.net/)
- [Microlink](https://microlink.io/)
- [Iframely](https://iframely.com/)

優勢：
- 更快的響應速度
- 更好的元數據提取
- 內建快取機制
- 支持更多網站

#### 3. 批量預載
```typescript
// 預載頁面中所有外部連結
useEffect(() => {
  const links = extractExternalLinks(content);
  links.forEach(url => {
    fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
  });
}, [content]);
```

## 故障排除

### 常見問題

#### Q: 某些網站無法預覽
A: 可能原因：
- 網站封鎖爬蟲
- 網站沒有 Open Graph 標籤
- 網站需要登入
- CORS 限制

解決方案：
```typescript
// 使用更複雜的 User-Agent
headers: {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}
```

#### Q: 圖片顯示不出來
A: 檢查：
- 圖片 URL 是否正確
- 是否有 CORS 限制
- 圖片大小是否過大

#### Q: 載入很慢
A: 優化建議：
- 實施快取機制
- 使用第三方服務
- 增加超時設定

## 使用範例

### 在題目討論中
```markdown
# 微積分問題

最近在學習極限，這篇文章很有幫助：

https://zh.wikipedia.org/wiki/极限_(数学)

有誰能解釋一下ε-δ定義嗎？
```

### 在回答中
```markdown
可以參考這個影片教學：

https://www.youtube.com/watch/example

希望對你有幫助！
```

### 在筆記中
```markdown
## 參考資料

1. 官方文件：
https://docs.example.com/guide

2. 相關論文：
https://arxiv.org/abs/example

3. 實作範例：
https://github.com/example/repo
```

## 最佳實踐

### 1. 連結格式
- ✅ **推薦**：獨立一行
  ```markdown
  查看這個資源：
  
  https://example.com
  
  很有用！
  ```

- ❌ **不推薦**：行內連結（不會生成預覽）
  ```markdown
  查看[這個資源](https://example.com)很有用！
  ```

### 2. 內容組織
```markdown
# 主題

簡短說明...

## 參考資源

https://resource1.com

https://resource2.com

## 總結

...
```

### 3. 混合使用
```markdown
# 相關討論

站內相關問題：
https://wp1141-finalproject.vercel.app/questions/abc123

外部參考資料：
https://stackoverflow.com/questions/example

希望這些資源有幫助！
```

## 限制與注意事項

1. **頻率限制**：避免在一篇文章中貼太多外部連結（建議 ≤ 5 個）
2. **載入時間**：首次載入需要獲取元數據，可能需要幾秒
3. **網站兼容性**：不是所有網站都支持元數據預覽
4. **圖片大小**：預覽圖片可能較大，影響載入速度

## 維護與監控

### 監控指標
- API 請求成功率
- 平均響應時間
- 錯誤類型分布
- 熱門網域統計

### 日誌記錄
```typescript
// app/api/link-preview/route.ts
console.log({
  timestamp: new Date(),
  url: url,
  success: true,
  responseTime: performance.now() - startTime,
  metadata: {
    hasImage: !!metadata.image,
    titleLength: metadata.title.length
  }
});
```

## 總結

外部連結預覽功能顯著提升了內容的豐富度和用戶體驗，讓用戶可以在不離開頁面的情況下快速了解連結內容。透過合理的快取策略和錯誤處理，這個功能可以穩定高效地運行。

