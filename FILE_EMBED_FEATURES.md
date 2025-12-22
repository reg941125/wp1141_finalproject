# 檔案內嵌顯示功能說明

## 功能概述

當使用者上傳非圖片檔案（如 PDF、Word、Excel 等）時，系統會在特定頁面中使用內嵌框（iframe）的形式直接顯示檔案內容。

### 📋 顯示模式

#### 列表頁面（瀏覽模式）
- **題目討論區主頁** (`/`)
- **題目與筆記列表** (`/library`)
- **個人檔案頁面** (`/profile/[id]`)

在這些頁面中，檔案連結顯示為**簡單的下載連結**，保持頁面簡潔並提升載入速度。

```
📎 檔案名稱.pdf (291.21 KB)  ← 可點擊下載
```

#### 詳情頁面（內嵌模式）
- **問題詳情頁** (`/questions/[id]`)
- **題目查看頁** (`/library/view/[id]`)

在這些頁面中，檔案會以**內嵌框形式顯示**，使用者可以直接在頁面中預覽檔案內容。

```
┌─────────────────────────────────────────┐
│ 📄 檔案名稱.pdf    PDF     🔗 ⬇         │
├─────────────────────────────────────────┤
│          檔案內容直接顯示                 │
│        （可滾動、可縮放）                  │
└─────────────────────────────────────────┘
```

---

## 支援的檔案類型

### ✅ 完整內嵌顯示

#### 1. PDF 檔案
- **檔案格式**：`.pdf`
- **顯示方式**：直接使用 iframe 載入 PDF
- **功能**：
  - 直接在頁面中閱讀
  - 可滾動查看所有頁面
  - 瀏覽器內建 PDF 閱讀器功能（縮放、列印等）
- **高度**：600px 固定高度

#### 2. Office 文件（使用 Google Docs Viewer）
- **Word 文件**：`.doc`、`.docx`
- **Excel 試算表**：`.xls`、`.xlsx`
- **PowerPoint 簡報**：`.ppt`、`.pptx`
- **顯示方式**：透過 Google Docs Viewer 嵌入
- **功能**：
  - 預覽文件內容
  - 保留原始格式
  - 可滾動查看
- **限制**：
  - 需要網路連線
  - 首次載入可能較慢
  - 需要檔案 URL 可公開訪問

### ⚠️ 基本資訊顯示

#### 3. 文字檔案
- **檔案格式**：`.txt`、`.md`
- **顯示方式**：檔案資訊卡片
- **功能**：提供下載和在新分頁開啟按鈕

#### 4. 其他檔案
- 所有不在上述類別的檔案
- 顯示檔案資訊和操作按鈕

---

## 使用者介面

### 檔案內嵌框結構

```
┌─────────────────────────────────────────────────┐
│ 📄 檔案名稱.pdf          PDF     🔗 ⬇           │  ← 標題欄
├─────────────────────────────────────────────────┤
│                                                 │
│            檔案內容顯示區域                      │
│          （iframe 或預覽）                       │  ← 內容區（600px 高）
│                                                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 標題欄元素

1. **檔案圖示**（📄）：視覺化檔案類型
2. **檔案名稱**：顯示完整檔案名，過長時截斷
3. **檔案類型標籤**：PDF / Word / Excel / PowerPoint / 文字檔 / 檔案
4. **操作按鈕**：
   - 🔗 **在新分頁開啟**：在新瀏覽器分頁中開啟檔案
   - ⬇ **下載檔案**：下載到本機電腦

### 載入狀態

顯示載入動畫和「載入中...」文字，直到檔案完全載入。

### 錯誤狀態

如果檔案無法載入：
- 顯示「無法預覽此檔案」訊息
- 提供「點擊此處在新分頁開啟」連結
- 保留下載功能

---

## 實作細節

### FileEmbed 組件

位置：`components/FileEmbed.tsx`

#### Props
- `url: string` - 檔案的 Cloudinary URL
- `fileName: string` - 檔案名稱

#### 主要功能

1. **檔案類型識別**
   ```typescript
   const getFileType = (url, fileName) => {
     // 從副檔名和 URL 判斷檔案類型
     // 返回：'pdf' | 'doc' | 'excel' | 'ppt' | 'text' | 'other'
   }
   ```

2. **Viewer URL 生成**
   ```typescript
   const getViewerUrl = () => {
     if (fileType === 'pdf') {
       return url; // 直接使用原始 URL
     }
     if (['doc', 'excel', 'ppt'].includes(fileType)) {
       return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
     }
     return null; // 無法預覽
   }
   ```

3. **載入狀態管理**
   - `loading` state：追蹤載入進度
   - `error` state：處理載入錯誤
   - `onLoad` / `onError` handlers

4. **安全性**
   - 使用 `sandbox` 屬性限制 iframe 權限
   - 允許：`allow-same-origin`, `allow-scripts`, `allow-popups`, `allow-forms`

### MarkdownRenderer 整合

位置：`components/MarkdownRenderer.tsx`

#### Props

```typescript
interface MarkdownRendererProps {
  content: string;
  className?: string;
  enableFileEmbed?: boolean; // 是否啟用檔案內嵌顯示，預設為 false
}
```

- **`enableFileEmbed={false}`**（預設）：檔案連結保持原樣，顯示為普通下載連結
- **`enableFileEmbed={true}`**：檔案連結轉換為 FileEmbed 組件，顯示內嵌框

#### 使用範例

```typescript
// 列表頁面 - 不啟用內嵌（預設）
<MarkdownRenderer content={post.content} />

// 詳情頁面 - 啟用內嵌
<MarkdownRenderer content={post.content} enableFileEmbed={true} />
```

#### 檔案連結識別

```typescript
// 只有在 enableFileEmbed=true 時才匹配檔案連結
const fileLinkRegex = enableFileEmbed 
  ? /\[📎\s*([^\]]+)\]\((https?:\/\/[^)]+)\)/gi 
  : null;
```

#### 內容分割

將 Markdown 內容分割為：
- `type: 'text'` - 普通文字（由 ReactMarkdown 渲染）
- `type: 'embed'` - 貼文嵌入（PostLinkEmbed）
- `type: 'file'` - 檔案嵌入（FileEmbed，僅在 enableFileEmbed=true 時）

#### 渲染優先順序

1. 檢查是否為貼文嵌入 → PostLinkEmbed
2. 檢查是否為檔案連結且啟用內嵌 → FileEmbed
3. 其他 → ReactMarkdown（包含未啟用內嵌時的檔案連結）

---

## 樣式設計

### 亮色模式
- **標題欄背景**：淺灰色（`bg-gray-50`）
- **內容區背景**：白色（`bg-white`）
- **邊框**：淺灰色（`border-gray-200`）
- **文字**：深灰色（`text-gray-900`）
- **次要文字**：中灰色（`text-gray-500`）

### 深色模式
- **標題欄背景**：深灰色半透明（`dark:bg-gray-700/50`）
- **內容區背景**：深灰色（`dark:bg-gray-800`）
- **邊框**：深灰色（`dark:border-gray-700`）
- **文字**：淺灰色（`dark:text-gray-100`）
- **次要文字**：中灰色（`dark:text-gray-400`）

### 互動效果
- **按鈕 hover**：背景變深（`hover:bg-gray-200`）
- **載入動畫**：旋轉的藍色圓圈
- **過渡動畫**：`transition-colors`

---

## 使用範例

### 在發問中上傳 PDF

1. 在發問頁面點擊「📎 上傳檔案」
2. 選擇一個 PDF 檔案
3. 檔案上傳完成後，內容末尾自動添加：
   ```markdown
   [📎 數學作業.pdf](https://res.cloudinary.com/.../math.pdf)
   ```
4. 發布後，PDF 會以內嵌框形式顯示在貼文中

### 在回答中上傳 Word 文件

1. 在回答編輯器上方點擊「📎 上傳檔案」
2. 選擇一個 Word 文件
3. 檔案自動添加到回答內容：
   ```markdown
   [📎 解答說明.docx](https://res.cloudinary.com/.../solution.docx)
   ```
4. 提交後，Word 文件透過 Google Docs Viewer 顯示

---

## 優勢與限制

### ✅ 優勢

1. **智慧顯示模式**：
   - 列表頁保持簡潔，快速瀏覽
   - 詳情頁提供完整預覽，深入查看
2. **效能最佳化**：
   - 避免在列表頁載入大量 iframe
   - 大幅提升主頁載入速度
   - 降低伺服器和客戶端資源消耗
3. **即時預覽**：在詳情頁中，使用者無需下載即可查看內容
4. **保持頁面流程**：不需要離開當前頁面
5. **節省頻寬**：可以先預覽再決定是否下載
6. **更好的使用體驗**：特別適合學術討論場景
7. **支援多種格式**：涵蓋常用文件類型

### ⚠️ 限制

1. **Google Docs Viewer 依賴**
   - 需要網路連線
   - 檔案 URL 必須公開可訪問
   - 載入速度取決於 Google 服務
   - 可能在某些地區受限

2. **檔案大小**
   - 大檔案載入時間較長
   - 可能影響頁面效能

3. **格式保真度**
   - 複雜的 Word 格式可能顯示不完整
   - Excel 公式和巨集不會執行
   - PowerPoint 動畫不會播放

4. **瀏覽器相容性**
   - iframe 在某些舊瀏覽器可能有問題
   - 移動裝置上的體驗可能受限

---

## 故障排除

### 問題：PDF 無法顯示

**可能原因**：
- PDF 檔案損壞
- Cloudinary URL 無效
- 瀏覽器阻擋 iframe

**解決方法**：
1. 檢查瀏覽器控制台錯誤訊息
2. 嘗試在新分頁開啟檔案
3. 確認 Cloudinary URL 可訪問
4. 檢查瀏覽器的 iframe 設定

### 問題：Word 文件顯示空白

**可能原因**：
- Google Docs Viewer 無法訪問檔案
- 網路連線問題
- 檔案格式不相容

**解決方法**：
1. 等待較長時間（首次載入較慢）
2. 重新整理頁面
3. 檢查網路連線
4. 嘗試下載檔案並用本機軟體開啟

### 問題：顯示「無法預覽此檔案」

**可能原因**：
- 不支援的檔案格式
- 載入失敗

**解決方法**：
- 點擊「在新分頁開啟」按鈕
- 或點擊「下載檔案」按鈕下載到本機

---

## 效能考量

### 最佳化建議

1. **lazy loading**：考慮在未來實作延遲載入
2. **檔案大小限制**：建議設定合理的檔案大小上限
3. **快取機制**：利用 Cloudinary 的 CDN 快取
4. **預覽生成**：考慮在上傳時生成縮圖預覽

### 監控指標

- 檔案載入時間
- iframe 渲染效能
- 使用者互動率（開啟 vs 下載）
- 錯誤率

---

## 未來改進方向

1. **本地文件預覽**
   - 實作純前端的 PDF 渲染（如 PDF.js）
   - 減少對第三方服務的依賴

2. **進階功能**
   - 文件內搜尋
   - 頁面跳轉控制
   - 縮放功能

3. **更多檔案類型**
   - 影片檔案內嵌播放
   - 音訊檔案播放器
   - 程式碼檔案語法高亮

4. **協作功能**
   - 文件註解
   - 特定頁面/段落引用
   - 共同編輯

---

## 相關文件

- `FILE_UPLOAD_GUIDE.md` - 檔案上傳完整指南
- `FILE_UPLOAD_TEST.md` - 測試清單
- `components/FileEmbed.tsx` - 組件原始碼
- `components/MarkdownRenderer.tsx` - 渲染器原始碼

---

## 技術規格

### iframe 安全屬性

```html
<iframe
  src="..."
  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
  title="檔案名稱"
/>
```

### Google Docs Viewer URL 格式

```
https://docs.google.com/viewer?url={編碼後的檔案URL}&embedded=true
```

### 支援的 MIME 類型

- `application/pdf`
- `application/msword`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `application/vnd.ms-excel`
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `application/vnd.ms-powerpoint`
- `application/vnd.openxmlformats-officedocument.presentationml.presentation`
- `text/plain`
- `text/markdown`

