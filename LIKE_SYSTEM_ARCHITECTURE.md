# 按讚系統架構說明

## 📊 資料庫設計

### Like 模型 (`/lib/models/Like.ts`)

按讚記錄採用**關聯記錄**方式，而不是簡單的計數器。

```typescript
interface Like {
  _id: ObjectId;
  userId: ObjectId;        // 按讚的用戶
  targetId: ObjectId;      // 被按讚的目標（貼文或回答的 ID）
  targetType: 'Post' | 'Answer';  // 目標類型
  createdAt: Date;         // 按讚時間
}
```

**索引設計**：
- `{ userId, targetId, targetType }` - 唯一索引，確保每個用戶對每個目標只能按一次讚
- `{ targetId, targetType }` - 優化查詢某個目標的所有按讚
- `{ userId }` - 優化查詢某個用戶的所有按讚

**優勢**：
1. ✅ 記錄完整的按讚關係
2. ✅ 可以追溯誰在什麼時候按的讚
3. ✅ 按讚數量是統計結果，不會出現計數不一致
4. ✅ 支援未來的功能擴展（如按讚列表、按讚通知等）

---

## 🔧 API 端點

### 1. 按讚/取消按讚

#### 貼文按讚
- **端點**: `POST /api/posts/[id]/like`
- **功能**: Toggle 按讚狀態
- **返回**: `{ likes: number, isLiked: boolean }`

#### 回答按讚
- **端點**: `POST /api/answers/[id]/like`
- **功能**: Toggle 按讚狀態
- **返回**: `{ likes: number, isLiked: boolean }`

**實現邏輯**：
```typescript
// 檢查是否已按讚
const existingLike = await LikeModel.findOne({
  userId: session.user.id,
  targetId: postId,
  targetType: 'Post',
});

if (existingLike) {
  // 已按讚 → 刪除記錄（取消按讚）
  await LikeModel.deleteOne({ _id: existingLike._id });
} else {
  // 未按讚 → 創建記錄（按讚）
  await LikeModel.create({
    userId: session.user.id,
    targetId: postId,
    targetType: 'Post',
  });
}

// 統計實際按讚數量
const likeCount = await LikeModel.countDocuments({
  targetId: postId,
  targetType: 'Post',
});
```

### 2. 獲取貼文列表（含按讚數）

- **端點**: `GET /api/posts`
- **功能**: 獲取所有貼文，並附帶統計的按讚數量

**實現邏輯**：
```typescript
// 使用 MongoDB 聚合查詢統計每個貼文的按讚數
const likeCounts = await LikeModel.aggregate([
  { 
    $match: { 
      targetId: { $in: postIds },
      targetType: 'Post'
    } 
  },
  { $group: { _id: '$targetId', count: { $sum: 1 } } },
]);
```

### 3. 獲取單個貼文（含按讚數）

- **端點**: `GET /api/posts/[id]`
- **功能**: 獲取貼文詳情，並統計按讚數量

**實現邏輯**：
```typescript
const likeCount = await LikeModel.countDocuments({
  targetId: postId,
  targetType: 'Post',
});
```

### 4. 獲取按讚用戶列表

- **端點**: `GET /api/posts/[id]/likers`
- **功能**: 獲取按讚此貼文的所有用戶
- **返回**: 
  ```json
  {
    "postId": "...",
    "totalLikes": 10,
    "likers": [
      {
        "userId": { "name": "...", "image": "..." },
        "likedAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
  ```

### 5. 獲取用戶按讚的貼文列表

- **端點**: `GET /api/users/[id]/liked-posts`
- **功能**: 獲取某個用戶按過讚的所有貼文
- **返回**:
  ```json
  {
    "userId": "...",
    "totalLikedPosts": 5,
    "likedPosts": [
      {
        "post": { "title": "...", "content": "..." },
        "likedAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
  ```

### 6. 查詢按讚狀態

#### 批量查詢（首頁列表）
- **端點**: `POST /api/posts/likes-status`
- **功能**: 一次查詢多個貼文的按讚狀態
- **請求**: `{ postIds: string[] }`
- **返回**: `{ likedPostIds: string[] }`

#### 單個貼文查詢（詳情頁）
- **端點**: `GET /api/posts/[id]/like-status?answerIds=...`
- **功能**: 查詢貼文和其回答的按讚狀態
- **返回**: `{ isPostLiked: boolean, likedAnswerIds: string[] }`

---

## 🎯 核心特點

### 1. 數據一致性
- ✅ 按讚數量 = 實際 `Like` 記錄數量
- ✅ 不會出現計數器不一致的問題
- ✅ 刪除貼文時，相關的 `Like` 記錄可以級聯刪除（可選實現）

### 2. 功能完整性
- ✅ 記錄「誰」按讚了「什麼」
- ✅ 記錄「什麼時候」按的讚
- ✅ 支援查詢「某個貼文有哪些人按讚」
- ✅ 支援查詢「某個用戶按過哪些貼文的讚」

### 3. 性能優化
- ✅ 使用索引優化查詢
- ✅ 使用聚合查詢批量統計
- ✅ 前端緩存按讚狀態，減少重複請求

### 4. 用戶體驗
- ✅ 一鍵 Toggle 按讚/取消
- ✅ 藍色圖標顯示已按讚狀態
- ✅ 實時更新按讚數量
- ✅ 防止重複點擊

---

## 📈 統計查詢範例

### 查詢最受歡迎的貼文
```typescript
const topPosts = await LikeModel.aggregate([
  { $match: { targetType: 'Post' } },
  { $group: { _id: '$targetId', likes: { $sum: 1 } } },
  { $sort: { likes: -1 } },
  { $limit: 10 },
]);
```

### 查詢最活躍的按讚用戶
```typescript
const topLikers = await LikeModel.aggregate([
  { $match: { targetType: 'Post' } },
  { $group: { _id: '$userId', totalLikes: { $sum: 1 } } },
  { $sort: { totalLikes: -1 } },
  { $limit: 10 },
]);
```

### 查詢某個用戶的按讚統計
```typescript
const userLikeStats = await LikeModel.aggregate([
  { $match: { userId: userObjectId } },
  { $group: { 
    _id: '$targetType', 
    count: { $sum: 1 } 
  } },
]);
// 結果: { Post: 10, Answer: 5 }
```

---

## 🔄 遷移指南（如果從舊系統遷移）

如果原本使用計數器方式（`Post.likes` 字段），遷移步驟：

1. **保留舊的 `likes` 字段**（作為備份或快取）
2. **創建 `Like` 集合**並建立索引
3. **統一使用 `LikeModel.countDocuments()` 來獲取按讚數**
4. **可選：定期同步 `likes` 字段**作為緩存，提升查詢效能

```typescript
// 同步腳本範例
const posts = await PostModel.find();
for (const post of posts) {
  const likeCount = await LikeModel.countDocuments({
    targetId: post._id,
    targetType: 'Post',
  });
  post.likes = likeCount;
  await post.save();
}
```

---

## ✅ 總結

新的按讚系統完全基於**關聯記錄**，而非簡單計數器：

| 特性 | 舊系統（計數器） | 新系統（關聯記錄） |
|------|-----------------|-------------------|
| 按讚數量 | `Post.likes` 字段 | 統計 `Like` 記錄 |
| 數據完整性 | 可能不一致 | ✅ 保證一致 |
| 按讚歷史 | ❌ 無記錄 | ✅ 完整記錄 |
| 誰按的讚 | ❌ 不知道 | ✅ 可查詢 |
| 按讚時間 | ❌ 不知道 | ✅ 有記錄 |
| 功能擴展 | ❌ 受限 | ✅ 靈活 |

這是一個更加健全和可擴展的設計！🎉

