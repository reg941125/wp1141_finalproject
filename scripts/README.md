# 數據遷移腳本

## 科目轉標籤遷移腳本

### 說明

此腳本會將所有貼文的 `subject`（科目）欄位自動轉換為 `tags`（標籤）。

**功能**：
- 掃描所有有 `subject` 欄位的貼文
- 將 `subject` 的值加入到 `tags` 陣列中
- 避免重複（如果 tags 中已有該科目，則跳過）
- 保留原始的 `subject` 欄位（可選擇移除）

### 運行前準備

1. **確保已安裝依賴**：
   ```bash
   npm install
   ```

2. **確保 `.env.local` 檔案存在**且包含 `MONGODB_URI`：
   ```
   MONGODB_URI=mongodb+srv://...
   ```

### 運行方式

#### 方法 1: 使用 ts-node（推薦）

```bash
npx ts-node scripts/migrate-subject-to-tags.ts
```

#### 方法 2: 先編譯再運行

```bash
# 編譯
npx tsc scripts/migrate-subject-to-tags.ts

# 運行
node scripts/migrate-subject-to-tags.js
```

### 運行結果範例

```
正在連接數據庫...
✅ 數據庫連接成功

找到 15 篇有科目的貼文
✅ 已遷移: "微積分問題求解" - 將科目 "數學" 加入標籤
✅ 已遷移: "英文文法疑問" - 將科目 "英文" 加入標籤
⏭️  跳過: "物理力學" (subject "物理" 已在 tags 中)
...

遷移完成！
✅ 成功遷移: 12 篇
⏭️  已跳過: 3 篇
📊 總計: 15 篇

數據庫連接已關閉
🎉 遷移腳本執行完成！
```

### 注意事項

1. **備份建議**：運行前建議先備份數據庫
2. **可重複運行**：腳本會檢查重複，可以安全地多次運行
3. **保留原始數據**：預設保留 `subject` 欄位，如需刪除請取消註解相關代碼
4. **測試環境**：建議先在測試環境運行

### 移除 subject 欄位（可選）

如果確定不再需要 `subject` 欄位，可以取消註解以下行：

```typescript
// 在腳本中找到這行並取消註解
$unset: { subject: '' }
```

### 回滾方式

如果需要回滾（從 tags 移除科目）：

```javascript
// 運行此 MongoDB 命令
db.posts.find().forEach(post => {
  if (post.subject && post.tags && post.tags.includes(post.subject)) {
    db.posts.updateOne(
      { _id: post._id },
      { $pull: { tags: post.subject } }
    );
  }
});
```

### 相關檔案

- `migrate-subject-to-tags.ts` - 主要遷移腳本
- `../app/(main)/page.tsx` - 已更新的首頁（移除科目篩選）
- `../lib/models/Post.ts` - Post 模型定義

### 問題排查

**錯誤：找不到 MONGODB_URI**
- 檢查 `.env.local` 檔案是否存在
- 確認 `MONGODB_URI` 變數是否正確設置

**錯誤：無法連接數據庫**
- 檢查網絡連接
- 確認 MongoDB URI 格式正確
- 檢查 IP 白名單設置（如使用 MongoDB Atlas）

**運行後沒有效果**
- 檢查是否有貼文包含 `subject` 欄位
- 確認數據庫連接的是正確的集合

---

## 其他腳本

未來可能添加的腳本：
- 清理未使用的標籤
- 合併重複的標籤
- 批量更新貼文程度

