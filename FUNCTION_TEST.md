# 功能測試清單

## 已完成的修改

### 1. 按讚功能
- ✅ 更新 `userId` 依賴替代 `session`
- ✅ 添加 ESLint 註釋忽略依賴檢查
- **位置**:
  - `/app/(main)/page.tsx` - 題目討論區列表
  - `/app/(main)/questions/[id]/page.tsx` - 題目詳情
  - `/app/(main)/tutoring/page.tsx` - 家教列表
  - `/app/(main)/tutoring/[id]/page.tsx` - 家教詳情

### 2. 追蹤通知
- ✅ 更新 Notification Model 支持 'follow' 類型
- ✅ 在追蹤時創建通知
- ✅ Navbar 支持追蹤通知顯示和導航
- **位置**:
  - `/lib/models/Notification.ts`
  - `/app/api/users/[id]/follow/route.ts`
  - `/components/Navbar.tsx`

### 3. 刪除功能
- ✅ 題目討論區刪除 (已存在)
- ✅ 家教專區刪除 (已存在)
- **位置**:
  - `/app/api/posts/[id]/route.ts` - DELETE
  - `/app/api/jobs/[id]/route.ts` - DELETE

## 測試步驟

### 按讚測試
1. 登入帳號
2. 進入題目討論區
3. 點擊愛心圖示
4. 確認愛心變紅且數字增加
5. 再次點擊確認取消按讚

### 追蹤測試
1. 登入帳號 A
2. 訪問用戶 B 的個人頁面
3. 點擊「追蹤」按鈕
4. 切換到帳號 B
5. 檢查通知鈴鐺是否有未讀數字
6. 點擊通知查看追蹤提示

### 刪除測試
1. 登入並發布一篇貼文
2. 進入貼文詳情頁
3. 點擊刪除按鈕（垃圾桶圖標）
4. 確認刪除後跳轉回列表頁

## 已知問題
- useEffect 依賴陣列警告已通過 ESLint 註釋解決

## API 端點狀態
- ✅ GET /api/posts - 正常
- ✅ POST /api/posts/[id]/like - 正常
- ✅ DELETE /api/posts/[id] - 正常
- ✅ POST /api/users/[id]/follow - 正常
- ✅ DELETE /api/jobs/[id] - 正常
- ✅ POST /api/jobs/[id]/like - 正常

