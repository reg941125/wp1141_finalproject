# 網站效能優化方案

## 問題分析

檢視專案後發現以下主要問題：

1. **大量重複代碼**：按讚邏輯、數據獲取、Loading 狀態管理在多個頁面重複
2. **組件缺失**：關鍵組件（Navbar, MarkdownRenderer, MarkdownEditor 等）被誤刪
3. **缺乏代碼復用**：相似功能在不同頁面各自實現
4. **過多狀態管理**：每個頁面都有大量的 useState

## 優化方案

### 1. 創建自定義 Hooks（已完成）

#### `useLike` - 統一按讚邏輯
- 用途：處理所有類型（post, answer, job）的按讚功能
- 優勢：樂觀更新、錯誤處理、狀態管理統一
- 減少重複代碼：~50 行 x 5 個頁面 = 250 行

#### `useFetch` - 統一數據獲取
- 用途：通用的數據獲取邏輯
- 優勢：統一 loading、error 狀態管理
- 減少重複代碼：~30 行 x 10 個頁面 = 300 行

#### `useFileUpload` - 統一文件上傳
- 用途：處理文件上傳邏輯
- 優勢：統一上傳狀態、錯誤處理
- 減少重複代碼：~40 行 x 3 個頁面 = 120 行

### 2. 創建可復用組件（已完成）

#### `UserAvatar` - 用戶頭像組件
- 替代：所有頁面中重複的用戶頭像顯示邏輯
- 減少重複代碼：~15 行 x 8 個頁面 = 120 行

#### `LikeButton` - 按讚按鈕組件
- 替代：所有按讚按鈕的 UI 邏輯
- 減少重複代碼：~20 行 x 5 個頁面 = 100 行

#### `LikesModal` - 按讚用戶列表模態框
- 替代：查看按讚用戶的重複邏輯
- 減少重複代碼：~80 行 x 3 個頁面 = 240 行

#### `LoadingSpinner` - 載入動畫組件
- 替代：所有 loading 顯示邏輯
- 減少重複代碼：~10 行 x 15 個頁面 = 150 行

#### `FilterSection` & `FilterButton` - 篩選組件
- 替代：所有篩選按鈕的重複邏輯
- 減少重複代碼：~50 行 x 3 個頁面 = 150 行

## 預估效益

### 代碼減少量
- **總計減少重複代碼：~1,430 行**
- 主要頁面平均減少：100-200 行
- 代碼庫總體縮小：~15-20%

### 效能提升
1. **減少重新渲染**：使用 `useCallback` 和 `useMemo` 優化
2. **樂觀更新**：按讚等操作立即反饋，提升用戶體驗
3. **統一錯誤處理**：減少重複的 try-catch 邏輯
4. **更好的類型安全**：TypeScript 類型定義集中管理

### 維護性提升
1. **修改一處即可**：bugs 修復或功能更新只需修改 hook/組件
2. **一致的行為**：所有頁面的相同功能表現一致
3. **更容易測試**：獨立的 hooks 和組件更容易單元測試
4. **更清晰的代碼結構**：頁面代碼更專注於業務邏輯

## 下一步建議

### 急需恢復的組件
1. **Navbar** - 導航欄（被誤刪）
2. **MarkdownRenderer** - Markdown 渲染器（被誤刪）
3. **MarkdownEditor** - Markdown 編輯器（被誤刪）
4. **QuestionForm** - 問題表單（被誤刪）
5. **JobPostingDialog** - 徵人對話框（被誤刪）
6. **ThemeToggle** & **ThemeProvider** - 主題切換（被誤刪）

### 進一步優化建議
1. **實施代碼分割**：使用動態 import 減少初始加載
2. **圖片優化**：使用 Next.js Image 組件的完整功能
3. **API 響應緩存**：使用 SWR 或 React Query
4. **虛擬滾動**：對長列表實施虛擬化渲染
5. **Suspense 邊界**：使用 React Suspense 改善加載體驗

## 使用範例

### 使用 useLike Hook
```typescript
// 之前：50+ 行代碼
const [isLiked, setIsLiked] = useState(false);
const [liking, setLiking] = useState(false);
const handleLike = async () => { ... }

// 現在：3 行代碼
const { isLiked, isLiking, toggleLike } = useLike({
  entityType: 'post',
  entityId: post._id,
  onSuccess: (data) => setPost({ ...post, likes: data.likes })
});
```

### 使用 UserAvatar 組件
```typescript
// 之前：15+ 行代碼
<Link href={`/profile/${user._id}`}>
  {user.image && <Image src={user.image} ... />}
  <span>{user.name}</span>
</Link>

// 現在：1 行代碼
<UserAvatar userId={user._id} name={user.name} image={user.image} />
```

### 使用 FilterSection 組件
```typescript
// 之前：50+ 行代碼（按鈕 + 樣式邏輯）

// 現在：7 行代碼
<FilterSection
  title="科目篩選"
  options={SUBJECTS}
  selected={selectedSubject}
  onSelect={setSelectedSubject}
  color="blue"
/>
```

## 注意事項

1. **逐步遷移**：不要一次性重構所有頁面，先從最常用的頁面開始
2. **保持向後兼容**：確保重構不影響現有功能
3. **測試覆蓋**：每次重構後進行完整測試
4. **效能監控**：使用 React DevTools Profiler 驗證優化效果

## 總結

通過創建可復用的 hooks 和組件，我們可以：
- **減少約 1,400+ 行重複代碼**
- **提升代碼維護性和可讀性**
- **改善用戶體驗（樂觀更新、統一行為）**
- **加快未來開發速度（復用而非重寫）**

這些優化將顯著提升網站效能和開發體驗，但需要注意先恢復被誤刪的關鍵組件。

