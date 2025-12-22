# 遷移指南 - 使用新的 Hooks 和組件

## 概述

本指南將幫助你逐步將現有頁面遷移到使用新的可復用 hooks 和組件。

## 遷移優先級

### 高優先級（建議立即遷移）
1. ✅ **關鍵組件已恢復**
   - Navbar.tsx
   - MarkdownRenderer.tsx
   - MarkdownEditor.tsx
   - QuestionForm.tsx
   - JobPostingDialog.tsx
   - ThemeProvider.tsx
   - ThemeToggle.tsx

### 中優先級（建議本週完成）
2. **主要頁面**
   - `app/(main)/page.tsx` - 題目討論區首頁
   - `app/(main)/questions/[id]/page.tsx` - 題目詳情頁
   - `app/(main)/tutoring/[id]/page.tsx` - 徵人詳情頁

### 低優先級（可逐步完成）
3. **次要頁面**
   - `app/(main)/tutoring/seeking-students/page.tsx`
   - `app/(main)/tutoring/seeking-tutors/page.tsx`
   - `app/(main)/library/page.tsx`
   - `app/(main)/profile/[userId]/page.tsx`

## 逐步遷移步驟

### 步驟 1: 遷移用戶頭像顯示

#### 查找並替換
```bash
# 查找所有用戶頭像顯示的地方
grep -r "authorId.image" app/(main)/
```

#### 替換前
```typescript
<div className="flex items-center gap-2">
  {(post.authorId.customImage || post.authorId.image) && (
    <Image
      src={post.authorId.customImage || post.authorId.image}
      alt={post.authorId.name}
      width={32}
      height={32}
      className="rounded-full"
    />
  )}
  <span className="text-sm text-gray-600 dark:text-gray-400">
    {post.authorId.name}
  </span>
</div>
```

#### 替換後
```typescript
import UserAvatar from '@/components/UserAvatar';

<UserAvatar
  userId={post.authorId._id}
  name={post.authorId.name}
  image={post.authorId.image}
  customImage={post.authorId.customImage}
/>
```

### 步驟 2: 遷移按讚功能

#### 替換前（~50 行）
```typescript
const [isLiked, setIsLiked] = useState(false);
const [liking, setLiking] = useState(false);

const handleLike = async () => {
  if (!session) {
    alert('請先登入才能按讚');
    return;
  }
  if (liking) return;
  
  setLiking(true);
  try {
    const response = await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
    });
    if (response.ok) {
      const data = await response.json();
      setIsLiked(data.isLiked);
      setPost({ ...post, likes: data.likes });
    }
  } catch (error) {
    console.error(error);
  } finally {
    setLiking(false);
  }
};

// 獲取按讚狀態
useEffect(() => {
  if (session?.user?.id) {
    fetch(`/api/posts/${postId}/like`)
      .then(res => res.json())
      .then(data => setIsLiked(data.liked));
  }
}, [postId, session]);
```

#### 替換後（~5 行）
```typescript
import { useLike } from '@/hooks/useLike';
import LikeButton from '@/components/LikeButton';

const { isLiked, isLiking, toggleLike, fetchLikeStatus } = useLike({
  entityType: 'post',
  entityId: postId,
  onSuccess: (data) => setPost({ ...post, likes: data.likes })
});

// 初始化時獲取狀態
useEffect(() => {
  fetchLikeStatus();
}, [fetchLikeStatus]);

// 使用組件
<LikeButton
  isLiked={isLiked}
  likes={post.likes}
  onLike={toggleLike}
  isLiking={isLiking}
  variant="thumb"
/>
```

### 步驟 3: 遷移篩選器

#### 替換前（~50 行）
```typescript
<div className="flex flex-wrap gap-2">
  <button
    onClick={() => setSelectedSubject('')}
    className={`px-3 py-1 rounded-full text-sm ${
      selectedSubject === ''
        ? 'bg-blue-600 text-white'
        : 'bg-gray-200 text-gray-700'
    }`}
  >
    全部
  </button>
  {SUBJECTS.map((subject) => (
    <button
      key={subject}
      onClick={() => setSelectedSubject(subject)}
      className={`px-3 py-1 rounded-full text-sm ${
        selectedSubject === subject
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 text-gray-700'
      }`}
    >
      {subject}
    </button>
  ))}
</div>
```

#### 替換後（~7 行）
```typescript
import FilterSection from '@/components/FilterSection';

<FilterSection
  title="科目篩選"
  options={SUBJECTS}
  selected={selectedSubject}
  onSelect={setSelectedSubject}
  color="blue"
/>
```

### 步驟 4: 遷移載入狀態

#### 替換前
```typescript
{loading ? (
  <div className="text-center py-12 text-gray-700 dark:text-gray-300">
    載入中...
  </div>
) : (
  // 內容
)}
```

#### 替換後
```typescript
import LoadingSpinner from '@/components/LoadingSpinner';

{loading ? <LoadingSpinner /> : /* 內容 */}
```

### 步驟 5: 遷移按讚用戶列表

#### 替換前（~80 行）
```typescript
const [showLikesModal, setShowLikesModal] = useState(false);
const [likeUsers, setLikeUsers] = useState([]);

const handleShowLikes = async () => {
  const response = await fetch(`/api/posts/${postId}/likes`);
  const data = await response.json();
  setLikeUsers(data.users);
  setShowLikesModal(true);
};

{showLikesModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg max-w-md w-full">
      <div className="p-4 border-b">
        <h3>按讚的人</h3>
        <button onClick={() => setShowLikesModal(false)}>✕</button>
      </div>
      <div className="p-4">
        {likeUsers.map(user => (
          <div key={user._id}>
            <Image src={user.image} alt={user.name} width={40} height={40} />
            <span>{user.name}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
```

#### 替換後（~15 行）
```typescript
import LikesModal from '@/components/LikesModal';

const [showLikesModal, setShowLikesModal] = useState(false);
const [likeUsers, setLikeUsers] = useState([]);

const handleShowLikes = async () => {
  const response = await fetch(`/api/posts/${postId}/likes`);
  const data = await response.json();
  setLikeUsers(data.users);
  setShowLikesModal(true);
};

{showLikesModal && (
  <LikesModal
    users={likeUsers}
    onClose={() => setShowLikesModal(false)}
  />
)}
```

## 完整頁面遷移範例

### 遷移 `app/(main)/questions/[id]/page.tsx`

#### 1. 添加 imports
```typescript
// 新增
import { useLike } from '@/hooks/useLike';
import UserAvatar from '@/components/UserAvatar';
import LikeButton from '@/components/LikeButton';
import LikesModal from '@/components/LikesModal';
import LoadingSpinner from '@/components/LoadingSpinner';
```

#### 2. 替換按讚邏輯
```typescript
// 刪除舊的 state 和函數
// const [isPostLiked, setIsPostLiked] = useState(false);
// const [liking, setLiking] = useState(false);
// const handleLike = async () => { ... }

// 使用新的 hook
const { 
  isLiked: isPostLiked, 
  isLiking: liking, 
  toggleLike: handlePostLike,
  fetchLikeStatus 
} = useLike({
  entityType: 'post',
  entityId: params.id as string,
  onSuccess: (data) => setPost({ ...post!, likes: data.likes })
});
```

#### 3. 替換用戶頭像
```typescript
// 查找所有類似的代碼並替換
<UserAvatar
  userId={post.authorId._id}
  name={post.authorId.name}
  image={post.authorId.image}
  customImage={post.authorId.customImage}
/>
```

#### 4. 替換按讚按鈕
```typescript
<LikeButton
  isLiked={isPostLiked}
  likes={post.likes}
  onLike={handlePostLike}
  isLiking={liking}
  variant="thumb"
/>
```

#### 5. 替換載入狀態
```typescript
if (loading) return <LoadingSpinner />;
```

## 測試清單

遷移完成後，請確保以下功能正常：

### 基本功能
- [ ] 頁面正常載入
- [ ] 用戶頭像正確顯示
- [ ] 點擊頭像可跳轉到個人頁面
- [ ] 按讚功能正常
- [ ] 按讚數正確更新
- [ ] 篩選器正常工作

### 邊界情況
- [ ] 未登入用戶點擊按讚顯示提示
- [ ] 快速連續點擊按讚不會出錯
- [ ] 網路錯誤時有適當提示
- [ ] 圖片載入失敗時有 fallback

### 效能
- [ ] 頁面載入速度沒有變慢
- [ ] 按讚響應速度快（樂觀更新）
- [ ] 沒有不必要的重新渲染

## 常見問題

### Q: 遷移後頁面報錯怎麼辦？
A: 檢查以下幾點：
1. 確保所有 imports 正確
2. 檢查組件 props 是否完整
3. 查看瀏覽器控制台的具體錯誤訊息
4. 確認 hooks 的使用符合 React 規則（只在函數組件頂層使用）

### Q: 可以部分遷移嗎？
A: 可以！建議逐個功能遷移，每次遷移後測試確保正常。

### Q: 遷移會影響現有功能嗎？
A: 不會。新的 hooks 和組件是對現有邏輯的封裝，功能完全相同。

### Q: 需要修改 API 嗎？
A: 不需要。所有 API 保持不變。

## 下一步

完成遷移後：
1. 刪除舊的重複代碼
2. 運行完整測試
3. 監控效能指標
4. 收集用戶反饋

## 支援

如遇到問題，請查看：
- `OPTIMIZATION_SUMMARY.md` - 優化方案總覽
- `USAGE_EXAMPLES.md` - 詳細使用範例
- 組件源碼中的 TypeScript 類型定義

