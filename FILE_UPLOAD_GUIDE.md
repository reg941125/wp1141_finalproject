# 檔案上傳功能指南

## 功能概述

本系統支援在發問和回答時上傳檔案，包括：
- ✅ 圖片檔案（JPG、PNG、GIF 等）
- ✅ PDF 文件
- ✅ Word 文件（DOC、DOCX）
- ✅ 文字檔案（TXT）
- ✅ 其他常見檔案格式

## 使用方式

### 1. 發問時上傳檔案

在「發問」頁面（`/questions/new`）：

1. 填寫標題和內容
2. 點擊內容編輯器上方的「📎 上傳檔案」按鈕
3. 選擇要上傳的檔案（可多選）
4. 檔案會自動添加到內容末尾：
   - **圖片/GIF**：自動以 Markdown 圖片語法插入 `![檔名](URL)`
   - **其他檔案**：顯示為下載連結 `[📎 檔名](URL)`
5. 上傳完成後可以繼續輸入文字
6. 可以在已上傳檔案列表中移除不需要的檔案

### 2. 回答時上傳檔案

在問題詳情頁面回答時：

1. 在回答編輯器上方點擊「📎 上傳檔案」按鈕
2. 選擇要上傳的檔案
3. 檔案會自動添加到回答內容末尾
4. 使用方式與發問相同

## 顯示效果

### 🔍 智慧顯示模式

系統會根據頁面類型自動選擇最佳顯示方式：

#### 列表頁面（簡潔模式）
在以下頁面中，檔案顯示為**簡單的下載連結**：
- 題目討論區主頁
- 個人檔案頁面
- 題庫列表頁

**優點**：保持頁面簡潔，提升載入速度

#### 詳情頁面（內嵌模式）
在以下頁面中，檔案顯示為**內嵌框**：
- 問題詳情頁
- 題庫查看頁

**優點**：可直接預覽檔案內容，無需離開頁面

---

### 圖片檔案
- 在文章中自動顯示為圖片（所有頁面）
- 支援 JPG、PNG、GIF、WebP 等格式
- GIF 動圖可正常播放
- 響應式尺寸調整

### PDF 檔案
**列表頁**：
- 顯示為下載連結：📎 檔案名稱.pdf

**詳情頁**：
- 使用內嵌框（iframe）直接在頁面中顯示
- 可以直接閱讀 PDF 內容
- 提供「在新分頁開啟」和「下載」按鈕
- 高度固定為 600px，可滾動查看

### Office 文件（Word、Excel、PowerPoint）
**列表頁**：
- 顯示為下載連結

**詳情頁**：
- 使用 Google Docs Viewer 顯示預覽
- 在內嵌框中顯示文件內容
- 提供「在新分頁開啟」和「下載」按鈕
- 可能需要較長載入時間

### 其他檔案類型
**列表頁**：
- 顯示為下載連結

**詳情頁**：
- 顯示檔案資訊卡片
- 提供「在新分頁開啟」和「下載」按鈕
- 顯示檔案圖示和類型標籤

## 環境設定

檔案上傳使用 Cloudinary 服務，需要設定環境變數。

### 1. 註冊 Cloudinary 帳戶

1. 訪問 [Cloudinary](https://cloudinary.com/)
2. 點擊「Sign Up for Free」註冊免費帳戶
3. 完成註冊後進入 Dashboard

### 2. 取得 API 金鑰

在 Cloudinary Dashboard 中可以看到：
- **Cloud Name**（雲端名稱）
- **API Key**（API 金鑰）
- **API Secret**（API 密鑰）

### 3. 設定環境變數

在專案根目錄的 `.env.local` 檔案中添加：

```env
# Cloudinary 設定
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

將 `your_cloud_name`、`your_api_key`、`your_api_secret` 替換為你的實際值。

### 4. 部署環境設定

如果使用 Vercel 部署：

1. 進入 Vercel Dashboard
2. 選擇你的專案
3. 點擊「Settings」→「Environment Variables」
4. 添加以下變數：
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
5. 選擇適用環境（Production、Preview、Development）
6. 重新部署應用

## 技術實現

### API 端點

- **POST** `/api/questions/upload`
  - 處理檔案上傳
  - 接受 `FormData` 格式
  - 返回上傳檔案的 URL 陣列

### 檔案儲存

- 所有檔案上傳至 Cloudinary
- 儲存在 `tutoring-platform` 資料夾
- 支援 `auto` 資源類型（自動識別檔案類型）

### 前端處理

#### QuestionForm.tsx
- 提供檔案上傳按鈕（Paperclip 圖示）
- 顯示已上傳檔案列表
- 支援移除已上傳檔案
- 自動在內容末尾插入檔案連結

#### QuestionDetailPage.tsx（回答功能）
- 與發問功能類似的檔案上傳介面
- 支援在回答中上傳檔案
- 檔案自動添加到回答內容末尾

## 限制與注意事項

### 檔案大小限制

Cloudinary 免費方案限制：
- 單個檔案最大 **10 MB**
- 每月總上傳量 **25 GB**
- 總儲存空間 **25 GB**

### 安全性

- 只有已登入用戶可以上傳檔案
- 檔案上傳前會進行身份驗證
- 支援的檔案類型受限於 `accept` 屬性

### 瀏覽器支援

- 使用 HTML5 File API
- 支援所有現代瀏覽器
- 不支援 IE11 及更早版本

## 常見問題

### Q: 上傳失敗怎麼辦？

1. 確認 Cloudinary 環境變數設定正確
2. 檢查檔案大小是否超過限制
3. 確認網路連線正常
4. 查看瀏覽器控制台的錯誤訊息

### Q: 可以上傳哪些檔案格式？

目前支援：
- **圖片**：JPG、PNG、GIF、WebP、SVG
- **文件**：PDF、DOC、DOCX、TXT
- 可以在 `QuestionForm.tsx` 和 `page.tsx` 中的 `accept` 屬性調整

### Q: 如何限制檔案大小？

在前端添加檔案大小檢查：

```typescript
const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  // 檢查檔案大小（例如限制 10 MB）
  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB in bytes
  for (const file of Array.from(files)) {
    if (file.size > MAX_SIZE) {
      alert(`檔案 ${file.name} 超過 10 MB 限制`);
      return;
    }
  }

  // ... 繼續上傳邏輯
};
```

### Q: 圖片為什麼顯示不出來？

1. 確認 Cloudinary URL 有效
2. 檢查圖片格式是否支援
3. 確認 Next.js Image 組件的 `domains` 配置

在 `next.config.js` 中添加：

```javascript
module.exports = {
  images: {
    domains: ['res.cloudinary.com'],
  },
};
```

### Q: 如何查看已使用的儲存空間？

1. 登入 Cloudinary Dashboard
2. 查看 Media Library
3. 檢視使用量統計

### Q: 能否支援影片上傳？

可以！Cloudinary 支援影片上傳。修改步驟：

1. 在 `accept` 屬性中添加 `video/*`
2. 在 `handleFileUpload` 中判斷影片類型
3. 使用 HTML5 `<video>` 標籤顯示

```typescript
if (file.type.startsWith('video/')) {
  newContent += `\n<video src="${file.url}" controls></video>\n`;
}
```

## 測試步驟

1. **測試圖片上傳**：
   - 上傳一張圖片
   - 確認顯示在內容末尾
   - 發布後確認圖片正常顯示

2. **測試 PDF 上傳**：
   - 上傳一個 PDF 檔案
   - 確認顯示為下載連結
   - 點擊連結確認可以下載

3. **測試多檔案上傳**：
   - 同時選擇多個檔案
   - 確認全部上傳成功
   - 檢查檔案列表顯示正確

4. **測試檔案移除**：
   - 上傳檔案後點擊移除按鈕
   - 確認檔案從列表和內容中移除

5. **測試編輯器功能**：
   - 上傳檔案後繼續輸入文字
   - 確認光標位置和編輯功能正常

## 故障排除

### Cloudinary 配置錯誤

**錯誤訊息**：`Failed to upload files`

**解決方法**：
1. 檢查 `.env.local` 中的 Cloudinary 配置
2. 確認環境變數名稱正確
3. 重新啟動開發伺服器

### CORS 錯誤

**錯誤訊息**：`CORS policy: No 'Access-Control-Allow-Origin'`

**解決方法**：
Cloudinary 預設允許所有來源，如果遇到 CORS 問題：
1. 檢查 Cloudinary 設定中的 CORS 配置
2. 確認請求 URL 正確

### 圖片無法顯示

**錯誤訊息**：`Invalid src prop`

**解決方法**：
在 `next.config.js` 中添加 Cloudinary 域名：

```javascript
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};
```

## 進階功能

### 自動圖片優化

Cloudinary 支援自動優化圖片：

```typescript
// 在上傳時指定轉換選項
cloudinary.uploader.upload_stream(
  {
    resource_type: 'auto',
    folder: 'tutoring-platform',
    transformation: [
      { width: 1200, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  },
  // ...
);
```

### 圖片壓縮

```typescript
const optimizedUrl = file.url.replace('/upload/', '/upload/q_auto,f_auto/');
```

### 縮圖生成

```typescript
const thumbnailUrl = file.url.replace('/upload/', '/upload/w_200,h_200,c_fill/');
```

## 相關文件

- [Cloudinary 文件](https://cloudinary.com/documentation)
- [Next.js Image 組件](https://nextjs.org/docs/api-reference/next/image)
- [Markdown 語法](https://www.markdownguide.org/)

## 支援

如有問題，請檢查：
1. 瀏覽器控制台的錯誤訊息
2. Network 標籤中的請求詳情
3. Cloudinary Dashboard 的上傳日誌

