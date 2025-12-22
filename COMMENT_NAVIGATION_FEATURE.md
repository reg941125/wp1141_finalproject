# 留言區導航功能

## 功能概述

當使用者在貼文列表頁點擊留言圖示時，系統會：
1. 導航到貼文詳情頁
2. 自動滾動到留言區（回答問題區域）
3. 讓輸入框自動獲得焦點，可以立即開始輸入

---

## 使用者體驗流程

### 在主頁瀏覽貼文

```
┌─────────────────────────────────────┐
│ 📝 數學題目討論                      │
│                                     │
│ 這是一個關於微積分的問題...           │
│                                     │
│ 👁 123  👍 45  💬 12  📤             │
│                  ↑                  │
│            點擊留言圖示              │
└─────────────────────────────────────┘
```

### 導航到詳情頁並自動定位

```
瀏覽器導航到：/questions/[id]#answer
         ↓
    頁面載入完成
         ↓
  自動滾動到留言區
         ↓
   輸入框獲得焦點
         ↓
  使用者可以直接輸入
```

---

## 技術實現

### 1. 主頁留言圖示 (`app/(main)/page.tsx`)

#### 原本的實現
```tsx
<div className="flex items-center space-x-1">
  <BiSolidMessageCheck className="w-4 h-4" />
  <span>{post.answersCount ?? 0}</span>
</div>
```

#### 修改後的實現
```tsx
<Link
  href={`/questions/${post._id}#answer`}
  onClick={(e) => e.stopPropagation()}
  className="flex items-center space-x-1 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
  title="查看留言"
>
  <BiSolidMessageCheck className="w-4 h-4" />
  <span>{post.answersCount ?? 0}</span>
</Link>
```

**關鍵改動**：
- 將 `div` 改為 `Link` 組件
- 添加 `href={`/questions/${post._id}#answer`}` - 導航時帶上 `#answer` hash
- 添加 `onClick={(e) => e.stopPropagation()}` - 防止觸發外層貼文卡片的點擊事件
- 添加 hover 效果和 title 提示

---

### 2. MarkdownEditor 組件 (`components/MarkdownEditor.tsx`)

#### 新增 Props
```typescript
interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showPreview?: boolean;
  autoFocus?: boolean; // 新增：是否自動聚焦
}
```

#### 自動聚焦邏輯
```typescript
// Handle autoFocus
useEffect(() => {
  if (autoFocus && textareaRef.current) {
    textareaRef.current.focus();
  }
}, [autoFocus]);
```

**功能**：
- 當 `autoFocus={true}` 時，輸入框會自動獲得焦點
- 使用內部的 `textareaRef` 來控制焦點

---

### 3. 問題詳情頁 (`app/(main)/questions/[id]/page.tsx`)

#### 新增 State 和 Ref
```typescript
const [shouldAutoFocus, setShouldAutoFocus] = useState(false);
const answerSectionRef = useRef<HTMLDivElement>(null);
```

#### Hash 檢測和滾動邏輯
```typescript
// 檢測 URL hash，如果是 #answer 則滾動到留言區並聚焦輸入框
useEffect(() => {
  if (typeof window !== 'undefined' && window.location.hash === '#answer' && !loading && post) {
    setShouldAutoFocus(true);
    // 等待頁面渲染完成
    const timer = setTimeout(() => {
      if (answerSectionRef.current) {
        answerSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }
}, [post, loading]);
```

**關鍵點**：
1. 檢查 `window.location.hash === '#answer'`
2. 等待 `!loading && post` 確保頁面載入完成
3. 設置 `setShouldAutoFocus(true)` 讓輸入框聚焦
4. 延遲 300ms 確保 DOM 完全渲染
5. 使用 `scrollIntoView({ behavior: 'smooth', block: 'start' })` 平滑滾動

#### 回答區域標記
```tsx
<div 
  ref={answerSectionRef}
  id="answer"
  className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors"
>
  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">回答問題</h2>
  <form onSubmit={handleSubmitAnswer}>
    {/* ... */}
    <MarkdownEditor
      value={answerContent}
      onChange={setAnswerContent}
      placeholder="輸入您的解答..."
      autoFocus={shouldAutoFocus}
    />
  </form>
</div>
```

**關鍵點**：
1. 添加 `ref={answerSectionRef}` 用於滾動定位
2. 添加 `id="answer"` 作為錨點（可選）
3. 將 `autoFocus={shouldAutoFocus}` 傳給 MarkdownEditor

---

## 時序圖

```
使用者點擊留言圖示
    ↓
導航到 /questions/[id]#answer
    ↓
頁面開始載入 (loading=true)
    ↓
fetchPost() + fetchAnswers()
    ↓
頁面載入完成 (loading=false, post 存在)
    ↓
useEffect 檢測到 hash === '#answer'
    ↓
setShouldAutoFocus(true)
    ↓
延遲 300ms（等待 DOM 渲染）
    ↓
answerSectionRef.current.scrollIntoView()
    ↓
平滑滾動到留言區
    ↓
MarkdownEditor 接收 autoFocus={true}
    ↓
textareaRef.current.focus()
    ↓
輸入框獲得焦點 ✅
    ↓
使用者可以直接輸入
```

---

## 視覺效果

### 點擊前（主頁）
```
📝 微積分問題討論
這是關於極限的問題...

👁 123  👍 45  💬 12 ← (hover 時變藍色)
```

### 點擊後（詳情頁）
```
[頁面自動滾動動畫]
    ↓
    ↓
    ↓
┌─────────────────────────────────┐
│ 📝 回答問題                      │
├─────────────────────────────────┤
│ 解答內容              📎 上傳檔案│
├─────────────────────────────────┤
│ |← 光標閃爍                      │  ← 自動聚焦
│ 輸入您的解答...                  │
│                                 │
└─────────────────────────────────┘
```

---

## 優勢

### 🚀 使用者體驗提升
1. **一鍵直達**：點擊留言數字直接到達輸入框，無需手動滾動
2. **即刻輸入**：自動聚焦讓使用者可以立即開始打字
3. **流暢動畫**：平滑滾動提供良好的視覺反饋
4. **明確意圖**：hover 效果和 title 提示清楚表明這是可點擊的

### 💡 設計考量
1. **防止誤觸**：使用 `e.stopPropagation()` 避免觸發貼文卡片的點擊
2. **漸進增強**：即使 JavaScript 未載入，`#answer` hash 仍然有效
3. **載入等待**：確保頁面完全載入後才執行滾動和聚焦
4. **清理資源**：使用 cleanup function 清除 timer

---

## 瀏覽器相容性

| 功能 | 支援度 |
|-----|--------|
| `scrollIntoView()` | ✅ 所有現代瀏覽器 |
| `behavior: 'smooth'` | ✅ Chrome 61+, Firefox 36+, Safari 15.4+ |
| `focus()` | ✅ 所有瀏覽器 |
| URL hash | ✅ 所有瀏覽器 |

**備註**：Safari 較舊版本可能不支援 smooth scroll，但會降級為普通滾動，不影響功能。

---

## 未來改進

### 可能的增強功能

1. **回到頂部按鈕**
   - 滾動到留言區後，顯示「回到頂部」按鈕
   - 方便使用者返回閱讀貼文內容

2. **滾動位置記憶**
   - 記住使用者的滾動位置
   - 返回時恢復到相同位置

3. **快捷鍵支援**
   - 按 `C` 鍵快速聚焦到留言輸入框
   - 按 `Esc` 取消聚焦

4. **動畫指示器**
   - 滾動時顯示進度指示
   - 到達目標時顯示高亮動畫

5. **智慧滾動**
   - 根據螢幕高度調整滾動位置
   - 確保輸入框在視窗中央

---

## 測試場景

### ✅ 功能測試

1. **基本流程**
   - [ ] 在主頁點擊留言圖示
   - [ ] 確認導航到詳情頁
   - [ ] 確認頁面自動滾動到留言區
   - [ ] 確認輸入框自動獲得焦點

2. **邊界情況**
   - [ ] 貼文沒有回答時
   - [ ] 使用者未登入時（應該不顯示輸入框）
   - [ ] 網路緩慢時（等待載入完成）

3. **互動測試**
   - [ ] 點擊留言圖示不應觸發貼文卡片點擊
   - [ ] hover 效果正常顯示
   - [ ] 聚焦後可以立即輸入文字

4. **瀏覽器測試**
   - [ ] Chrome/Edge
   - [ ] Firefox
   - [ ] Safari
   - [ ] 移動瀏覽器

---

## 相關檔案

- `app/(main)/page.tsx` - 主頁留言圖示
- `app/(main)/questions/[id]/page.tsx` - 詳情頁滾動邏輯
- `components/MarkdownEditor.tsx` - 輸入框聚焦邏輯

---

## 常見問題

### Q: 為什麼要延遲 300ms 才滾動？

A: 需要確保 React 完成渲染並且 DOM 元素完全掛載。如果立即滾動，`answerSectionRef.current` 可能還是 `null`。

### Q: 可以改成立即跳轉不要平滑滾動嗎？

A: 可以，將 `behavior: 'smooth'` 改為 `behavior: 'instant'` 或 `behavior: 'auto'`。

### Q: 如果使用者已經在詳情頁怎麼辦？

A: hash 邏輯只在頁面載入時觸發。如果已經在頁面上，點擊留言圖示需要從主頁過來才會觸發。

### Q: 可以用在其他頁面嗎？

A: 可以！這個模式可以應用到任何需要「點擊導航並聚焦」的場景，例如：
- 回覆特定留言
- 編輯個人資料
- 搜尋功能

---

## 總結

這個功能大幅提升了留言互動的使用者體驗：
- ✅ **快速**：一鍵直達留言區
- ✅ **流暢**：平滑滾動動畫
- ✅ **直覺**：自動聚焦立即輸入
- ✅ **穩定**：完善的載入和錯誤處理

是現代 web 應用的標準互動模式，參考了 Reddit、Twitter、GitHub 等主流平台的設計。

